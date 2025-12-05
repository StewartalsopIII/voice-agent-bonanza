import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection
    const timeResult = await sql`SELECT NOW() as current_time`;

    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('agents', 'calls')
      ORDER BY table_name
    `;

    // Count rows in each table if they exist
    let agentCount = 0;
    let callCount = 0;

    const tableNames = tablesResult.rows.map(r => r.table_name);

    if (tableNames.includes('agents')) {
      const result = await sql`SELECT COUNT(*) as count FROM agents`;
      agentCount = parseInt(result.rows[0].count);
    }

    if (tableNames.includes('calls')) {
      const result = await sql`SELECT COUNT(*) as count FROM calls`;
      callCount = parseInt(result.rows[0].count);
    }

    return NextResponse.json({
      success: true,
      database_time: timeResult.rows[0].current_time,
      tables_found: tableNames,
      counts: {
        agents: agentCount,
        calls: callCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure POSTGRES_URL is set in .env.local'
      },
      { status: 500 }
    );
  }
}
