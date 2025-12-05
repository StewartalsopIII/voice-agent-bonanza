import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAgentById } from '@/lib/queries/agents';
import { getRecentCallsForAgent } from '@/lib/queries/calls';
import AgentEditClient from './AgentEditClient';
import RecentCallsList from '@/components/RecentCallsList';
import { formatRelativeTime } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentEditPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch agent data
  const agent = await getAgentById(id);

  if (!agent) {
    notFound();
  }

  // Fetch recent calls
  const recentCalls = await getRecentCallsForAgent(id, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Agents
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit: {agent.name}
        </h1>
      </div>

      {/* Two column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <AgentEditClient agent={agent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Agent Info</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Agent URL</dt>
                <dd className="font-mono text-gray-900 mt-1">
                  <a
                    href={`/agent/${agent.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    /agent/{agent.name}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Vapi Assistant ID</dt>
                <dd className="font-mono text-xs text-gray-900 break-all mt-1 bg-gray-50 p-1 rounded border border-gray-200">
                  {agent.vapi_assistant_id || 'Not created'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">
                  {formatRelativeTime(agent.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">
                  {formatRelativeTime(agent.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Recent Calls Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Recent Calls</h2>
            <RecentCallsList
              calls={recentCalls.map(c => ({
                id: c.id,
                caller: c.caller,
                duration_seconds: c.duration_seconds,
                status: c.status,
                started_at: c.started_at?.toISOString() || null,
              }))}
              agentId={id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
