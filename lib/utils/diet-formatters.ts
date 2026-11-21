/**
 * Lightweight formatting utilities for meal timings and diet guidance notes.
 * Pure string functions without any Node.js/binary file parser dependencies,
 * making them completely safe for client components and SSR.
 */

export function formatMealTime(timeStr?: string | null): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match && match[1] && match[2]) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }
  return trimmed;
}

/**
 * Formats guidance notes into clean, bulleted, readable text with proper line breaks.
 * Strictly extracts only genuine lifestyle & hydration reminders (Water, Limit, Walk, Strength, Sleep).
 * Filters out meal menus, table rows, portion keys, mess rules, schedule conflicts, and duplicate text.
 */
export function formatGuidanceBullets(text?: string | null): string {
  if (!text) return '';

  // 1. Split any merged inline labels
  const formatted = text.replace(
    /([.!?])\s*(Water:|Limit:|Walk:|Strength:|Sleep:|Movement:|Hydration:|Protein:|Portions?:|Track:)/gi,
    '$1\n\n• $2'
  );

  const lines = formatted.split('\n').map((l) => l.trim()).filter(Boolean);
  const coreReminders: string[] = [];
  const secondaryReminders: string[] = [];

  for (const line of lines) {
    const clean = line.replace(/^[•\s*-]+/, '').trim();

    // Explicitly reject non-guidance noise
    if (
      /^(?:portion key|mess|meal clock|the intake|how to monitor|clinical|day\s*\d|seven-day|client assessment|first meal|packed tiffin|lighter but|note:)/i.test(
        clean
      )
    ) {
      continue;
    }
    // Reject meal items like "2 rotis", "2 besan chillas", "1 cup rice", "1.5 cups"
    if (/^\d+(\.\d+)?\s*(?:rotis?|besan|cups?|katori|moong|chillas?|vegetable|plain)/i.test(clean)) {
      continue;
    }
    // Reject timing lines like "4:00 PM · Meal 1" or "08:30"
    if (/^\d{1,2}:\d{2}\s*(?:AM|PM)/i.test(clean)) {
      continue;
    }

    // Core lifestyle & hydration topics (Water, Limit, Walk, Strength, Sleep, Movement, Hydration)
    if (/^(?:water|limit|walk|strength|sleep|movement|hydration):/i.test(clean)) {
      const point = '• ' + clean;
      if (!coreReminders.includes(point)) {
        coreReminders.push(point);
      }
    } else if (/^(?:protein|portions?|track):/i.test(clean)) {
      const point = '• ' + clean;
      if (!secondaryReminders.includes(point)) {
        secondaryReminders.push(point);
      }
    }
  }

  if (coreReminders.length > 0) {
    return coreReminders.join('\n\n');
  }

  if (secondaryReminders.length > 0) {
    return secondaryReminders.join('\n\n');
  }

  // Fallback default guidance if no valid reminders were parsed
  return '• Water: Aim for about 2.5–3 L of fluids daily, mainly water; adjust for thirst, heat and sweating. Do not force excess water.\n\n• Limit: Sugary drinks, packaged juices, fried snacks, sweets, heavy gravies, and extra ghee or butter.\n\n• Walk: Aim for 25–30 minutes of brisk walking most days, building up gradually; a 5–10-minute walk after meals also helps activity.\n\n• Strength: Add simple resistance exercises 2–3 days per week to help maintain muscle during weight loss.\n\n• Sleep: Protect 7–9 hours of sleep; for night shifts, keep the bedroom dark and quiet and avoid caffeine near bedtime.';
}

/**
 * Returns today's midnight Date object evaluated in Indian Standard Time (Asia/Kolkata).
 * Ensures consistency across local dev, UTC cloud servers (Vercel), and edge environments.
 */
export function getIndiaTodayDate(): Date {
  const now = new Date();
  const istString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
  const [y, m, d] = istString.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/**
 * Returns tomorrow's date string (YYYY-MM-DD) evaluated in Indian Standard Time (Asia/Kolkata).
 * Used when calculating effective_start_date for diet plans ("1st day starts from next date of applied date").
 */
export function getNextDateIndia(fromDate?: Date | string | null): string {
  let baseDate: Date;
  if (!fromDate) {
    baseDate = getIndiaTodayDate();
  } else if (typeof fromDate === 'string') {
    const parts = fromDate.split('T')[0]!.split('-').map(Number);
    baseDate = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
  } else {
    const istString = fromDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const [y, m, d] = istString.split('-').map(Number);
    baseDate = new Date(y!, m! - 1, d!);
  }

  baseDate.setDate(baseDate.getDate() + 1);
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
