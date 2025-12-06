import { formatCost } from '@/lib/utils';
import type { CostBreakdown as CostBreakdownType } from '@/types';

interface CostBreakdownProps {
  breakdown: CostBreakdownType | null;
  total: number | null;
}

export default function CostBreakdown({ breakdown, total }: CostBreakdownProps) {
  if (!breakdown && !total) {
    return (
      <div className="text-gray-500 text-sm">
        Cost data not available
      </div>
    );
  }

  const items = breakdown ? [
    { label: 'Speech to Text', value: breakdown.stt },
    { label: 'Language Model', value: breakdown.llm },
    { label: 'Text to Speech', value: breakdown.tts },
    { label: 'Vapi Platform', value: breakdown.vapi },
    { label: 'Transport', value: breakdown.transport },
  ].filter(item => item.value !== undefined) : [];

  return (
    <div>
      {items.length > 0 && (
        <dl className="space-y-2 text-sm mb-4">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between">
              <dt className="text-gray-500">{item.label}</dt>
              <dd className="text-gray-900 font-mono">{formatCost(item.value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex justify-between pt-3 border-t border-gray-200 mt-2">
        <span className="font-medium text-gray-900">Total</span>
        <span className="font-bold text-gray-900 font-mono">{formatCost(total)}</span>
      </div>
    </div>
  );
}
