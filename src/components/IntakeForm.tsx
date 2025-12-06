'use client';

import { useState } from 'react';

interface IntakeFormProps {
  onSubmit: (callerInfo: string) => void;
}

export default function IntakeForm({ onSubmit }: IntakeFormProps) {
  const [callerInfo, setCallerInfo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = callerInfo.trim();
    if (!trimmed) {
      setError('Please enter your name or how you found this page');
      return;
    }

    if (trimmed.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="mb-6">
        <label
          htmlFor="callerInfo"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Your name or how you connected with Stewart
        </label>
        <input
          id="callerInfo"
          type="text"
          value={callerInfo}
          onChange={(e) => {
            setCallerInfo(e.target.value);
            setError('');
          }}
          placeholder="e.g., John from the AI workshop"
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          }`}
          autoFocus
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-sm"
      >
        Continue to Call
      </button>
    </form>
  );
}
