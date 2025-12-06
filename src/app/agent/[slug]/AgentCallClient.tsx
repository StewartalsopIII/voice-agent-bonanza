'use client';

import { useState } from 'react';
import VapiWidget from '@/components/VapiWidget';
import IntakeForm from '@/components/IntakeForm';
import type { AgentType } from '@/types';

interface AgentCallClientProps {
  agent: {
    id: string;
    name: string;
    type: AgentType;
    created_for: string | null;
    vapi_assistant_id: string;
    first_message: string;
  };
  isAdmin: boolean;
}

export default function AgentCallClient({ agent, isAdmin }: AgentCallClientProps) {
  const [callerInfo, setCallerInfo] = useState<string | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const [callActive, setCallActive] = useState(false);

  // Determine if we need to show the intake form
  const needsIntakeForm = agent.type === 'public' && !isAdmin;

  // Determine the caller identifier
  const getCallerIdentifier = (): string => {
    if (isAdmin) {
      return 'Admin Test';
    }
    if (agent.type === 'personal' && agent.created_for) {
      return agent.created_for;
    }
    return callerInfo || 'Unknown';
  };

  // Handle intake form submission
  const handleIntakeSubmit = (info: string) => {
    setCallerInfo(info);
    setShowWidget(true);
  };

  // If we need intake form and haven't submitted it yet
  if (needsIntakeForm && !showWidget) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Before we connect you
          </h2>
          <p className="text-gray-500 text-lg">
            Please let us know who is calling
          </p>
        </div>
        <IntakeForm onSubmit={handleIntakeSubmit} />
      </div>
    );
  }

  // Show the call widget
  return (
    <div className="flex flex-col items-center w-full">
      {/* Show who will be identified as - hide during active call */}
      {!callActive && callerInfo && (
        <div className="mb-8 text-center bg-gray-50 px-4 py-2 rounded-full inline-flex items-center space-x-2">
          <p className="text-sm text-gray-600">
            Speaking as <span className="font-semibold text-gray-900">{callerInfo}</span>
          </p>
          <button
            onClick={() => {
              setCallerInfo(null);
              setShowWidget(false);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline decoration-1 underline-offset-2"
          >
            Change
          </button>
        </div>
      )}

      {!callActive && agent.type === 'personal' && agent.created_for && (
        <div className="mb-8 text-center bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
          <p className="text-sm text-purple-700">
            Authenticated as <span className="font-semibold">{agent.created_for}</span>
          </p>
        </div>
      )}

      {!callActive && isAdmin && (
        <div className="mb-8 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
          Admin Test Mode
        </div>
      )}

      <VapiWidget
        assistantId={agent.vapi_assistant_id}
        metadata={{
          callerInfo: getCallerIdentifier(),
          agentId: agent.id,
          agentName: agent.name,
          agentType: agent.type,
        }}
        showTranscript={true}
        onCallStart={() => setCallActive(true)}
        onCallEnd={() => setCallActive(false)}
      />
    </div>
  );
}
