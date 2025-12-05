import { NextResponse } from 'next/server';
import {
  createAgent,
  getAgents,
  getAgentById,
  getAgentBySlug,
  updateAgent,
  deleteAgent,
  isAgentNameAvailable
} from '@/lib/queries/agents';
import {
  createCall,
  getCalls,
  getCallById,
  getCallStats
} from '@/lib/queries/calls';

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 });
  }

  const results: Record<string, any> = {};

  try {
    // Test 1: Check name availability
    results.nameAvailable = await isAgentNameAvailable('test-agent');

    // Test 2: Create a test agent
    const agent = await createAgent({
      name: 'test-agent-' + Date.now(),
      type: 'internal',
      system_prompt: 'You are a test assistant.',
      first_message: 'Hello, this is a test.'
    });
    results.createdAgent = { id: agent.id, name: agent.name };

    // Test 3: Get agent by ID
    const fetchedAgent = await getAgentById(agent.id);
    results.fetchedById = fetchedAgent ? 'OK' : 'FAIL';

    // Test 4: Get agent by slug
    const fetchedBySlug = await getAgentBySlug(agent.name);
    results.fetchedBySlug = fetchedBySlug ? 'OK' : 'FAIL';

    // Test 5: Update agent
    const updatedAgent = await updateAgent(agent.id, {
      first_message: 'Updated message'
    });
    results.updated = updatedAgent?.first_message === 'Updated message' ? 'OK' : 'FAIL';

    // Test 6: Get all agents
    const agents = await getAgents();
    results.totalAgents = agents.length;

    // Test 7: Create a test call
    const call = await createCall({
      vapi_call_id: 'test-call-' + Date.now(),
      agent_id: agent.id,
      caller: 'Test User',
      status: 'completed',
      duration_seconds: 120
    });
    results.createdCall = { id: call.id, vapi_call_id: call.vapi_call_id };

    // Test 8: Get calls
    const { calls, total } = await getCalls({ agentId: agent.id });
    results.callsForAgent = { count: calls.length, total };

    // Test 9: Get call by ID
    const fetchedCall = await getCallById(call.id);
    results.fetchedCall = fetchedCall ? 'OK' : 'FAIL';

    // Test 10: Get stats
    const stats = await getCallStats();
    results.stats = stats;

    // Test 11: Soft delete the test agent
    const deleted = await deleteAgent(agent.id);
    results.deleted = deleted ? 'OK' : 'FAIL';

    // Test 12: Verify agent is hidden
    const agentsAfterDelete = await getAgents();
    const foundDeleted = agentsAfterDelete.find(a => a.id === agent.id);
    results.hiddenAfterDelete = !foundDeleted ? 'OK' : 'FAIL';

    return NextResponse.json({
      success: true,
      message: 'All query tests passed',
      results
    });

  } catch (error) {
    console.error('Query test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}
