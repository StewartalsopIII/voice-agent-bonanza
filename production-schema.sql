-- Production Database Schema for Voice Agent Bonanza
-- Run this in Supabase SQL Editor before deploying to Vercel

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  created_for VARCHAR(255),
  vapi_assistant_id VARCHAR(255),
  system_prompt TEXT NOT NULL,
  first_message TEXT NOT NULL,
  voice_provider VARCHAR(50) DEFAULT '11labs',
  voice_id VARCHAR(100) DEFAULT '21m00Tcm4TlvDq8ikWAM',
  model VARCHAR(100) DEFAULT 'gpt-4o',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_duration_seconds INTEGER DEFAULT 600,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('public', 'personal', 'internal')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'deleted'))
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vapi_call_id VARCHAR(255) UNIQUE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  caller VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  status VARCHAR(20) NOT NULL,
  ended_reason VARCHAR(255),
  transcript JSONB,
  recording_url VARCHAR(500),
  cost_total DECIMAL(10,4),
  cost_breakdown JSONB,
  metadata JSONB,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_vapi_id ON calls(vapi_call_id);

-- Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('agents', 'calls');
