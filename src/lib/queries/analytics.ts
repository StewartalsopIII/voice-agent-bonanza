import { sql } from '@/lib/db';

export interface DailyStats {
  date: string;
  total_calls: number;
  completed_calls: number;
  total_duration: number;
  total_cost: number;
}

export interface AgentStats {
  agent_id: string;
  agent_name: string;
  total_calls: number;
  completed_calls: number;
  total_duration: number;
  total_cost: number;
  success_rate: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface TopCaller {
  caller: string;
  call_count: number;
  total_duration: number;
  last_call_at: Date;
}

export interface AnalyticsSummary {
  total_calls: number;
  total_cost: number;
  avg_duration: number;
  success_rate: number;
  calls_change: number;
  cost_change: number;
}

export async function getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
  const result = await sql`
    SELECT
      DATE(started_at) as date,
      COUNT(*)::int as total_calls,
      COUNT(*) FILTER (WHERE status = 'completed')::int as completed_calls,
      COALESCE(SUM(duration_seconds), 0)::int as total_duration,
      COALESCE(SUM(cost_total), 0)::float as total_cost
    FROM calls
    WHERE started_at >= ${startDate} AND started_at < ${endDate}
    GROUP BY DATE(started_at)
    ORDER BY date ASC
  `;
  return result.rows as DailyStats[];
}

export async function getAgentStats(startDate: Date, endDate: Date): Promise<AgentStats[]> {
  const result = await sql`
    SELECT
      a.id as agent_id,
      a.name as agent_name,
      COUNT(c.id)::int as total_calls,
      COUNT(c.id) FILTER (WHERE c.status = 'completed')::int as completed_calls,
      COALESCE(SUM(c.duration_seconds), 0)::int as total_duration,
      COALESCE(SUM(c.cost_total), 0)::float as total_cost,
      COALESCE(
        COUNT(c.id) FILTER (WHERE c.status = 'completed')::float / NULLIF(COUNT(c.id), 0) * 100, 0
      )::float as success_rate
    FROM agents a
    LEFT JOIN calls c ON c.agent_id = a.id AND c.started_at >= ${startDate} AND c.started_at < ${endDate}
    WHERE a.status = 'active'
    GROUP BY a.id, a.name
    ORDER BY total_calls DESC
  `;
  return result.rows as AgentStats[];
}

export async function getStatusBreakdown(startDate: Date, endDate: Date): Promise<StatusBreakdown[]> {
  const result = await sql`
    WITH status_counts AS (
      SELECT status, COUNT(*)::int as count
      FROM calls
      WHERE started_at >= ${startDate} AND started_at < ${endDate}
      GROUP BY status
    ),
    total AS (SELECT SUM(count)::float as total FROM status_counts)
    SELECT sc.status, sc.count, COALESCE(sc.count / NULLIF(t.total, 0) * 100, 0)::float as percentage
    FROM status_counts sc, total t
    ORDER BY sc.count DESC
  `;
  return result.rows as StatusBreakdown[];
}

export async function getTopCallers(startDate: Date, endDate: Date, limit = 10): Promise<TopCaller[]> {
  const result = await sql`
    SELECT
      caller,
      COUNT(*)::int as call_count,
      COALESCE(SUM(duration_seconds), 0)::int as total_duration,
      MAX(started_at) as last_call_at
    FROM calls
    WHERE started_at >= ${startDate} AND started_at < ${endDate}
      AND caller IS NOT NULL AND caller != 'Unknown'
    GROUP BY caller
    ORDER BY call_count DESC
    LIMIT ${limit}
  `;
  return result.rows as TopCaller[];
}

export async function getAnalyticsSummary(startDate: Date, endDate: Date): Promise<AnalyticsSummary> {
  const periodLength = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - periodLength);
  const prevEndDate = startDate;

  const currentResult = await sql`
    SELECT
      COUNT(*)::int as total_calls,
      COALESCE(SUM(cost_total), 0)::float as total_cost,
      COALESCE(AVG(duration_seconds), 0)::float as avg_duration,
      COALESCE(COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0) * 100, 0)::float as success_rate
    FROM calls
    WHERE started_at >= ${startDate} AND started_at < ${endDate}
  `;

  const prevResult = await sql`
    SELECT COUNT(*)::int as total_calls, COALESCE(SUM(cost_total), 0)::float as total_cost
    FROM calls
    WHERE started_at >= ${prevStartDate} AND started_at < ${prevEndDate}
  `;

  const current = currentResult.rows[0];
  const prev = prevResult.rows[0];

  const callsChange = prev.total_calls > 0
    ? ((current.total_calls - prev.total_calls) / prev.total_calls) * 100
    : current.total_calls > 0 ? 100 : 0;

  const costChange = prev.total_cost > 0
    ? ((current.total_cost - prev.total_cost) / prev.total_cost) * 100
    : current.total_cost > 0 ? 100 : 0;

  return { ...current, calls_change: callsChange, cost_change: costChange };
}

export async function getHourlyDistribution(startDate: Date, endDate: Date): Promise<{ hour: number; count: number }[]> {
  const result = await sql`
    SELECT EXTRACT(HOUR FROM started_at)::int as hour, COUNT(*)::int as count
    FROM calls
    WHERE started_at >= ${startDate} AND started_at < ${endDate}
    GROUP BY hour
    ORDER BY hour
  `;
  return result.rows;
}
