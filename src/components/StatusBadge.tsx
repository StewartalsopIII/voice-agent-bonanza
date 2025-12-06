import { getStatusDisplay } from '@/lib/utils';
import type { CallStatus } from '@/types';

interface StatusBadgeProps {
  status: CallStatus;
  showIcon?: boolean;
}

export default function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const display = getStatusDisplay(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${display.bgColor} ${display.textColor}`}>
      {showIcon && <span className="mr-1">{display.icon}</span>}
      {display.label}
    </span>
  );
}
