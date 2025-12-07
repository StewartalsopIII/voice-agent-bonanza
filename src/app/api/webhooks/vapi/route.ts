import { NextResponse } from 'next/server';
import { createCall, getCallByVapiId } from '@/lib/queries/calls';
import { getAgentByVapiId, incrementCallCount } from '@/lib/queries/agents';
import { mapEndedReasonToStatus } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Safely log the message type
    const messageType = body.message?.type || 'unknown';
    console.log('[Webhook] Received:', messageType);

    // Handle end-of-call-report
    if (messageType === 'end-of-call-report') {
      const message = body.message;
      const call = message.call;

      // Check if we already processed this call
      const existingCall = await getCallByVapiId(call.id);
      if (existingCall) {
        console.log('[Webhook] Call already processed:', call.id);
        return NextResponse.json({ received: true, duplicate: true });
      }

      // Find the agent by Vapi assistant ID
      const agent = call.assistantId
        ? await getAgentByVapiId(call.assistantId)
        : null;

      // Extract caller info from metadata or use defaults
      const caller =
        message.assistant?.metadata?.callerInfo ||
        call.assistantOverrides?.metadata?.callerInfo ||
        'Unknown';

      // Map ended reason to our status
      const status = mapEndedReasonToStatus(message.endedReason || 'unknown');

      // Get dates from message level (not call level)
      const startedAt = message.startedAt ? new Date(message.startedAt) : null;
      const endedAt = message.endedAt ? new Date(message.endedAt) : null;
      const durationSeconds = message.durationSeconds ? Math.floor(message.durationSeconds) : null;

      // Extract and transform transcript from message level
      // Vapi uses "message" field, but we need "content" for our UI
      const rawMessages = message.messages || message.artifact?.messages || null;
      const transcript = rawMessages ? rawMessages.map((msg: any) => ({
        role: msg.role === 'bot' ? 'assistant' : msg.role,
        content: msg.message || msg.content || ''
      })).filter((msg: any) => msg.role !== 'system') : null;

      // Extract cost breakdown from message level
      const costBreakdown = message.costBreakdown || null;
      const costTotal = message.cost || null;

      // Create call record
      const newCall = await createCall({
        vapi_call_id: call.id,
        agent_id: agent?.id || null,
        caller,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        status,
        ended_reason: message.endedReason || null,
        transcript,
        recording_url: message.recordingUrl || message.artifact?.recordingUrl || null,
        cost_total: costTotal,
        cost_breakdown: costBreakdown,
        metadata: call.assistantOverrides?.metadata || null,
        analysis: message.analysis || null,
      });

      console.log('[Webhook] Created call:', newCall.id);

      // Increment call count for the agent (for call limit tracking)
      if (agent?.id) {
        await incrementCallCount(agent.id);
        console.log('[Webhook] Incremented call count for agent:', agent.id);
      }

      return NextResponse.json({
        received: true,
        callId: newCall.id
      });
    }

    // Handle other webhook types (status-update, transcript, etc.)
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Also handle GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
