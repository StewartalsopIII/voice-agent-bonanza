import { VOICE_OPTIONS } from '@/lib/constants';

interface VoiceSelectProps {
  value: string;
  onChange: (voiceId: string, provider: string) => void;
}

export default function VoiceSelect({ value, onChange }: VoiceSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceId = e.target.value;
    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    if (voice) {
      onChange(voice.id, voice.provider);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Voice
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <optgroup label="11Labs Voices">
          {VOICE_OPTIONS.filter(v => v.provider === '11labs').map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="OpenAI Voices">
          {VOICE_OPTIONS.filter(v => v.provider === 'openai').map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
