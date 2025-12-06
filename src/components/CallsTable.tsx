'use client';

import Link from 'next/link';
import { formatDuration, formatRelativeTime, formatCost } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import type { CallWithAgent } from '@/types';

interface CallsTableProps {
  calls: CallWithAgent[];
}

export default function CallsTable({ calls }: CallsTableProps) {
  if (calls.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No calls found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Caller
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              When
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calls.map((call) => (
            <tr key={call.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                  {call.caller || 'Unknown'}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {call.agent_name ? (
                  <Link
                    href={`/admin/agents/${call.agent_id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {call.agent_name}
                  </Link>
                ) : (
                  <span className="text-gray-400">Unknown</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">
                {formatDuration(call.duration_seconds)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                {formatRelativeTime(call.started_at)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge status={call.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">
                {formatCost(call.cost_total)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <Link
                  href={`/admin/calls/${call.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
