import { query, sql } from '@/lib/db';
import { SCHEMA_SQL } from '@/lib/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  // STRICT SECURITY CHECK - Completely disabled in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disabled in production' },
      { status: 403 }
    );
  }

  try {
    // Execute the entire schema as one statement
    // PostgreSQL can handle multiple commands in a single query
    await query(SCHEMA_SQL);

    // Verify tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('agents', 'calls')
    `;

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully',
      tables: tables.rows.map(r => r.table_name)
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
