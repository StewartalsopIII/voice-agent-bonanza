import Link from 'next/link';
import { getAgents } from '@/lib/queries/agents';

export default async function Home() {
  // Fetch public agents only (with fallback for build time)
  let publicAgents = [];
  try {
    const allAgents = await getAgents();
    publicAgents = allAgents.filter(a => a.type === 'public');
  } catch (error) {
    // During build or if DB unavailable, show empty state
    console.error('Failed to fetch agents:', error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Voice Agent Platform
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, manage, and talk to AI-powered voice agents in seconds.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Admin Dashboard
          </Link>
        </div>

        {/* Public Agents */}
        {publicAgents.length > 0 ? (
          <div>
            <div className="flex items-center justify-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Agents
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agent/${agent.name}`}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      Public
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    "{agent.first_message}"
                  </p>

                  <div className="flex items-center text-sm text-gray-400 pt-4 border-t border-gray-50">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {agent.call_count} calls
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg mb-2">No public agents available yet.</p>
            <p className="text-gray-400">
              Create one in the <Link href="/admin" className="text-blue-600 hover:underline">admin dashboard</Link>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
