'use client';

import { useState } from 'react';
import type { TranscriptMessage } from '@/types';

interface TranscriptViewProps {
  transcript: TranscriptMessage[] | null;
  callId: string;
}

export default function TranscriptView({ transcript, callId }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);

  if (!transcript || transcript.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No transcript available
      </div>
    );
  }

  const formatTranscriptText = () => {
    return transcript
      .map((msg) => `${msg.role === 'assistant' ? 'Agent' : 'User'}: ${msg.content}`)
      .join('\n\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatTranscriptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatTranscriptText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${callId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={handleCopy}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {transcript.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.role === 'assistant'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <div className="text-xs opacity-70 mb-1 font-medium">
                {message.role === 'assistant' ? '🤖 Agent' : '👤 User'}
              </div>
              <div className="text-sm leading-relaxed">{message.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
