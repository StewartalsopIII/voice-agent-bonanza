import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get all calls without filters
    const result = await sql`
      SELECT
        id,
        vapi_call_id,
        caller,
        started_at,
        ended_at,
        status,
        agent_id,
        created_at
      FROM calls
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      count: result.rows.length,
      calls: result.rows
    });
  } catch (error) {
    console.error('Debug calls error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
