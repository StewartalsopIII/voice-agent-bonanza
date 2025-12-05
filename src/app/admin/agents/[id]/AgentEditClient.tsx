'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentForm from '@/components/AgentForm';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { Agent } from '@/types';

interface AgentEditClientProps {
  agent: Agent;
}

export default function AgentEditClient({ agent }: AgentEditClientProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete agent');
        setDeleteLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push('/admin');
      router.refresh();

    } catch (error) {
      alert('An error occurred while deleting');
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <AgentForm
        mode="edit"
        agentId={agent.id}
        initialData={{
          name: agent.name,
          type: agent.type,
          created_for: agent.created_for || undefined,
          system_prompt: agent.system_prompt,
          first_message: agent.first_message,
          voice_id: agent.voice_id,
          voice_provider: agent.voice_provider,
          model: agent.model,
          temperature: agent.temperature,
          max_duration_seconds: agent.max_duration_seconds,
        }}
      />

      {/* Delete Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 mt-8">
        <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Deleting an agent will hide it from the dashboard. Call history will be preserved.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
        >
          Delete Agent
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Agent?"
        message={`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`}
        confirmLabel="Delete Agent"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleteLoading}
      />
    </>
  );
}
