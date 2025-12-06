import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCallById } from '@/lib/queries/calls';
import { formatDuration } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import TranscriptView from './TranscriptView';
import CostBreakdown from './CostBreakdown';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CallDetailPage({ params }: PageProps) {
  const { id } = await params;

  const call = await getCallById(id);

  if (!call) {
    notFound();
  }

  const startedAt = call.started_at
    ? new Date(call.started_at).toLocaleString()
    : 'Unknown';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/calls"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Call History
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Call Details
          </h1>
          <StatusBadge status={call.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transcript */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Transcript</h2>
            <TranscriptView
              transcript={call.transcript}
              callId={call.id}
            />
          </div>

          {/* Analysis (if available) */}
          {call.analysis && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Analysis</h2>
              {call.analysis.summary && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Summary</h3>
                  <p className="text-gray-900">{call.analysis.summary}</p>
                </div>
              )}
              {call.analysis.successEvaluation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Success Evaluation</h3>
                  <p className="text-gray-900">{call.analysis.successEvaluation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Call Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Call Info</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Caller</dt>
                <dd className="font-medium text-gray-900">{call.caller || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Agent</dt>
                <dd className="font-medium text-gray-900">
                  {call.agent_name ? (
                    <Link
                      href={`/admin/agents/${call.agent_id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {call.agent_name}
                    </Link>
                  ) : (
                    'Unknown'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Duration</dt>
                <dd className="font-medium text-gray-900 font-mono">
                  {formatDuration(call.duration_seconds)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Started</dt>
                <dd className="font-medium text-gray-900">{startedAt}</dd>
              </div>
              <div>
                <dt className="text-gray-500">End Reason</dt>
                <dd className="font-mono text-xs text-gray-600 bg-gray-50 p-1 rounded">
                  {call.ended_reason || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Vapi Call ID</dt>
                <dd className="font-mono text-xs text-gray-600 break-all">
                  {call.vapi_call_id}
                </dd>
              </div>
            </dl>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Cost</h2>
            <CostBreakdown
              breakdown={call.cost_breakdown}
              total={call.cost_total}
            />
          </div>

          {/* Recording */}
          {call.recording_url && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Recording</h2>
              <audio controls className="w-full">
                <source src={call.recording_url} type="audio/mpeg" />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
