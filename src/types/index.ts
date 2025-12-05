// Agent types
export type AgentType = 'public' | 'personal' | 'internal';
export type AgentStatus = 'active' | 'deleted';

export interface Agent {
  id: string;
  name: string;                    // URL slug, e.g., "workshop-bot"
  type: AgentType;
  created_for: string | null;      // For personal agents: who it's for
  vapi_assistant_id: string | null;
  system_prompt: string;
  first_message: string;
  voice_provider: string;
  voice_id: string;
  model: string;
  temperature: number;
  max_duration_seconds: number;
  status: AgentStatus;
  created_at: Date;
  updated_at: Date;
}

// Agent with computed fields from queries
export interface AgentWithStats extends Agent {
  call_count: number;
  last_call_at: Date | null;
}

// Call status (simplified from Vapi's detailed endedReason)
export type CallStatus = 'completed' | 'timed_out' | 'error' | 'no_connection';

export interface Call {
  id: string;
  vapi_call_id: string;
  agent_id: string | null;
  caller: string;                  // From intake form, createdFor, or "Admin Test"
  started_at: Date | null;
  ended_at: Date | null;
  duration_seconds: number | null;
  status: CallStatus;
  ended_reason: string | null;     // Raw Vapi endedReason for debugging
  transcript: TranscriptMessage[] | null;
  recording_url: string | null;
  cost_total: number | null;
  cost_breakdown: CostBreakdown | null;
  metadata: Record<string, any> | null;
  analysis: CallAnalysis | null;
  created_at: Date;
}

// Call with agent info joined
export interface CallWithAgent extends Call {
  agent_name: string | null;
  agent_type: AgentType | null;
}

// Transcript message format
export interface TranscriptMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: number;
}

// Cost breakdown from Vapi
export interface CostBreakdown {
  stt?: number;
  llm?: number;
  tts?: number;
  vapi?: number;
  transport?: number;
}

// Call analysis from Vapi
export interface CallAnalysis {
  summary?: string;
  successEvaluation?: string;
  structuredData?: Record<string, any>;
}

// Stats for dashboard
export interface CallStats {
  total_calls: number;
  avg_duration_seconds: number;
  success_rate: number;            // 0-100
  active_agents: number;
}
