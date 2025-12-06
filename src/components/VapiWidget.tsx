'use client';

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended';

interface TranscriptEntry {
  role: 'user' | 'assistant';
  message: string;
  timestamp: number;
}

interface VapiWidgetProps {
  assistantId: string;
  metadata?: Record<string, unknown>;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  showTranscript?: boolean;
}

export default function VapiWidget({
  assistantId,
  metadata,
  onCallStart,
  onCallEnd,
  showTranscript = true,
}: VapiWidgetProps) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'assistant' | 'user' | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const vapiRef = useRef<Vapi | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Format duration as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Start duration timer
  useEffect(() => {
    if (status === 'connected') {
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (status === 'ended') {
        setDuration(0);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [status]);

  const startCall = async () => {
    try {
      setStatus('connecting');
      setError(null);
      setTranscript([]);
      setCurrentSpeaker(null);

      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Vapi public key not configured');
      }

      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      // Call start
      vapi.on('call-start', () => {
        setStatus('connected');
        onCallStart?.();
      });

      // Call end
      vapi.on('call-end', () => {
        setStatus('ended');
        setCurrentSpeaker(null);
        onCallEnd?.();
      });

      // Error handling
      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        setError(error.message || 'An error occurred during the call');
        setStatus('idle');
      });

      // Transcript updates
      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setTranscript((prev) => [
            ...prev,
            {
              role: message.role,
              message: message.transcript,
              timestamp: Date.now(),
            },
          ]);
        }
      });

      // Speaker updates
      vapi.on('speech-start', () => {
        setCurrentSpeaker('user');
      });

      vapi.on('speech-end', () => {
        setCurrentSpeaker(null);
      });

      // Audio level for visualization
      vapi.on('volume-level', (level) => {
        setAudioLevel(level);
      });

      // Start the call
      await vapi.start(assistantId, {
        metadata: metadata || {},
      });
    } catch (err) {
      console.error('Error starting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setStatus('idle');
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setStatus('ended');
      setCurrentSpeaker(null);
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  // Render audio bars
  const renderAudioBars = () => {
    const barCount = 20;
    const bars = [];

    for (let i = 0; i < barCount; i++) {
      // Height based on audio level with some randomness for animation
      const baseHeight = currentSpeaker ? 20 + audioLevel * 60 : 10;
      const variation = Math.random() * 20;
      const height = Math.min(80, baseHeight + variation);

      const barColor = currentSpeaker === 'user' ? 'bg-green-500' : 'bg-blue-500';

      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${barColor}`}
          style={{ height: `${height}%` }}
        />
      );
    }

    return bars;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Status Display */}
      <div className="mb-6 text-center">
        {status === 'idle' && (
          <p className="text-gray-600 text-lg">Ready to start your call</p>
        )}
        {status === 'connecting' && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-600 text-lg font-medium">Connecting...</p>
          </div>
        )}
        {status === 'connected' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-green-600 text-lg font-medium">Call Active</p>
              <span className="text-gray-600 text-lg font-mono">{formatTime(duration)}</span>
            </div>
            {currentSpeaker && (
              <p className="text-sm text-gray-500">
                {currentSpeaker === 'assistant' ? '🤖 Agent speaking' : '🎤 Listening'}
              </p>
            )}
          </div>
        )}
        {status === 'ended' && (
          <p className="text-gray-600 text-lg">Call ended</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md w-full">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Audio Visualization */}
      {status === 'connected' && (
        <div className="mb-8 w-full max-w-md">
          <div className="h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-end justify-around px-4 py-2 space-x-1">
            {renderAudioBars()}
          </div>
        </div>
      )}

      {/* Live Transcript */}
      {showTranscript && status === 'connected' && transcript.length > 0 && (
        <div className="mb-8 w-full max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      entry.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{entry.message}</p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex items-center space-x-4">
        {status === 'idle' && (
          <button
            onClick={startCall}
            className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Start Call
          </button>
        )}

        {status === 'connected' && (
          <>
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={endCall}
              className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
            >
              End Call
            </button>
          </>
        )}

        {status === 'ended' && (
          <button
            onClick={startCall}
            className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Start New Call
          </button>
        )}
      </div>
    </div>
  );
}
