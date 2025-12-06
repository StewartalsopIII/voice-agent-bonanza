import { getCalls } from '@/lib/queries/calls';
import { getAgents } from '@/lib/queries/agents';
import CallsTable from '@/components/CallsTable';
import CallFilters from './CallFilters';
import type { CallStatus } from '@/types';

interface PageProps {
  searchParams: Promise<{
    agent?: string;
    status?: CallStatus;
    days?: string;
  }>;
}

export default async function CallHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const agentId = params.agent;
  const status = params.status;
  const days = parseInt(params.days || '30');

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch data
  const [{ calls, total }, agents] = await Promise.all([
    getCalls({
      agentId,
      status,
      startDate,
      limit: 100,
    }),
    getAgents(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Call History
        </h1>
        <div className="text-sm text-gray-500">
          {total} call{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Filters */}
      <CallFilters
        agents={agents}
        currentAgent={agentId}
        currentStatus={status}
        currentDays={days}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CallsTable calls={calls} />
      </div>
    </div>
  );
}
