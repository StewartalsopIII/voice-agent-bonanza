import { RESERVED_AGENT_NAMES } from '@/lib/constants';
import type { AgentType } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate agent name/slug
 * - 3-50 characters
 * - Lowercase alphanumeric and hyphens only
 * - Cannot start or end with hyphen
 * - Not a reserved name
 */
export function validateAgentName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
    return { valid: false, errors };
  }

  const trimmed = name.trim().toLowerCase();

  if (trimmed.length < 3) {
    errors.push({ field: 'name', message: 'Name must be at least 3 characters' });
  }

  if (trimmed.length > 50) {
    errors.push({ field: 'name', message: 'Name must be 50 characters or less' });
  }

  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    errors.push({ field: 'name', message: 'Name can only contain lowercase letters, numbers, and hyphens' });
  }

  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    errors.push({ field: 'name', message: 'Name cannot start or end with a hyphen' });
  }

  if (RESERVED_AGENT_NAMES.includes(trimmed as any)) {
    errors.push({ field: 'name', message: `"${trimmed}" is a reserved name` });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate agent creation data
 */
export function validateCreateAgent(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  const nameResult = validateAgentName(data.name || '');
  errors.push(...nameResult.errors);

  // Type validation
  if (!data.type) {
    errors.push({ field: 'type', message: 'Type is required' });
  } else if (!['public', 'personal', 'internal'].includes(data.type)) {
    errors.push({ field: 'type', message: 'Type must be public, personal, or internal' });
  }

  // Created for validation (required if personal)
  if (data.type === 'personal') {
    if (!data.created_for || data.created_for.trim().length === 0) {
      errors.push({ field: 'created_for', message: 'Created for is required for personal agents' });
    }
  } else if (data.created_for) {
    errors.push({ field: 'created_for', message: 'Created for should only be set for personal agents' });
  }

  // System prompt validation
  if (!data.system_prompt) {
    errors.push({ field: 'system_prompt', message: 'System prompt is required' });
  } else if (data.system_prompt.length < 10) {
    errors.push({ field: 'system_prompt', message: 'System prompt must be at least 10 characters' });
  }

  // First message validation
  if (!data.first_message) {
    errors.push({ field: 'first_message', message: 'First message is required' });
  } else if (data.first_message.length < 5) {
    errors.push({ field: 'first_message', message: 'First message must be at least 5 characters' });
  }

  // Temperature validation
  if (data.temperature !== undefined) {
    const temp = Number(data.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      errors.push({ field: 'temperature', message: 'Temperature must be between 0 and 2' });
    }
  }

  // Max duration validation
  if (data.max_duration_seconds !== undefined) {
    const duration = Number(data.max_duration_seconds);
    if (isNaN(duration) || duration < 60 || duration > 43200) {
      errors.push({ field: 'max_duration_seconds', message: 'Max duration must be between 60 and 43200 seconds' });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate agent update data
 */
export function validateUpdateAgent(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation (only if provided)
  if (data.name !== undefined) {
    const nameResult = validateAgentName(data.name);
    errors.push(...nameResult.errors);
  }

  // Type validation (only if provided)
  if (data.type !== undefined && !['public', 'personal', 'internal'].includes(data.type)) {
    errors.push({ field: 'type', message: 'Type must be public, personal, or internal' });
  }

  // System prompt validation (only if provided)
  if (data.system_prompt !== undefined && data.system_prompt.length < 10) {
    errors.push({ field: 'system_prompt', message: 'System prompt must be at least 10 characters' });
  }

  // First message validation (only if provided)
  if (data.first_message !== undefined && data.first_message.length < 5) {
    errors.push({ field: 'first_message', message: 'First message must be at least 5 characters' });
  }

  // Temperature validation (only if provided)
  if (data.temperature !== undefined) {
    const temp = Number(data.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      errors.push({ field: 'temperature', message: 'Temperature must be between 0 and 2' });
    }
  }

  // Max duration validation (only if provided)
  if (data.max_duration_seconds !== undefined) {
    const duration = Number(data.max_duration_seconds);
    if (isNaN(duration) || duration < 60 || duration > 43200) {
      errors.push({ field: 'max_duration_seconds', message: 'Max duration must be between 60 and 43200 seconds' });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
