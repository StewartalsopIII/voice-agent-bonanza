import { NextResponse } from 'next/server';
import { createAgent, getAgents, isAgentNameAvailable } from '@/lib/queries/agents';
import { createAssistant, VapiError } from '@/lib/vapi';
import { validateCreateAgent } from '@/lib/validation';
import { AGENT_DEFAULTS } from '@/lib/constants';
import type { AgentType } from '@/types';

/**
 * GET /api/agents
 * List all agents with call statistics
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const type = searchParams.get('type') as AgentType | null;

    const agents = await getAgents({
      includeDeleted,
      type: type || undefined,
    });

    // Remove system_prompt from list view for security/performance
    const sanitizedAgents = agents.map(({ system_prompt, ...agent }) => agent);

    return NextResponse.json({
      agents: sanitizedAgents,
      total: agents.length,
    });

  } catch (error) {
    console.error('Error listing agents:', error);
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * Create a new agent and corresponding Vapi assistant
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateCreateAgent(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Normalize the name to lowercase slug
    const name = body.name.trim().toLowerCase();

    // Check name availability
    const available = await isAgentNameAvailable(name);
    if (!available) {
      return NextResponse.json(
        { error: 'Agent name already exists', field: 'name' },
        { status: 409 }
      );
    }

    // Create assistant in Vapi first
    let vapiAssistantId: string;
    try {
      const vapiAssistant = await createAssistant({
        name,
        firstMessage: body.first_message,
        systemPrompt: body.system_prompt,
        voiceProvider: body.voice_provider || AGENT_DEFAULTS.voiceProvider,
        voiceId: body.voice_id || AGENT_DEFAULTS.voiceId,
        modelProvider: body.model_provider || AGENT_DEFAULTS.modelProvider,
        model: body.model || AGENT_DEFAULTS.model,
        temperature: body.temperature ?? AGENT_DEFAULTS.temperature,
        maxDurationSeconds: body.max_duration_seconds ?? AGENT_DEFAULTS.maxDurationSeconds,
      });
      vapiAssistantId = vapiAssistant.id;
    } catch (error) {
      console.error('Failed to create Vapi assistant:', error);
      if (error instanceof VapiError) {
        return NextResponse.json(
          { error: 'Failed to create voice assistant', details: error.details },
          { status: 502 }
        );
      }
      throw error;
    }

    // Create agent in database
    const agent = await createAgent({
      name,
      type: body.type as AgentType,
      created_for: body.type === 'personal' ? body.created_for.trim() : null,
      vapi_assistant_id: vapiAssistantId,
      system_prompt: body.system_prompt,
      first_message: body.first_message,
      voice_provider: body.voice_provider || AGENT_DEFAULTS.voiceProvider,
      voice_id: body.voice_id || AGENT_DEFAULTS.voiceId,
      model: body.model || AGENT_DEFAULTS.model,
      temperature: body.temperature ?? AGENT_DEFAULTS.temperature,
      max_duration_seconds: body.max_duration_seconds ?? AGENT_DEFAULTS.maxDurationSeconds,
      call_limit: body.call_limit ?? 3,
    });

    return NextResponse.json(agent, { status: 201 });

  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
