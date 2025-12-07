import { NextResponse } from 'next/server';
import {
  getAgentById,
  updateAgent,
  deleteAgent,
  hardDeleteAgent,
  isAgentNameAvailable,
  resetCallCount,
} from '@/lib/queries/agents';
import { getRecentCallsForAgent } from '@/lib/queries/calls';
import {
  updateAssistant,
  deleteAssistant,
  VapiError,
} from '@/lib/vapi';
import { validateUpdateAgent, isValidUUID } from '@/lib/validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/agents/[id]
 * Get a single agent with full details and recent calls
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('include_deleted') === 'true';

    const agent = await getAgentById(id, includeDeleted);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get recent calls for this agent
    const recentCalls = await getRecentCallsForAgent(id, 5);

    return NextResponse.json({
      ...agent,
      recent_calls: recentCalls.map(call => ({
        id: call.id,
        caller: call.caller,
        duration_seconds: call.duration_seconds,
        status: call.status,
        started_at: call.started_at,
      })),
    });

  } catch (error) {
    console.error('Error getting agent:', error);
    return NextResponse.json(
      { error: 'Failed to get agent' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agents/[id]
 * Update an agent and sync changes to Vapi
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = validateUpdateAgent(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Get current agent
    const existingAgent = await getAgentById(id);
    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // If changing name, check availability
    if (body.name && body.name !== existingAgent.name) {
      const normalizedName = body.name.trim().toLowerCase();
      const available = await isAgentNameAvailable(normalizedName, id);
      if (!available) {
        return NextResponse.json(
          { error: 'Agent name already exists', field: 'name' },
          { status: 409 }
        );
      }
      body.name = normalizedName;
    }

    // If changing type to personal, require created_for
    if (body.type === 'personal' && !body.created_for && !existingAgent.created_for) {
      return NextResponse.json(
        { error: 'created_for is required for personal agents', field: 'created_for' },
        { status: 400 }
      );
    }

    // Determine if we need to update Vapi
    const vapiFields = ['first_message', 'system_prompt', 'voice_provider', 'voice_id', 'model', 'temperature', 'max_duration_seconds'];
    const needsVapiUpdate = vapiFields.some(field => body[field] !== undefined);

    // Update Vapi assistant if needed
    if (needsVapiUpdate && existingAgent.vapi_assistant_id) {
      try {
        // Ensure numeric fields are actually numbers, not strings
        const temperature = body.temperature !== undefined
          ? Number(body.temperature)
          : Number(existingAgent.temperature);
        const maxDurationSeconds = body.max_duration_seconds !== undefined
          ? Number(body.max_duration_seconds)
          : Number(existingAgent.max_duration_seconds);

        await updateAssistant(existingAgent.vapi_assistant_id, {
          name: body.name ?? existingAgent.name,
          firstMessage: body.first_message ?? existingAgent.first_message,
          systemPrompt: body.system_prompt ?? existingAgent.system_prompt,
          voiceProvider: body.voice_provider ?? existingAgent.voice_provider,
          voiceId: body.voice_id ?? existingAgent.voice_id,
          model: body.model ?? existingAgent.model,
          temperature,
          maxDurationSeconds,
        });
      } catch (error) {
        console.error('Failed to update Vapi assistant:', error);
        if (error instanceof VapiError) {
          console.error('Vapi error details:', JSON.stringify(error.details, null, 2));
          return NextResponse.json(
            { error: 'Failed to update voice assistant', details: error.details },
            { status: 502 }
          );
        }
        throw error;
      }
    }

    // Handle reset call count if requested
    if (body.reset_call_count === true) {
      await resetCallCount(id);
      delete body.reset_call_count;
    }

    // Update agent in database
    const updatedAgent = await updateAgent(id, body);

    return NextResponse.json(updatedAgent);

  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]
 * Soft delete an agent (or hard delete with ?hard=true)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Get the agent first
    const agent = await getAgentById(id, true); // Include deleted to handle edge cases
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (hardDelete) {
      // Hard delete: remove from Vapi and database
      if (agent.vapi_assistant_id) {
        try {
          await deleteAssistant(agent.vapi_assistant_id);
        } catch (error) {
          // Log but don't fail if Vapi deletion fails
          console.error('Failed to delete Vapi assistant:', error);
        }
      }

      const deleted = await hardDeleteAgent(id);
      if (!deleted) {
        return NextResponse.json(
          { error: 'Failed to delete agent' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        deleted: true,
        id,
        hard: true,
      });

    } else {
      // Soft delete: just mark as deleted
      const deleted = await deleteAgent(id);
      if (!deleted) {
        return NextResponse.json(
          { error: 'Agent not found or already deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        deleted: true,
        id,
        hard: false,
      });
    }

  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
