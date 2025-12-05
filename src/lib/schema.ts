export const SCHEMA_SQL = `
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Agents table
-- Stores voice agent configurations that sync with Vapi assistants
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    -- Identity
  name VARCHAR(255) NOT NULL UNIQUE,        -- URL slug (e.g., "workshop-bot")
  type VARCHAR(20) NOT NULL,                -- 'public', 'personal', 'internal'
  created_for VARCHAR(255),                 -- For personal agents: who it's created for

  -- Vapi integration
  vapi_assistant_id VARCHAR(255),           -- Returned from Vapi API after creation

  -- Configuration
  system_prompt TEXT NOT NULL,
  first_message TEXT NOT NULL,
  voice_provider VARCHAR(50) DEFAULT '11labs',
  voice_id VARCHAR(100) DEFAULT 'rachel',
  model VARCHAR(100) DEFAULT 'gpt-4o',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_duration_seconds INTEGER DEFAULT 600, -- 10 minutes default

  -- Status
  status VARCHAR(20) DEFAULT 'active',      -- 'active' or 'deleted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('public', 'personal', 'internal')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'deleted')),
  CONSTRAINT temperature_range CHECK (temperature >= 0 AND temperature <= 2),
  CONSTRAINT duration_range CHECK (max_duration_seconds >= 60 AND max_duration_seconds <= 43200)
);

-- Calls table
-- Stores call records received via webhook from Vapi
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    -- Identity
  vapi_call_id VARCHAR(255) UNIQUE NOT NULL,  -- Vapi's call ID
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Caller info
  caller VARCHAR(255),                        -- Name from intake form, createdFor, or "Admin Test"

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Status
  status VARCHAR(20) NOT NULL,                -- 'completed', 'timed_out', 'error', 'no_connection'
  ended_reason VARCHAR(255),                  -- Raw Vapi endedReason for debugging

  -- Content
  transcript JSONB,                           -- Array of {role, content} messages
  recording_url VARCHAR(500),

  -- Cost
  cost_total DECIMAL(10,4),
  cost_breakdown JSONB,                       -- {stt, llm, tts, vapi, transport}

  -- Additional data
  metadata JSONB,                             -- Caller info, custom fields
  analysis JSONB,                             -- Vapi's analysis (summary, success, structured data)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_call_status CHECK (status IN ('completed', 'timed_out', 'error', 'no_connection'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_vapi_id ON calls(vapi_call_id);
`;
