import Link from 'next/link';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import type { CallStatus } from '@/types';

interface RecentCall {
  id: string;
  caller: string;
  duration_seconds: number | null;
  status: CallStatus;
  started_at: string | null;
}

interface RecentCallsListProps {
  calls: RecentCall[];
  agentId: string;
}

const statusStyles: Record<CallStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✓' },
  timed_out: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏱' },
  error: { bg: 'bg-red-100', text: 'text-red-800', label: '✗' },
  no_connection: { bg: 'bg-gray-100', text: 'text-gray-800', label: '📵' },
};

export default function RecentCallsList({ calls, agentId }: RecentCallsListProps) {
  if (calls.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No calls yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {calls.map((call) => {
        const style = statusStyles[call.status];
        return (
          <Link
            key={call.id}
            href={`/admin/calls/${call.id}`}
            className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className={`w-6 h-6 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-xs`}>
                {style.label}
              </span>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {call.caller || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  {formatRelativeTime(call.started_at)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 font-mono">
              {formatDuration(call.duration_seconds)}
            </div>
          </Link>
        );
      })}

      {/* View all link */}
      <div className="pt-4 border-t border-gray-100 mt-2">
        <Link
          href={`/admin/calls?agent=${agentId}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all calls →
        </Link>
      </div>
    </div>
  );
}
