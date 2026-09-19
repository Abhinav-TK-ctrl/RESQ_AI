import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | number | Date | null): string {
  if (!dateString) return 'Recently';

  if (typeof dateString === 'string') {
    const trimmed = dateString.trim();
    if (!trimmed) return 'Recently';
    // If already pre-formatted with time/IST/Today
    if (trimmed.includes('IST') || trimmed.includes('Today') || trimmed.includes('Yesterday') || trimmed.includes('ago')) {
      return trimmed;
    }
  }

  try {
    const date = typeof dateString === 'object' && dateString instanceof Date
      ? dateString
      : new Date(dateString);

    if (isNaN(date.getTime())) {
      if (typeof dateString === 'string' && dateString.length > 0 && dateString.length < 50) {
        return dateString;
      }
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return typeof dateString === 'string' ? dateString : 'Recently';
  }
}

export function formatRelativeTime(dateString?: string | number | Date | null): string {
  if (!dateString) return 'Just now';
  try {
    if (typeof dateString === 'string') {
      const trimmed = dateString.trim();
      if (trimmed.includes('ago') || trimmed.includes('IST')) {
        return trimmed;
      }
    }

    const now = new Date();
    const past = typeof dateString === 'object' && dateString instanceof Date
      ? dateString
      : new Date(dateString);

    if (isNaN(past.getTime())) {
      return typeof dateString === 'string' ? dateString : 'Just now';
    }

    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffInSeconds < 0 || diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  } catch {
    return typeof dateString === 'string' ? dateString : 'Just now';
  }
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low' | string): {
  bg: string;
  text: string;
  border: string;
  ring: string;
} {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return {
        bg: 'bg-red-500/10 dark:bg-red-950/40',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800/60',
        ring: 'ring-red-500/30',
      };
    case 'high':
    case 'urgent':
      return {
        bg: 'bg-orange-500/10 dark:bg-orange-950/40',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800/60',
        ring: 'ring-orange-500/30',
      };
    case 'medium':
    case 'active':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/60',
        ring: 'ring-amber-500/30',
      };
    case 'low':
    case 'resolved':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        ring: 'ring-emerald-500/30',
      };
    default:
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/60',
        ring: 'ring-blue-500/30',
      };
  }
}
