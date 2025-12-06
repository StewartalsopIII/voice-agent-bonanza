'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { AgentWithStats, CallStatus } from '@/types';

interface CallFiltersProps {
  agents: AgentWithStats[];
  currentAgent?: string;
  currentStatus?: CallStatus;
  currentDays: number;
}

export default function CallFilters({
  agents,
  currentAgent,
  currentStatus,
  currentDays,
}: CallFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/calls?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Agent Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Agent
        </label>
        <select
          value={currentAgent || ''}
          onChange={(e) => updateFilter('agent', e.target.value || null)}
          className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={currentStatus || ''}
          onChange={(e) => updateFilter('status', e.target.value || null)}
          className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="completed">✓ Completed</option>
          <option value="timed_out">⏱ Timed Out</option>
          <option value="error">✗ Error</option>
          <option value="no_connection">📵 No Connection</option>
        </select>
      </div>

      {/* Time Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Range
        </label>
        <select
          value={currentDays}
          onChange={(e) => updateFilter('days', e.target.value)}
          className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(currentAgent || currentStatus) && (
        <div className="flex items-end">
          <button
            onClick={() => router.push('/admin/calls')}
            className="text-sm text-gray-500 hover:text-gray-700 pb-2 mb-1"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
