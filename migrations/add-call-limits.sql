-- Migration: Add call limit feature for public agents
-- Run this in Supabase SQL Editor

-- Add call_limit column (default 3 for new agents)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS call_limit INTEGER DEFAULT 3;

-- Add call_count column to track usage (starts at 0)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS call_count INTEGER DEFAULT 0;

-- Add constraint to ensure call_limit is positive
ALTER TABLE agents
ADD CONSTRAINT valid_call_limit CHECK (call_limit > 0 OR call_limit IS NULL);

-- Add constraint to ensure call_count is non-negative
ALTER TABLE agents
ADD CONSTRAINT valid_call_count CHECK (call_count >= 0);

-- Update existing agents: set their call_count based on actual calls
-- This ensures existing agents have accurate counts
UPDATE agents a
SET call_count = COALESCE((
  SELECT COUNT(*)
  FROM calls c
  WHERE c.agent_id = a.id
  AND c.status = 'completed'
), 0);

-- Verify the migration
SELECT id, name, type, call_limit, call_count
FROM agents
ORDER BY created_at DESC
LIMIT 10;
