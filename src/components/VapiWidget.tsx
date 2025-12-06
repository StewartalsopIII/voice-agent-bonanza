'use client';

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended';

interface VapiWidgetProps {
  assistantId: string;
  metadata?: Record<string, any>;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

export default function VapiWidget({
  assistantId,
  metadata,
  onCallStart,
  onCallEnd,
}: VapiWidgetProps) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);

  // Initialize Vapi and cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  const startCall = async () => {
    setError(null);
    setStatus('connecting');

    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Vapi public key not configured');
      }

      // Create Vapi instance only on client side
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      // Set up event listeners
      vapi.on('call-start', () => {
        console.log('[Vapi] Call started');
        setStatus('connected');
        onCallStart?.();
      });

      vapi.on('call-end', () => {
        console.log('[Vapi] Call ended');
        setStatus('ended');
        onCallEnd?.();
      });

      vapi.on('error', (error) => {
        console.error('[Vapi] Error:', error);
        setError(error.message || 'An error occurred');
        setStatus('idle');
      });

      vapi.on('speech-start', () => {
        // Optional: Add visual indicator for speaking
      });

      vapi.on('speech-end', () => {
        // Optional: Remove visual indicator
      });

      // Start the call with metadata
      await vapi.start(assistantId, {
        metadata: metadata || {},
      });

    } catch (err) {
      console.error('[Vapi] Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setStatus('idle');
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      // Don't nullify ref immediately, wait for event
    }
    // Force status update in case event doesn't fire immediately
    setStatus('ended');
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const resetCall = () => {
    setStatus('idle');
    setError(null);
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Status Display */}
      <div className="mb-8 text-center min-h-[4rem] flex flex-col justify-center">
        {status === 'idle' && (
          <p className="text-gray-600">Ready to start your call</p>
        )}
        {status === 'connecting' && (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-600 font-medium">Connecting...</p>
          </div>
        )}
        {status === 'connected' && (
          <div className="flex items-center justify-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-green-600 font-medium">Connected</p>
          </div>
        )}
        {status === 'ended' && (
          <p className="text-gray-800 font-medium">Call ended</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm w-full text-center border border-red-200">
          {error}
        </div>
      )}

      {/* Call Controls */}
      <div className="flex items-center justify-center space-x-4 w-full">
        {status === 'idle' && (
          <button
            onClick={startCall}
            className="w-full py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Start Call</span>
          </button>
        )}

        {status === 'connecting' && (
          <button
            disabled
            className="w-full py-4 bg-gray-200 text-gray-500 rounded-full font-medium text-lg cursor-not-allowed"
          >
            Connecting...
          </button>
        )}

        {status === 'connected' && (
          <>
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="flex-1 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium text-lg flex items-center justify-center space-x-2 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
              <span>End Call</span>
            </button>
          </>
        )}

        {status === 'ended' && (
          <button
            onClick={resetCall}
            className="w-full py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg"
          >
            Start New Call
          </button>
        )}
      </div>

      {/* Microphone Permission Note */}
      {status === 'idle' && (
        <p className="mt-6 text-sm text-gray-500">
          You'll be asked to allow microphone access
        </p>
      )}
    </div>
  );
}
