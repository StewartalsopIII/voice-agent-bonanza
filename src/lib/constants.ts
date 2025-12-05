/**
 * Voice options available in Vapi
 * These will be displayed in dropdowns in the admin UI
 */
export const VOICE_OPTIONS = [
  // 11Labs voices (Using actual UUIDs required by API)
  { id: '21m00Tcm4TlvDq8ikWAM', provider: '11labs', label: 'Rachel (Female, Calm)' },
  { id: '29vD33N1CtxCmqQRPOHJ', provider: '11labs', label: 'Drew (Male, Professional)' },
  { id: '2EiwWnXFnvU5JabPnv8n', provider: '11labs', label: 'Clyde (Male, Friendly)' },
  { id: '5Q0t7uMcjvnagumLfvZi', provider: '11labs', label: 'Paul (Male, Narrator)' },
  { id: 'AZnzlk1XvdvUeBnXmlld', provider: '11labs', label: 'Domi (Female, Confident)' },
  { id: 'CYw3kZ02Hs0563khs1Fj', provider: '11labs', label: 'Dave (Male, Conversational)' },
  { id: 'D38z5RcWu1voky8WS1ja', provider: '11labs', label: 'Fin (Male, Irish)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', provider: '11labs', label: 'Sarah (Female, Soft)' },

  // OpenAI voices (ID is the name for OpenAI)
  { id: 'alloy', provider: 'openai', label: 'Alloy (Neutral)' },
  { id: 'echo', provider: 'openai', label: 'Echo (Male)' },
  { id: 'fable', provider: 'openai', label: 'Fable (British)' },
  { id: 'onyx', provider: 'openai', label: 'Onyx (Male, Deep)' },
  { id: 'nova', provider: 'openai', label: 'Nova (Female)' },
  { id: 'shimmer', provider: 'openai', label: 'Shimmer (Female, Warm)' },
] as const;

/**
 * Model options available in Vapi
 */
export const MODEL_OPTIONS = [
  // OpenAI
  { id: 'gpt-4o', provider: 'openai', label: 'GPT-4o (Recommended)' },
  { id: 'gpt-4o-mini', provider: 'openai', label: 'GPT-4o Mini (Faster)' },
  { id: 'gpt-4-turbo', provider: 'openai', label: 'GPT-4 Turbo' },

  // Anthropic (Updated to current valid IDs)
  { id: 'claude-3-5-sonnet-20240620', provider: 'anthropic', label: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-haiku-20240307', provider: 'anthropic', label: 'Claude 3 Haiku (Fast)' },

  // Google
  { id: 'gemini-1.5-pro', provider: 'google', label: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', provider: 'google', label: 'Gemini 1.5 Flash' },
] as const;

/**
 * Agent type options
 */
export const AGENT_TYPE_OPTIONS = [
  {
    id: 'public',
    label: 'Public',
    description: 'Shows intake form before call. Anyone can access.'
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'Created for a specific person. No intake form.'
  },
  {
    id: 'internal',
    label: 'Internal',
    description: 'Admin testing only. Hidden from public.'
  },
] as const;

/**
 * Reserved agent names that cannot be used
 */
export const RESERVED_AGENT_NAMES = [
  'admin',
  'api',
  'webhooks',
  'login',
  'logout',
  'agent',
  'agents',
  'call',
  'calls',
  'new',
  'edit',
  'delete',
  'settings',
  'dashboard',
] as const;

/**
 * Default values for new agents
 */
export const AGENT_DEFAULTS = {
  voiceProvider: '11labs',
  voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
  model: 'gpt-4o',
  modelProvider: 'openai',
  temperature: 0.7,
  maxDurationSeconds: 600, // 10 minutes
} as const;
