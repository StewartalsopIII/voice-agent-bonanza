'use client';

import { useState } from 'react';
import Link from 'next/link';
import TemplateCard from '@/components/TemplateCard';
import AgentForm from '@/components/AgentForm';
import { AGENT_TEMPLATES, getTemplate } from '@/lib/templates';

export default function NewAgentPage() {
  const [step, setStep] = useState<'template' | 'configure'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      setStep('configure');
    }
  };

  const handleBack = () => {
    setStep('template');
  };

  const template = selectedTemplate ? getTemplate(selectedTemplate) : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Agents
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {step === 'template' ? 'Choose a Template' : 'Configure Agent'}
        </h1>
        {step === 'template' && (
          <p className="text-gray-500 mt-1">
            Start with a template or create from scratch
          </p>
        )}
      </div>

      {step === 'template' ? (
        <>
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {AGENT_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                icon={template.icon}
                name={template.name}
                description={template.description}
                selected={selectedTemplate === template.id}
                onClick={() => handleTemplateSelect(template.id)}
              />
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Back to templates */}
          <button
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Change template
          </button>

          {/* Form with template data */}
          <AgentForm
            mode="create"
            initialData={template ? {
              system_prompt: template.systemPrompt,
              first_message: template.firstMessage,
              voice_id: template.voiceId,
              voice_provider: template.voiceProvider,
              model: template.model,
              temperature: template.temperature,
            } : undefined}
          />
        </>
      )}
    </div>
  );
}
