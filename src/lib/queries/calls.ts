import { sql } from '@/lib/db';
import type { Call, CallWithAgent, CallStatus, CallStats } from '@/types';

/**
 * Create a new call record
 */
export async function createCall(data: {
  vapi_call_id: string;
  agent_id?: string | null;
  caller?: string | null;
  started_at?: Date | null;
  ended_at?: Date | null;
  duration_seconds?: number | null;
  status: CallStatus;
  ended_reason?: string | null;
  transcript?: any[] | null;
  recording_url?: string | null;
  cost_total?: number | null;
  cost_breakdown?: object | null;
  metadata?: object | null;
  analysis?: object | null;
}): Promise<Call> {
  const result = await sql`
    INSERT INTO calls (
      vapi_call_id,
      agent_id,
      caller,
      started_at,
      ended_at,
      duration_seconds,
      status,
      ended_reason,
      transcript,
      recording_url,
      cost_total,
      cost_breakdown,
      metadata,
      analysis
    ) VALUES (
      ${data.vapi_call_id},
      ${data.agent_id || null},
      ${data.caller || 'Unknown'},
      ${data.started_at || null},
      ${data.ended_at || null},
      ${data.duration_seconds || null},
      ${data.status},
      ${data.ended_reason || null},
      ${data.transcript ? JSON.stringify(data.transcript) : null}::jsonb,
      ${data.recording_url || null},
      ${data.cost_total || null},
      ${data.cost_breakdown ? JSON.stringify(data.cost_breakdown) : null}::jsonb,
      ${data.metadata ? JSON.stringify(data.metadata) : null}::jsonb,
      ${data.analysis ? JSON.stringify(data.analysis) : null}::jsonb
    )
    RETURNING *
  `;
  return result.rows[0] as Call;
}

/**
 * Get calls with optional filters
 */
export async function getCalls(options?: {
  agentId?: string;
  status?: CallStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ calls: CallWithAgent[]; total: number }> {
  const {
    agentId,
    status,
    startDate,
    endDate,
    limit = 50,
    offset = 0
  } = options || {};

  // Get total count for pagination
  const countResult = await sql`
    SELECT COUNT(*)::int as total
    FROM calls c
    WHERE
      (${agentId}::uuid IS NULL OR c.agent_id = ${agentId})
      AND (${status}::text IS NULL OR c.status = ${status})
      AND (${startDate}::timestamp IS NULL OR c.started_at >= ${startDate})
      AND (${endDate}::timestamp IS NULL OR c.started_at <= ${endDate})
  `;

  // Get calls with agent info
  const result = await sql`
    SELECT
      c.*,
      a.name as agent_name,
      a.type as agent_type
    FROM calls c
    LEFT JOIN agents a ON a.id = c.agent_id
    WHERE
      (${agentId}::uuid IS NULL OR c.agent_id = ${agentId})
      AND (${status}::text IS NULL OR c.status = ${status})
      AND (${startDate}::timestamp IS NULL OR c.started_at >= ${startDate})
      AND (${endDate}::timestamp IS NULL OR c.started_at <= ${endDate})
    ORDER BY c.started_at DESC NULLS LAST
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return {
    calls: result.rows as CallWithAgent[],
    total: countResult.rows[0].total
  };
}

/**
 * Get a single call by ID with agent info
 */
export async function getCallById(id: string): Promise<CallWithAgent | null> {
  const result = await sql`
    SELECT
      c.*,
      a.name as agent_name,
      a.type as agent_type
    FROM calls c
    LEFT JOIN agents a ON a.id = c.agent_id
    WHERE c.id = ${id}
  `;
  return (result.rows[0] as CallWithAgent) || null;
}

/**
 * Get a call by Vapi's call ID
 */
export async function getCallByVapiId(vapiCallId: string): Promise<Call | null> {
  const result = await sql`
    SELECT * FROM calls WHERE vapi_call_id = ${vapiCallId}
  `;
  return (result.rows[0] as Call) || null;
}

/**
 * Get recent calls for a specific agent
 */
export async function getRecentCallsForAgent(
  agentId: string,
  limit = 5
): Promise<Call[]> {
  const result = await sql`
    SELECT * FROM calls
    WHERE agent_id = ${agentId}
    ORDER BY started_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return result.rows as Call[];
}

/**
 * Get call statistics for dashboard
 */
export async function getCallStats(): Promise<CallStats> {
  const result = await sql`
    SELECT
      COUNT(*)::int as total_calls,
      COALESCE(AVG(duration_seconds), 0)::float as avg_duration_seconds,
      COALESCE(
        (COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0) * 100),
        0
      )::float as success_rate,
      (SELECT COUNT(*)::int FROM agents WHERE status = 'active') as active_agents
    FROM calls
  `;
  return result.rows[0] as CallStats;
}
