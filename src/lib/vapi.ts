/**
 * Vapi API Client
 * Server-side only - uses VAPI_PRIVATE_KEY
 */

const VAPI_BASE_URL = 'https://api.vapi.ai';

// Get API key - throws if not configured
function getApiKey(): string {
  const key = process.env.VAPI_PRIVATE_KEY;
  if (!key) {
    throw new Error('VAPI_PRIVATE_KEY environment variable is not set');
  }
  return key;
}

// Standard headers for all requests
function getHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

// Error class for Vapi API errors
export class VapiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'VapiError';
  }
}

// Handle API response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let details;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    throw new VapiError(
      `Vapi API error: ${response.status} ${response.statusText}`,
      response.status,
      details
    );
  }
  return response.json();
}

// ============================================
// Types for Vapi API
// ============================================

export interface VapiAssistant {
  id: string;
  name?: string;
  firstMessage?: string;
  model?: {
    provider: string;
    model: string;
    messages?: Array<{ role: string; content: string }>;
    temperature?: number;
  };
  voice?: {
    provider: string;
    voiceId: string;
  };
  transcriber?: {
    provider: string;
    model?: string;
    language?: string;
  };
  maxDurationSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssistantConfig {
  name: string;
  firstMessage: string;
  systemPrompt: string;
  voiceProvider?: string;
  voiceId?: string;
  modelProvider?: string;
  model?: string;
  temperature?: number;
  maxDurationSeconds?: number;
}

export interface UpdateAssistantConfig {
  name?: string;
  firstMessage?: string;
  systemPrompt?: string;
  voiceProvider?: string;
  voiceId?: string;
  modelProvider?: string;
  model?: string;
  temperature?: number;
  maxDurationSeconds?: number;
}

// ============================================
// Helper: Map our config to Vapi's format
// ============================================

function mapToVapiFormat(config: CreateAssistantConfig | UpdateAssistantConfig, isCreate: boolean = false): any {
  const vapiConfig: any = {};

  if ('name' in config && config.name) {
    vapiConfig.name = config.name;
  }

  if ('firstMessage' in config && config.firstMessage) {
    vapiConfig.firstMessage = config.firstMessage;
  }

  // Model configuration
  // Vapi expects the system prompt to be inside the model.messages array
  if (config.systemPrompt || config.model || config.temperature !== undefined) {
    vapiConfig.model = {
      provider: config.modelProvider || 'openai',
      model: config.model || 'gpt-4o',
      messages: config.systemPrompt
        ? [{ role: 'system', content: config.systemPrompt }]
        : undefined,
      temperature: config.temperature,
    };

    // Remove undefined values from model
    Object.keys(vapiConfig.model).forEach(key => {
      if (vapiConfig.model[key] === undefined) {
        delete vapiConfig.model[key];
      }
    });
  }

  // Voice configuration
  if (config.voiceProvider || config.voiceId) {
    vapiConfig.voice = {
      provider: config.voiceProvider || '11labs',
      voiceId: config.voiceId || '21m00Tcm4TlvDq8ikWAM', // Default to Rachel UUID if missing
    };
  }

  // Transcriber (Default to Deepgram Nova-2 for speed)
  // Only set this on create, not on updates
  if (isCreate) {
      vapiConfig.transcriber = {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US"
      }
  }

  if ('maxDurationSeconds' in config && config.maxDurationSeconds) {
    vapiConfig.maxDurationSeconds = config.maxDurationSeconds;
  }

  return vapiConfig;
}

// ============================================
// API Functions
// ============================================

/**
 * Create a new assistant in Vapi
 * @returns The created assistant with its ID
 */
export async function createAssistant(
  config: CreateAssistantConfig
): Promise<VapiAssistant> {
  const vapiConfig = mapToVapiFormat(config, true); // Pass true for isCreate

  console.log('[Vapi] Creating assistant:', config.name);

  const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(vapiConfig),
  });

  const assistant = await handleResponse<VapiAssistant>(response);
  console.log('[Vapi] Created assistant:', assistant.id);

  return assistant;
}

/**
 * Get an assistant by ID
 */
export async function getAssistant(id: string): Promise<VapiAssistant> {
  const response = await fetch(`${VAPI_BASE_URL}/assistant/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<VapiAssistant>(response);
}

/**
 * Update an existing assistant
 */
export async function updateAssistant(
  id: string,
  config: UpdateAssistantConfig
): Promise<VapiAssistant> {
  const vapiConfig = mapToVapiFormat(config);

  console.log('[Vapi] Updating assistant:', id);

  const response = await fetch(`${VAPI_BASE_URL}/assistant/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(vapiConfig),
  });

  return handleResponse<VapiAssistant>(response);
}

/**
 * Delete an assistant
 * @returns true if deleted successfully
 */
export async function deleteAssistant(id: string): Promise<boolean> {
  console.log('[Vapi] Deleting assistant:', id);

  const response = await fetch(`${VAPI_BASE_URL}/assistant/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (response.status === 404) {
    console.log('[Vapi] Assistant not found:', id);
    return false;
  }

  await handleResponse<any>(response);
  console.log('[Vapi] Deleted assistant:', id);

  return true;
}

/**
 * List all assistants
 * @param limit - Max number to return (default 100)
 */
export async function listAssistants(limit = 100): Promise<VapiAssistant[]> {
  const response = await fetch(`${VAPI_BASE_URL}/assistant?limit=${limit}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<VapiAssistant[]>(response);
}

/**
 * Get call details from Vapi
 * Used to fetch cost breakdown and other details
 */
export async function getCall(callId: string): Promise<any> {
  const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<any>(response);
}
