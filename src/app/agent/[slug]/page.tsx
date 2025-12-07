import { notFound } from 'next/navigation';
import { getAgentBySlug } from '@/lib/queries/agents';
import { isAuthenticated } from '@/lib/auth';
import AgentCallClient from './AgentCallClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicAgentPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch agent by slug
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  // Check if user is admin (for internal agents)
  const isAdmin = await isAuthenticated();

  // Internal agents require admin auth
  if (agent.type === 'internal' && !isAdmin) {
    notFound(); // Hide internal agents from public
  }

  // Check if Vapi assistant is configured
  if (!agent.vapi_assistant_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4 text-gray-400">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Agent Not Ready
          </h1>
          <p className="text-gray-600">
            This agent hasn't been fully configured yet. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Check call limit for public agents
  const isPublic = agent.type === 'public';
  const callLimit = agent.call_limit ?? 3;
  const callsRemaining = Math.max(0, callLimit - agent.call_count);
  const isLimitReached = isPublic && agent.call_count >= callLimit;

  // Show unavailable page if limit reached (unless admin)
  if (isLimitReached && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4 text-red-400">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            This Agent Is No Longer Available
          </h1>
          <p className="text-gray-600">
            This voice agent has reached its usage limit and is no longer accepting calls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {agent.name}
          </h1>

          {agent.type === 'personal' && agent.created_for && (
            <p className="text-lg text-gray-500">
              Personal agent for {agent.created_for}
            </p>
          )}

          {agent.type === 'internal' && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200 mt-2">
              Internal Testing Mode
            </span>
          )}

          {/* Call limit countdown for public agents */}
          {isPublic && (
            <div className="mt-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                callsRemaining <= 1
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : callsRemaining <= 3
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {callsRemaining} call{callsRemaining !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
        </div>

        {/* Call Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
          <AgentCallClient
            agent={{
              id: agent.id,
              name: agent.name,
              type: agent.type,
              created_for: agent.created_for,
              vapi_assistant_id: agent.vapi_assistant_id,
              first_message: agent.first_message,
            }}
            isAdmin={isAdmin}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center max-w-lg mx-auto">
          <p className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-3">Preview Greeting</p>
          <div className="relative">
            <span className="text-4xl absolute top-0 left-0 text-gray-200 -translate-x-4 -translate-y-2">"</span>
            <p className="text-gray-600 text-lg italic relative z-10">
              {agent.first_message}
            </p>
            <span className="text-4xl absolute bottom-0 right-0 text-gray-200 translate-x-4 translate-y-4">"</span>
          </div>
        </div>
      </div>
    </div>
  );
}
