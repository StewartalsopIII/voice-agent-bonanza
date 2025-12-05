import { MODEL_OPTIONS } from '@/lib/constants';

interface ModelSelectProps {
  value: string;
  onChange: (model: string, provider: string) => void;
}

export default function ModelSelect({ value, onChange }: ModelSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    const model = MODEL_OPTIONS.find(m => m.id === modelId);
    if (model) {
      onChange(model.id, model.provider);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Model
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <optgroup label="OpenAI">
          {MODEL_OPTIONS.filter(m => m.provider === 'openai').map(model => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Anthropic">
          {MODEL_OPTIONS.filter(m => m.provider === 'anthropic').map(model => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Google">
          {MODEL_OPTIONS.filter(m => m.provider === 'google').map(model => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
