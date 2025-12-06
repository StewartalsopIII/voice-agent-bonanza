import { NextResponse } from 'next/server';
import { createCall, getCallByVapiId } from '@/lib/queries/calls';
import { getAgentByVapiId } from '@/lib/queries/agents';
import { mapEndedReasonToStatus } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Safely log the message type
    const messageType = body.message?.type || 'unknown';
    console.log('[Webhook] Received:', messageType);

    // Handle end-of-call-report
    if (messageType === 'end-of-call-report') {
      const call = body.message.call || body.message;

      // Debug: log the call data structure
      console.log('[Webhook] Call data:', JSON.stringify({
        id: call.id,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        endedReason: call.endedReason,
        assistantId: call.assistantId,
        hasArtifact: !!call.artifact,
        hasMessages: !!call.messages
      }));

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
        call.metadata?.callerInfo ||
        call.metadata?.caller ||
        call.customer?.number ||
        (agent?.type === 'personal' ? agent.created_for : null) ||
        'Unknown';

      // Map ended reason to our status
      const status = mapEndedReasonToStatus(call.endedReason || 'unknown');

      // Calculate duration
      const startedAt = call.startedAt ? new Date(call.startedAt) : null;
      const endedAt = call.endedAt ? new Date(call.endedAt) : null;
      const durationSeconds = startedAt && endedAt
        ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
        : call.duration || null;

      // Extract transcript
      const transcript = call.artifact?.messages || call.messages || null;

      // Extract cost breakdown
      const costBreakdown = call.costBreakdown || null;
      const costTotal = call.cost || null;

      // Create call record
      const newCall = await createCall({
        vapi_call_id: call.id,
        agent_id: agent?.id || null,
        caller,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        status,
        ended_reason: call.endedReason || null,
        transcript,
        recording_url: call.artifact?.recordingUrl || call.recordingUrl || null,
        cost_total: costTotal,
        cost_breakdown: costBreakdown,
        metadata: call.metadata || null,
        analysis: call.analysis || null,
      });

      console.log('[Webhook] Created call:', newCall.id);

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
