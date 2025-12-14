import { unstable_cache } from 'next/cache';
import { getAgents } from '@/lib/queries/agents';
import { getCallStats } from '@/lib/queries/calls';

export const getCachedDashboardData = unstable_cache(
  async () => {
    const [agents, stats] = await Promise.all([
      getAgents(),
      getCallStats(),
    ]);

    return { agents, stats };
  },
  ['admin-dashboard'],
  {
    revalidate: 60,
    tags: ['admin-dashboard'],
  }
);
