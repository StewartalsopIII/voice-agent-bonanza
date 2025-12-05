'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceSelect from './VoiceSelect';
import ModelSelect from './ModelSelect';
import { AGENT_TYPE_OPTIONS, AGENT_DEFAULTS } from '@/lib/constants';
import type { AgentType } from '@/types';

interface AgentFormProps {
  initialData?: {
    name?: string;
    type?: AgentType;
    created_for?: string | null;
    system_prompt?: string;
    first_message?: string;
    voice_id?: string;
    voice_provider?: string;
    model?: string;
    model_provider?: string;
    temperature?: number;
    max_duration_seconds?: number;
  };
  mode: 'create' | 'edit';
  agentId?: string;
}

export default function AgentForm({ initialData = {}, mode, agentId }: AgentFormProps) {
  const router = useRouter();

  // Form state
  const [name, setName] = useState(initialData.name || '');
  const [type, setType] = useState<AgentType>(initialData.type || 'public');
  const [createdFor, setCreatedFor] = useState(initialData.created_for || '');
  const [systemPrompt, setSystemPrompt] = useState(initialData.system_prompt || '');
  const [firstMessage, setFirstMessage] = useState(initialData.first_message || '');
  const [voiceId, setVoiceId] = useState(initialData.voice_id || AGENT_DEFAULTS.voiceId);
  const [voiceProvider, setVoiceProvider] = useState(initialData.voice_provider || AGENT_DEFAULTS.voiceProvider);
  const [model, setModel] = useState(initialData.model || AGENT_DEFAULTS.model);
  const [modelProvider, setModelProvider] = useState(initialData.model_provider || AGENT_DEFAULTS.modelProvider);
  const [temperature, setTemperature] = useState(initialData.temperature ?? AGENT_DEFAULTS.temperature);
  const [maxDurationMinutes, setMaxDurationMinutes] = useState(
    Math.floor((initialData.max_duration_seconds ?? AGENT_DEFAULTS.maxDurationSeconds) / 60)
  );

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Format name as slug
  const formatSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSlug(e.target.value);
    setName(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const payload = {
      name,
      type,
      created_for: type === 'personal' ? createdFor : undefined,
      system_prompt: systemPrompt,
      first_message: firstMessage,
      voice_id: voiceId,
      voice_provider: voiceProvider,
      model,
      model_provider: modelProvider,
      temperature,
      max_duration_seconds: maxDurationMinutes * 60,
    };

    try {
      const url = mode === 'create' ? '/api/agents' : `/api/agents/${agentId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          // Validation errors
          const errors: Record<string, string> = {};
          data.details.forEach((err: { field: string; message: string }) => {
            errors[err.field] = err.message;
          });
          setFieldErrors(errors);
          setError('Please fix the errors below.');
        } else {
          setError(data.error || 'Something went wrong');
        }
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push('/admin');
      router.refresh();

    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Fields */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Basic Configuration</h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent Name
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="my-agent-name"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            This becomes the URL: /agent/{name || 'your-agent-name'}
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agent Type
          </label>
          <div className="space-y-2">
            {AGENT_TYPE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.id}
                  checked={type === option.id}
                  onChange={(e) => setType(e.target.value as AgentType)}
                  className="mt-0.5 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          {fieldErrors.type && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.type}</p>
          )}
        </div>

        {/* Created For (Personal only) */}
        {type === 'personal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created For
            </label>
            <input
              type="text"
              value={createdFor}
              onChange={(e) => setCreatedFor(e.target.value)}
              placeholder="e.g., Dad, Mom, John"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.created_for ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {fieldErrors.created_for && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.created_for}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              This person's name will be shown as the caller in call history.
            </p>
          </div>
        )}

        {/* First Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Message
          </label>
          <textarea
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="What should the agent say when the call starts?"
            rows={2}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.first_message ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {fieldErrors.first_message && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.first_message}</p>
          )}
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Instructions for how the agent should behave..."
            rows={6}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.system_prompt ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {fieldErrors.system_prompt && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.system_prompt}</p>
          )}
        </div>

        {/* Voice */}
        <VoiceSelect
          value={voiceId}
          onChange={(id, provider) => {
            setVoiceId(id);
            setVoiceProvider(provider);
          }}
        />
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-900">Advanced Settings</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="px-6 pb-6 pt-2 space-y-6 border-t border-gray-100">
            {/* Model */}
            <ModelSelect
              value={model}
              onChange={(id, provider) => {
                setModel(id);
                setModelProvider(provider);
              }}
            />

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused (0)</span>
                <span>Balanced (1)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            {/* Max Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={maxDurationMinutes}
                onChange={(e) => setMaxDurationMinutes(parseInt(e.target.value) || 10)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                Call will automatically end after this duration. Max 720 minutes (12 hours).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Agent' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
