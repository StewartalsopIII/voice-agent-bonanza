import { NextResponse } from 'next/server';
import { getDailyStats, getAgentStats, getStatusBreakdown, getTopCallers, getAnalyticsSummary, getHourlyDistribution } from '@/lib/queries/analytics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [summary, dailyStats, agentStats, statusBreakdown, topCallers, hourlyDistribution] = await Promise.all([
      getAnalyticsSummary(startDate, endDate),
      getDailyStats(startDate, endDate),
      getAgentStats(startDate, endDate),
      getStatusBreakdown(startDate, endDate),
      getTopCallers(startDate, endDate, 10),
      getHourlyDistribution(startDate, endDate),
    ]);

    return NextResponse.json({
      summary, dailyStats, agentStats, statusBreakdown, topCallers, hourlyDistribution,
      dateRange: { start: startDate.toISOString(), end: endDate.toISOString(), days },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
