import { NextResponse } from 'next/server';
import { getCalls } from '@/lib/queries/calls';
import type { CallStatus } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const agentId = searchParams.get('agent') || undefined;
    const status = searchParams.get('status') as CallStatus | null;
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { calls, total } = await getCalls({
      agentId,
      status: status || undefined,
      startDate,
      limit,
      offset,
    });

    return NextResponse.json({ calls, total });

  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}
