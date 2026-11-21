import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a 24-hour time string (e.g. "07:00", "23:30") into a clean 12-hour AM/PM string (e.g. "7:00 AM", "11:30 PM").
 */
export function formatTime12(timeStr?: string | null): string {
  if (!timeStr) return 'Not set';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match || !match[1] || !match[2]) return timeStr;
  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${ampm}`;
}
