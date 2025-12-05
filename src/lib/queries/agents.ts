import { sql } from '@/lib/db';
import type { Agent, AgentWithStats, AgentType } from '@/types';

/**
 * Create a new agent
 */
export async function createAgent(data: {
  name: string;
  type: AgentType;
  created_for?: string | null;
  vapi_assistant_id?: string | null;
  system_prompt: string;
  first_message: string;
  voice_provider?: string;
  voice_id?: string;
  model?: string;
  temperature?: number;
  max_duration_seconds?: number;
}): Promise<Agent> {
  const result = await sql`
    INSERT INTO agents (
      name,
      type,
      created_for,
      vapi_assistant_id,
      system_prompt,
      first_message,
      voice_provider,
      voice_id,
      model,
      temperature,
      max_duration_seconds
    ) VALUES (
      ${data.name},
      ${data.type},
      ${data.created_for || null},
      ${data.vapi_assistant_id || null},
      ${data.system_prompt},
      ${data.first_message},
      ${data.voice_provider || '11labs'},
      ${data.voice_id || 'rachel'},
      ${data.model || 'gpt-4o'},
      ${data.temperature || 0.7},
      ${data.max_duration_seconds || 600}
    )
    RETURNING *
  `;
  return result.rows[0] as Agent;
}

/**
 * Get all agents with call statistics
 */
export async function getAgents(options?: {
  includeDeleted?: boolean;
  type?: AgentType;
}): Promise<AgentWithStats[]> {
  const { includeDeleted = false, type } = options || {};

  const result = await sql`
    SELECT
      a.*,
      COALESCE(c.call_count, 0)::int as call_count,
      c.last_call_at
    FROM agents a
    LEFT JOIN (
      SELECT
        agent_id,
        COUNT(*)::int as call_count,
        MAX(started_at) as last_call_at
      FROM calls
      GROUP BY agent_id
    ) c ON c.agent_id = a.id
    WHERE
      (${includeDeleted} OR a.status = 'active')
      AND (${type}::text IS NULL OR a.type = ${type})
    ORDER BY a.created_at DESC
  `;

  return result.rows as AgentWithStats[];
}

/**
 * Get a single agent by ID
 */
export async function getAgentById(
  id: string,
  includeDeleted = false
): Promise<Agent | null> {
  const result = await sql`
    SELECT * FROM agents
    WHERE id = ${id}
    AND (${includeDeleted} OR status = 'active')
  `;
  return (result.rows[0] as Agent) || null;
}

/**
 * Get a single agent by slug/name
 */
export async function getAgentBySlug(
  slug: string,
  includeDeleted = false
): Promise<Agent | null> {
  const result = await sql`
    SELECT * FROM agents
    WHERE name = ${slug}
    AND (${includeDeleted} OR status = 'active')
  `;
  return (result.rows[0] as Agent) || null;
}

/**
 * Get agent by Vapi assistant ID
 */
export async function getAgentByVapiId(
  vapiAssistantId: string
): Promise<Agent | null> {
  const result = await sql`
    SELECT * FROM agents
    WHERE vapi_assistant_id = ${vapiAssistantId}
  `;
  return (result.rows[0] as Agent) || null;
}

/**
 * Update an agent
 */
export async function updateAgent(
  id: string,
  data: Partial<{
    name: string;
    type: AgentType;
    created_for: string | null;
    vapi_assistant_id: string | null;
    system_prompt: string;
    first_message: string;
    voice_provider: string;
    voice_id: string;
    model: string;
    temperature: number;
    max_duration_seconds: number;
    status: 'active' | 'deleted';
  }>
): Promise<Agent | null> {
  const result = await sql`
    UPDATE agents SET
      name = COALESCE(${data.name ?? null}, name),
      type = COALESCE(${data.type ?? null}, type),
      created_for = CASE
        WHEN ${data.created_for !== undefined} THEN ${data.created_for ?? null}
        ELSE created_for
      END,
      vapi_assistant_id = CASE
        WHEN ${data.vapi_assistant_id !== undefined} THEN ${data.vapi_assistant_id ?? null}
        ELSE vapi_assistant_id
      END,
      system_prompt = COALESCE(${data.system_prompt ?? null}, system_prompt),
      first_message = COALESCE(${data.first_message ?? null}, first_message),
      voice_provider = COALESCE(${data.voice_provider ?? null}, voice_provider),
      voice_id = COALESCE(${data.voice_id ?? null}, voice_id),
      model = COALESCE(${data.model ?? null}, model),
      temperature = COALESCE(${data.temperature ?? null}, temperature),
      max_duration_seconds = COALESCE(${data.max_duration_seconds ?? null}, max_duration_seconds),
      status = COALESCE(${data.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (result.rows[0] as Agent) || null;
}

/**
 * Soft delete an agent
 */
export async function deleteAgent(id: string): Promise<boolean> {
  const result = await sql`
    UPDATE agents
    SET status = 'deleted', updated_at = NOW()
    WHERE id = ${id} AND status = 'active'
    RETURNING id
  `;
  return result.rows.length > 0;
}

/**
 * Hard delete an agent (permanently remove from database)
 */
export async function hardDeleteAgent(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM agents
    WHERE id = ${id}
    RETURNING id
  `;
  return result.rows.length > 0;
}

/**
 * Check if an agent name/slug is available
 */
export async function isAgentNameAvailable(
  name: string,
  excludeId?: string
): Promise<boolean> {
  const result = await sql`
    SELECT id FROM agents
    WHERE name = ${name}
    AND (${excludeId}::uuid IS NULL OR id != ${excludeId})
    AND status = 'active'
  `;
  return result.rows.length === 0;
}
