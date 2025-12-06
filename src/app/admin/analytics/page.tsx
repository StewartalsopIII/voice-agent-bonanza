'use client';

import { useState, useEffect } from 'react';
import SimpleLineChart from '@/components/charts/SimpleLineChart';
import SimpleBarChart from '@/components/charts/SimpleBarChart';
import SimpleDonutChart from '@/components/charts/SimpleDonutChart';
import { formatDuration, formatCost, formatPercentage, formatRelativeTime } from '@/lib/utils';

const statusColors: Record<string, string> = { completed: '#10B981', timed_out: '#F59E0B', error: '#EF4444', no_connection: '#6B7280' };
const statusLabels: Record<string, string> = { completed: 'Completed', timed_out: 'Timed Out', error: 'Error', no_connection: 'No Connection' };

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-gray-200 rounded-xl" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load analytics</div>;

  const dailyChartData = data.dailyStats.map((d: any) => ({
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.total_calls,
  }));

  const agentChartData = data.agentStats.filter((a: any) => a.total_calls > 0).slice(0, 6).map((a: any) => ({ label: a.agent_name, value: a.total_calls }));
  const statusChartData = data.statusBreakdown.map((s: any) => ({ label: statusLabels[s.status] || s.status, value: s.count, color: statusColors[s.status] || '#6B7280' }));

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isUp = value > 0;
    return <span className={`text-xs ${isUp ? 'text-green-600' : 'text-red-600'}`}>{isUp ? '↑' : '↓'} {Math.abs(value).toFixed(0)}%</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select value={days} onChange={e => setDays(parseInt(e.target.value))} className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Total Calls</p>
            <ChangeIndicator value={data.summary.calls_change} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.total_calls}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Total Cost</p>
            <ChangeIndicator value={data.summary.cost_change} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCost(data.summary.total_cost)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Avg Duration</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatDuration(data.summary.avg_duration)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercentage(data.summary.success_rate)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Calls Over Time</h2>
          <SimpleLineChart data={dailyChartData} height={220} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Calls by Status</h2>
          <SimpleDonutChart data={statusChartData} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Calls by Agent</h2>
        <SimpleBarChart data={agentChartData} horizontal height={Math.max(150, agentChartData.length * 50)} />
      </div>

      {/* Top Callers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Top Callers</h2>
        {data.topCallers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No caller data</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm text-gray-500">Caller</th>
                <th className="text-left py-2 text-sm text-gray-500">Calls</th>
                <th className="text-left py-2 text-sm text-gray-500">Duration</th>
                <th className="text-left py-2 text-sm text-gray-500">Last Call</th>
              </tr>
            </thead>
            <tbody>
              {data.topCallers.map((c: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{c.caller}</td>
                  <td className="py-2 text-gray-600">{c.call_count}</td>
                  <td className="py-2 text-gray-600">{formatDuration(c.total_duration)}</td>
                  <td className="py-2 text-gray-500">{formatRelativeTime(c.last_call_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
