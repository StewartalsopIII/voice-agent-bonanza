/**
 * Format duration in seconds to human readable string
 * Examples: 125 -> "2m 5s", 45 -> "45s", 3600 -> "1h 0m"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds === 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format a date to relative time string
 * Examples: "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) {
    return 'Never';
  }

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '0%';
  }
  return `${Math.round(value)}%`;
}

/**
 * Format cost in dollars
 */
export function formatCost(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return '$0.00';
  }
  return `$${cents.toFixed(2)}`;
}

/**
 * Map Vapi's endedReason to our simplified status
 */
export function mapEndedReasonToStatus(endedReason: string): 'completed' | 'timed_out' | 'no_connection' | 'error' {
  // Completed successfully
  const completedReasons = [
    'customer-ended-call',
    'assistant-ended-call',
    'assistant-ended-call-after-message-spoken',
    'assistant-said-end-call-phrase',
    'assistant-forwarded-call',
    'assistant-ended-call-after-message',
  ];
  if (completedReasons.includes(endedReason)) {
    return 'completed';
  }

  // Timed out
  const timedOutReasons = [
    'silence-timed-out',
    'exceeded-max-duration',
    'customer-busy',
  ];
  if (timedOutReasons.includes(endedReason)) {
    return 'timed_out';
  }

  // No connection
  const noConnectionReasons = [
    'customer-did-not-answer',
    'customer-did-not-give-microphone-permission',
    'assistant-join-timed-out',
    'phone-call-provider-closed-websocket',
  ];
  if (noConnectionReasons.includes(endedReason)) {
    return 'no_connection';
  }

  // Everything else is an error
  return 'error';
}

/**
 * Get display info for a call status
 */
export function getStatusDisplay(status: 'completed' | 'timed_out' | 'no_connection' | 'error'): {
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
} {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        icon: '✓',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    case 'timed_out':
      return {
        label: 'Timed Out',
        icon: '⏱',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      };
    case 'error':
      return {
        label: 'Error',
        icon: '✗',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      };
    case 'no_connection':
      return {
        label: 'No Connection',
        icon: '📵',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      };
  }
}
