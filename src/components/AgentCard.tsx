'use client';

import { useRouter } from 'next/navigation';
import { truncate, formatRelativeTime } from '@/lib/utils';
import type { AgentType } from '@/types';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    type: AgentType;
    created_for?: string | null;
    first_message: string;
    voice_id: string;
    call_count: number;
    last_call_at?: Date | string | null; // Handle both Date obj and string from JSON
  };
}

const typeBadgeStyles: Record<AgentType, string> = {
  public: 'bg-blue-100 text-blue-800',
  personal: 'bg-purple-100 text-purple-800',
  internal: 'bg-gray-100 text-gray-800',
};

const typeLabels: Record<AgentType, string> = {
  public: 'Public',
  personal: 'Personal',
  internal: 'Internal',
};

export default function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();

  const handleTest = () => {
    // Open agent page in new tab
    window.open(`/agent/${agent.name}`, '_blank');
  };

  const handleEdit = () => {
    router.push(`/admin/agents/${agent.id}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header with name and badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {agent.name}
          </h3>
          {agent.type === 'personal' && agent.created_for && (
            <p className="text-sm text-gray-500">
              For: {agent.created_for}
            </p>
          )}
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyles[agent.type]}`}>
          {typeLabels[agent.type]}
        </span>
      </div>

      {/* First message preview */}
      <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">
        "{truncate(agent.first_message, 80)}"
      </p>

      {/* Stats */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {agent.call_count} call{agent.call_count !== 1 ? 's' : ''}
        </span>
        <span className="mx-2">•</span>
        <span>
          {agent.last_call_at
            ? `Last: ${formatRelativeTime(agent.last_call_at)}`
            : 'No calls yet'
          }
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={handleTest}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Test
        </button>
        <button
          onClick={handleEdit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
