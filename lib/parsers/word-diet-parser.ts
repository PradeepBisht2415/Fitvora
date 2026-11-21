import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import {
  DAYS_OF_WEEK,
  DEFAULT_MEAL_TIMES,
  createInitial7DaySchedule,
  type PlanMealSlot,
} from '@/features/diet-plans/plan-builder-store';

export interface ParsedDietPlanResult {
  success: boolean;
  meals: PlanMealSlot[];
  guidanceNotes: string;
  daysFound: string[];
  totalMealsParsed: number;
  rawTextPreview: string;
  error?: string;
}

const DAY_MAP: Record<string, number> = {
  monday: 1,
  mon: 1,
  day1: 1,
  'day 1': 1,
  tuesday: 2,
  tue: 2,
  day2: 2,
  'day 2': 2,
  wednesday: 3,
  wed: 3,
  day3: 3,
  'day 3': 3,
  thursday: 4,
  thu: 4,
  day4: 4,
  'day 4': 4,
  friday: 5,
  fri: 5,
  day5: 5,
  'day 5': 5,
  saturday: 6,
  sat: 6,
  day6: 6,
  'day 6': 6,
  sunday: 0,
  sun: 0,
  day7: 0,
  'day 7': 0,
};

type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner' | string;

function detectMealType(line: string): MealType | null {
  const lower = line.toLowerCase();
  if (lower.includes('morning snack') || lower.includes('mid morning') || lower.includes('mid-morning')) {
    return 'morning_snack';
  }
  if (
    lower.includes('evening snack') ||
    lower.includes('evening tea') ||
    lower.includes('afternoon snack') ||
    lower.includes('chai time')
  ) {
    return 'evening_snack';
  }
  if (lower.includes('breakfast') || lower.includes('nashta') || lower.includes('subah') || lower.includes('meal 1')) {
    return 'breakfast';
  }
  if (lower.includes('lunch') || lower.includes('dopahar') || lower.includes('afternoon meal') || lower.includes('meal 2')) {
    return 'lunch';
  }
  if (lower.includes('post dinner') || lower.includes('bedtime') || lower.includes('night snack')) {
    return 'post_dinner';
  }
  if (lower.includes('dinner') || lower.includes('raat') || lower.includes('evening meal') || lower.includes('meal 3')) {
    return 'dinner';
  }
  if (lower.includes('snack') || lower.includes('meal 4')) {
    return 'evening_snack';
  }
  return null;
}

/**
 * Extracts meal time from text lines (e.g. "8:00 AM", "4:00 PM", "9:00 PM", "2:00 AM", "08:30")
 * Returns normalized 24-hr "HH:mm" string for storage and sorting.
 */
export function extractMealTime(str: string): string | null {
  if (!str) return null;

  // 1. Range like "8:00 AM - 8:30 AM" or "8:00 to 8:30 AM" -> take start time
  const rangeMatch = str.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s*(?:[-–—]|to)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)/i
  );
  const target = rangeMatch ? rangeMatch[1]! : str;

  // 2. 12-hour AM/PM: e.g. 4:00 PM, 9:00 PM, 2:00 AM, 8:30 AM
  const match12 = target.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)/i);
  if (match12 && match12[1]) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? match12[2] : '00';
    const modifier = (match12[3] || 'AM').toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return String(hours).padStart(2, '0') + ':' + minutes;
  }

  // 3. 24-hour: e.g. 08:30, 13:30, 20:30, or "Time: 08:30"
  const match24 = target.match(/(?:time\s*[:–—]?\s*)?([01]?\d|2[0-3]):([0-5]\d)/i);
  if (match24 && match24[1] && match24[2]) {
    return match24[1].padStart(2, '0') + ':' + match24[2];
  }

  return null;
}

/**
 * Formats a 24-hr "16:00" or raw string into clean 12-hr display for cards ("4:00 PM").
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
  let formatted = text.replace(
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

function cleanHtmlText(html: string): string {
  // First handle table cells and rows
  // Within table cells (td/th), replace p and br tags with spaces so cell text stays on one line
  let cleaned = html.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, (_match, inner) => {
    const cellText = inner.replace(/<\/?p[^>]*>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
    return cellText + ' | ';
  });

  // End table rows with newline
  cleaned = cleaned.replace(/<\/tr>/gi, '\n');

  // Headings, paragraphs, and breaks outside cells
  cleaned = cleaned
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return cleaned;
}

function cleanMealContent(line: string): string {
  let str = line
    .replace(
      /^(?:breakfast|morning\s*snack|mid\s*morning|lunch|evening\s*snack|evening\s*tea|dinner|post\s*dinner|snack|meal\s*\d+)/i,
      ''
    )
    .trim();
  str = str.replace(/^[\s:–—|@·-]+/, '').trim();
  str = str
    .replace(
      /^[\s(\[]*(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm|\d{2})|\d{1,2}[:.]\d{2})(?:\s*[-–—to]+\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm|\d{2})|\s*(?:AM|PM|am|pm))?[\s)\]]*/i,
      ''
    )
    .trim();
  str = str.replace(/^[\s:–—|@·-]+/, '').trim();
  return str;
}

function extractPortionFromText(rawText: string): { title: string; portion: string } {
  const parenMatch = rawText.match(/^(.*?)\(([^)]+)\)(.*)$/);
  if (parenMatch && parenMatch[1] && parenMatch[2]) {
    const title = parenMatch[1].trim();
    const portion = parenMatch[2].trim();
    return { title: title || rawText.trim(), portion: portion || '1 standard portion' };
  }

  const dashMatch = rawText.match(
    /^(.*?)\s*[-—–]\s*(1\s*(?:katori|bowl|plate|cup|glass|piece|pcs|roti|phulka).*)$/i
  );
  if (dashMatch && dashMatch[1] && dashMatch[2]) {
    return { title: dashMatch[1].trim(), portion: dashMatch[2].trim() };
  }

  return { title: rawText.trim(), portion: 'Standard household portion' };
}

function parseSwaps(rawSwaps: string): { title: string; portion: string }[] {
  if (!rawSwaps) return [];
  const parts = rawSwaps
    .split(/[,;\n•|]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.map((part) => {
    const { title, portion } = extractPortionFromText(part);
    return { title, portion };
  });
}

function isPdfBuffer(buffer: Buffer, fileName?: string): boolean {
  if (fileName?.toLowerCase().endsWith('.pdf')) return true;
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') return true;
  return false;
}

interface TableColumnInfo {
  colIndex: number;
  rawHeader: string;
  time: string;
  mealType: PlanMealSlot['mealType'];
  mealLabel: string;
  orderIndex: number;
}

/**
 * Attempts to parse structured 7-day grid tables like:
 * | Day | 4:00 PM · Meal 1 | 9:00 PM · Meal 2 | 2:00 AM · Meal 3 |
 * | Day 1 | 2 besan chillas... | 2 rotis + dal... | 1.5 cups daliya... |
 */
function parseTablePlan(lines: string[]): { meals: PlanMealSlot[]; daysFound: string[] } | null {
  let headerIndex = -1;
  const mealColumns: TableColumnInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line.includes('|') && !line.includes('\t')) continue;

    const parts = line.split(/[|\t]/).map((p) => p.trim()).filter(Boolean);
    const hasMealCol = parts.slice(1).some((p) =>
      /meal\s*\d|am|pm|breakfast|lunch|dinner|snack|nashta|dopahar|raat/i.test(p)
    );
    const isDayHeader =
      parts.length >= 2 &&
      /^\s*(?:day|days|date|s\.?no|#|meal\s*schedule|schedule)\s*$/i.test(parts[0]!) &&
      hasMealCol;

    if (isDayHeader) {
      headerIndex = i;
      for (let c = 1; c < parts.length; c++) {
        const colHeader = parts[c]!;
        const lowerHeader = colHeader.toLowerCase();
        let mealType: PlanMealSlot['mealType'] = 'breakfast';
        let mealLabel = 'Meal 1';

        if (/lunch|dopahar/i.test(lowerHeader) || /meal\s*2/i.test(lowerHeader)) {
          mealType = 'lunch';
          mealLabel = /meal\s*2/i.test(lowerHeader) ? 'Meal 2' : 'Lunch';
        } else if (/dinner|raat/i.test(lowerHeader) || /meal\s*3/i.test(lowerHeader)) {
          mealType = 'dinner';
          mealLabel = /meal\s*3/i.test(lowerHeader) ? 'Meal 3' : 'Dinner';
        } else if (/snack|tea|chai/i.test(lowerHeader) || /meal\s*4/i.test(lowerHeader)) {
          mealType = 'evening_snack';
          mealLabel = /meal\s*4/i.test(lowerHeader) ? 'Meal 4' : 'Evening Snack';
        } else if (/breakfast|nashta|subah/i.test(lowerHeader) || /meal\s*1/i.test(lowerHeader)) {
          mealType = 'breakfast';
          mealLabel = /meal\s*1/i.test(lowerHeader) ? 'Meal 1' : 'Breakfast';
        } else {
          mealLabel = `Meal ${c}`;
          mealType = c === 1 ? 'breakfast' : c === 2 ? 'lunch' : c === 3 ? 'dinner' : 'evening_snack';
        }

        const explicitTime = extractMealTime(colHeader);
        const time =
          explicitTime ||
          DEFAULT_MEAL_TIMES[mealType] ||
          (mealType === 'breakfast'
            ? '08:30'
            : mealType === 'lunch'
            ? '13:30'
            : mealType === 'dinner'
            ? '20:30'
            : '17:30');

        mealColumns.push({
          colIndex: c,
          rawHeader: colHeader,
          time,
          mealType,
          mealLabel,
          orderIndex: c - 1,
        });
      }
      break;
    }
  }

  if (headerIndex === -1 || mealColumns.length === 0) return null;

  const parsedMeals: PlanMealSlot[] = [];
  const daysDetected = new Set<string>();

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line.includes('|') && !line.includes('\t')) continue;

    const parts = line.split(/[|\t]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const dayLabel = parts[0]!.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    let dayOfWeek = DAY_MAP[dayLabel];
    if (dayOfWeek === undefined) {
      const dayMatch = dayLabel.match(/(?:day\s*(\d)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun))/i);
      if (dayMatch) {
        const key = (dayMatch[1] ? `day ${dayMatch[1]}` : dayMatch[2]!).toLowerCase();
        dayOfWeek = DAY_MAP[key];
      }
    }
    if (dayOfWeek === undefined) continue;

    daysDetected.add(parts[0]!);

    for (const col of mealColumns) {
      const content = parts[col.colIndex];
      if (!content || content.length < 2) continue;

      const { title, portion } = extractPortionFromText(content);

      parsedMeals.push({
        id: `slot_${dayOfWeek}_${col.mealType}`,
        dayOfWeek,
        mealType: col.mealType,
        scheduledTime: col.time,
        customTitle: content.trim(),
        customPortion: portion !== 'Standard household portion' ? portion : 'Measured menu serving',
        customNotes: col.mealLabel,
        customAlternatives: [],
        allergenTags: [],
        orderIndex: col.orderIndex,
      });
    }
  }

  if (parsedMeals.length >= 1) {
    const sorted = parsedMeals.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.orderIndex - b.orderIndex;
    });

    return {
      meals: sorted,
      daysFound: Array.from(daysDetected),
    };
  }

  return null;
}

/**
 * Parses transposed tables where column headers are Days (Monday..Sunday or Day 1..7)
 * and row headers are Meals (Breakfast, Lunch, etc.).
 */
function parseTransposedTablePlan(lines: string[]): { meals: PlanMealSlot[]; daysFound: string[] } | null {
  let headerIndex = -1;
  const dayColumns: { colIndex: number; dayOfWeek: number; dayName: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line.includes('|') && !line.includes('\t')) continue;
    const parts = line.split(/[|\t]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    // Check if parts[1..] are days
    const matchedDays: { colIndex: number; dayOfWeek: number; dayName: string }[] = [];
    for (let c = 1; c < parts.length; c++) {
      const col = parts[c]!.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      let dow = DAY_MAP[col];
      if (dow === undefined) {
        const m = col.match(/(?:day\s*(\d)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun))/i);
        if (m) {
          const key = (m[1] ? `day ${m[1]}` : m[2]!).toLowerCase();
          dow = DAY_MAP[key];
        }
      }
      if (dow !== undefined) {
        matchedDays.push({ colIndex: c, dayOfWeek: dow, dayName: parts[c]! });
      }
    }

    if (matchedDays.length >= 2) {
      headerIndex = i;
      dayColumns.push(...matchedDays);
      break;
    }
  }

  if (headerIndex === -1 || dayColumns.length === 0) return null;

  const parsedMeals: PlanMealSlot[] = [];
  const daysDetected = new Set<string>();
  let mealRowIndex = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line.includes('|') && !line.includes('\t')) continue;
    const parts = line.split(/[|\t]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const mealHeader = parts[0]!;
    const detectedType = detectMealType(mealHeader);
    if (!detectedType && !/meal\s*\d/i.test(mealHeader)) continue;

    const mealType = detectedType || (mealRowIndex === 0 ? 'breakfast' : mealRowIndex === 1 ? 'lunch' : 'dinner');
    const time = extractMealTime(mealHeader) || DEFAULT_MEAL_TIMES[mealType] || '08:30';
    const mealLabel = /meal\s*\d/i.test(mealHeader)
      ? mealHeader.match(/meal\s*\d/i)![0]
      : mealType.charAt(0).toUpperCase() + mealType.slice(1).replace('_', ' ');

    for (const d of dayColumns) {
      const content = parts[d.colIndex];
      if (!content || content.length < 2) continue;
      daysDetected.add(d.dayName);

      const { title, portion } = extractPortionFromText(content);
      parsedMeals.push({
        id: `slot_${d.dayOfWeek}_${mealType}`,
        dayOfWeek: d.dayOfWeek,
        mealType: mealType as PlanMealSlot['mealType'],
        scheduledTime: time,
        customTitle: content.trim(),
        customPortion: portion !== 'Standard household portion' ? portion : 'Measured menu serving',
        customNotes: mealLabel,
        customAlternatives: [],
        allergenTags: [],
        orderIndex: mealRowIndex,
      });
    }
    mealRowIndex++;
  }

  if (parsedMeals.length >= 1) {
    const sorted = parsedMeals.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.orderIndex - b.orderIndex;
    });

    return {
      meals: sorted,
      daysFound: Array.from(daysDetected),
    };
  }

  return null;
}

/**
 * Parses section-based and line-by-line diet plans with variable meal counts
 * (e.g. only Breakfast, only Lunch, or Breakfast & Lunch).
 * Strictly preserves ONLY the meals specified in the document without phantom extras.
 */
function parseSectionPlan(lines: string[]): { meals: PlanMealSlot[]; daysFound: string[] } | null {
  const parsedMeals: PlanMealSlot[] = [];
  const daysDetected = new Set<string>();

  let currentDayOfWeek: number | null = null;
  let activeSectionMealType: MealType | null = null;
  let activeSectionMealTime: string | null = null;
  let activeSectionMealLabel: string | null = null;

  // Single-day / general schedule container
  const genericDailyMeals: {
    mealType: PlanMealSlot['mealType'];
    time: string;
    title: string;
    portion: string;
    notes?: string;
  }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]!.trim();
    if (!rawLine || rawLine.includes('|')) continue;

    // Skip guidance and lifestyle reminders
    if (
      /^(?:guidance|lifestyle|water:|limit:|walk:|strength:|sleep:|mess|how to monitor|clinical|the intake|portion key)/i.test(
        rawLine
      )
    ) {
      continue;
    }

    // 1. Day heading check
    const cleanLineLower = rawLine.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    let matchedDay: number | null = null;
    let dayLabelFound: string | null = null;

    for (const [key, val] of Object.entries(DAY_MAP)) {
      if (
        cleanLineLower === key ||
        cleanLineLower.startsWith(key + ' ') ||
        cleanLineLower.endsWith(' ' + key) ||
        cleanLineLower.startsWith(key + ':')
      ) {
        matchedDay = val;
        dayLabelFound = key.charAt(0).toUpperCase() + key.slice(1);
        break;
      }
    }

    if (matchedDay === null) {
      const dayMatch = rawLine.match(/\b(?:day\s*(\d)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i);
      if (dayMatch) {
        const key = (dayMatch[1] ? `day ${dayMatch[1]}` : dayMatch[2]!).toLowerCase();
        matchedDay = DAY_MAP[key] ?? null;
        if (matchedDay !== null) {
          dayLabelFound = key.charAt(0).toUpperCase() + key.slice(1);
        }
      }
    }

    if (matchedDay !== null) {
      currentDayOfWeek = matchedDay;
      if (dayLabelFound) daysDetected.add(dayLabelFound);

      // Check if meal is also on this exact same line (e.g. "Day 1 - Lunch (1:30 PM): Dal Tadka")
      const detectedOnSame = detectMealType(rawLine);
      if (detectedOnSame) {
        const timeFound = extractMealTime(rawLine) || DEFAULT_MEAL_TIMES[detectedOnSame] || '08:30';
        const cleaned = cleanMealContent(
          rawLine.replace(/^(?:day\s*\d|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[\s:–—-]*/i, '')
        );
        if (cleaned.length > 2) {
          const { title, portion } = extractPortionFromText(cleaned);
          parsedMeals.push({
            id: `slot_${matchedDay}_${detectedOnSame}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            dayOfWeek: matchedDay,
            mealType: detectedOnSame as PlanMealSlot['mealType'],
            scheduledTime: timeFound,
            customTitle: title,
            customPortion: portion,
            customNotes: detectedOnSame.charAt(0).toUpperCase() + detectedOnSame.slice(1).replace('_', ' '),
            customAlternatives: [],
            allergenTags: [],
            orderIndex: 0,
          });
        }
      }
      continue;
    }

    // 2. Meal heading check (e.g. "Breakfast (8:30 AM): Vegetable Poha" or "Lunch: 2 rotis + dal")
    const detectedMealType = detectMealType(rawLine);
    if (detectedMealType) {
      const extractedTime = extractMealTime(rawLine) || DEFAULT_MEAL_TIMES[detectedMealType] || '08:30';
      const mealLabel = /meal\s*\d/i.test(rawLine)
        ? rawLine.match(/meal\s*\d/i)![0]
        : detectedMealType.charAt(0).toUpperCase() + detectedMealType.slice(1).replace('_', ' ');

      const content = cleanMealContent(rawLine);

      if (content.length > 2) {
        const { title, portion } = extractPortionFromText(content);
        if (currentDayOfWeek !== null) {
          parsedMeals.push({
            id: `slot_${currentDayOfWeek}_${detectedMealType}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            dayOfWeek: currentDayOfWeek,
            mealType: detectedMealType as PlanMealSlot['mealType'],
            scheduledTime: extractedTime,
            customTitle: title,
            customPortion: portion,
            customNotes: mealLabel,
            customAlternatives: [],
            allergenTags: [],
            orderIndex: 0,
          });
        } else {
          genericDailyMeals.push({
            mealType: detectedMealType as PlanMealSlot['mealType'],
            time: extractedTime,
            title,
            portion,
            notes: mealLabel,
          });
        }
      } else {
        activeSectionMealType = detectedMealType;
        activeSectionMealTime = extractedTime;
        activeSectionMealLabel = mealLabel;
      }
      continue;
    }

    // 3. Food item on next line under activeSectionMealType
    if (activeSectionMealType && rawLine.length > 2) {
      const dayMatchInLine = rawLine.match(
        /^(?:day\s*(\d)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday))[\s:–—-]*(.*)$/i
      );

      if (dayMatchInLine) {
        const key = (dayMatchInLine[1] ? `day ${dayMatchInLine[1]}` : dayMatchInLine[2]!).toLowerCase();
        const dow = DAY_MAP[key];
        const foodText = (dayMatchInLine[3] || '').trim();
        if (dow !== undefined && foodText.length > 2) {
          daysDetected.add(key.charAt(0).toUpperCase() + key.slice(1));
          const { title, portion } = extractPortionFromText(foodText);
          parsedMeals.push({
            id: `slot_${dow}_${activeSectionMealType}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            dayOfWeek: dow,
            mealType: activeSectionMealType as PlanMealSlot['mealType'],
            scheduledTime: activeSectionMealTime || DEFAULT_MEAL_TIMES[activeSectionMealType] || '08:30',
            customTitle: title,
            customPortion: portion,
            customNotes: activeSectionMealLabel || activeSectionMealType,
            customAlternatives: [],
            allergenTags: [],
            orderIndex: 0,
          });
          continue;
        }
      }

      if (currentDayOfWeek !== null) {
        const { title, portion } = extractPortionFromText(rawLine);
        parsedMeals.push({
          id: `slot_${currentDayOfWeek}_${activeSectionMealType}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          dayOfWeek: currentDayOfWeek,
          mealType: activeSectionMealType as PlanMealSlot['mealType'],
          scheduledTime: activeSectionMealTime || DEFAULT_MEAL_TIMES[activeSectionMealType] || '08:30',
          customTitle: title,
          customPortion: portion,
          customNotes: activeSectionMealLabel || activeSectionMealType,
          customAlternatives: [],
          allergenTags: [],
          orderIndex: 0,
        });
        activeSectionMealType = null;
      }
    }
  }

  // If only general daily meals were supplied (no days separated), replicate them across all 7 days
  if (parsedMeals.length === 0 && genericDailyMeals.length > 0) {
    const allDays = [1, 2, 3, 4, 5, 6, 0];
    for (const dow of allDays) {
      genericDailyMeals.forEach((gm, idx) => {
        parsedMeals.push({
          id: `slot_${dow}_${gm.mealType}_${idx}`,
          dayOfWeek: dow,
          mealType: gm.mealType,
          scheduledTime: gm.time,
          customTitle: gm.title,
          customPortion: gm.portion,
          customNotes: gm.notes || gm.mealType,
          customAlternatives: [],
          allergenTags: [],
          orderIndex: idx,
        });
      });
    }
  }

  if (parsedMeals.length > 0) {
    const dayMealOrder: Record<number, number> = {};
    const sorted = parsedMeals.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    const finalMeals = sorted.map((m) => {
      const idx = dayMealOrder[m.dayOfWeek] || 0;
      dayMealOrder[m.dayOfWeek] = idx + 1;
      return { ...m, orderIndex: idx };
    });

    return {
      meals: finalMeals,
      daysFound: Array.from(daysDetected),
    };
  }

  return null;
}

/**
 * Extracts comprehensive lifestyle, hydration, movement, and shift guidance notes.
 */
function extractAllGuidanceNotes(lines: string[]): string {
  const guidanceLines: string[] = [];
  let inGuidanceSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line || line.includes('|')) continue;
    const lower = line.toLowerCase();

    // Trigger ONLY on actual Guidance & Hydration section headings
    if (
      lower.includes('guidance & hydration reminders') ||
      lower === 'guidance & hydration' ||
      lower === 'hydration & lifestyle guidance' ||
      lower.startsWith('guidance & hydration')
    ) {
      inGuidanceSection = true;
      continue;
    }

    // Stop if a subsequent major section begins
    if (
      inGuidanceSection &&
      (lower.startsWith('seven-day menu') ||
        lower.startsWith('client assessment') ||
        lower.startsWith('mess / tiffin') ||
        lower.startsWith('how to monitor') ||
        lower.startsWith('clinical'))
    ) {
      inGuidanceSection = false;
      continue;
    }

    if (inGuidanceSection) {
      if (/^(?:water|limit|walk|strength|sleep|movement|hydration):/i.test(line)) {
        guidanceLines.push(line);
      }
    }
  }

  if (guidanceLines.length > 0) {
    return formatGuidanceBullets(guidanceLines.join('\n\n'));
  }

  // Fallback: search lines for core guidance labels
  for (const line of lines) {
    if (/^(?:water|limit|walk|strength|sleep|movement|hydration):/i.test(line)) {
      guidanceLines.push(line);
    }
  }

  if (guidanceLines.length > 0) {
    return formatGuidanceBullets(guidanceLines.join('\n\n'));
  }

  return formatGuidanceBullets(
    '• Water: Aim for about 2.5–3 L of fluids daily, mainly water; adjust for thirst, heat and sweating. Do not force excess water.\n\n• Limit: Sugary drinks, packaged juices, fried snacks, sweets, heavy gravies, and extra ghee or butter.\n\n• Walk: Aim for 25–30 minutes of brisk walking most days, building up gradually; a 5–10-minute walk after meals also helps activity.\n\n• Strength: Add simple resistance exercises 2–3 days per week to help maintain muscle during weight loss.\n\n• Sleep: Protect 7–9 hours of sleep; for night shifts, keep the bedroom dark and quiet and avoid caffeine near bedtime.'
  );
}

/**
 * Unified Diet Plan Parser supporting both PDF (.pdf) and Word (.docx/.doc) files.
 * Accurately extracts meal timing (e.g. 4:00 PM, 9:00 PM, 2:00 AM) and meal cards directly from the diet plan document.
 */
export async function parseDietPlanFile(
  buffer: Buffer,
  fileName?: string
): Promise<ParsedDietPlanResult> {
  try {
    let rawText = '';
    let tableText = '';

    if (buffer.length === 0) {
      rawText = '';
    } else if (isPdfBuffer(buffer, fileName)) {
      const parser = new PDFParse({ data: buffer });
      try {
        const parsed = await parser.getText();
        rawText = parsed.text || '';
      } finally {
        await parser.destroy();
      }
    } else {
      try {
        const rawResult = await mammoth.extractRawText({ buffer });
        const htmlResult = await mammoth.convertToHtml({ buffer });
        rawText = rawResult.value || '';
        tableText = cleanHtmlText(htmlResult.value || '');
      } catch {
        rawText = buffer.toString('utf-8');
      }
    }

    const rawLines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const tableLines = tableText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const combinedLines = [...rawLines, ...tableLines];

    // 1. Try table plan parsing first (e.g. 7-day grid with Day 1..Day 7 and Meal 1..Meal 3)
    const tableResult = parseTablePlan(combinedLines);
    // 2. Extract clean guidance notes strictly from raw text (avoids duplicated table text)
    const guidanceNotes = extractAllGuidanceNotes(rawLines.length > 0 ? rawLines : combinedLines);

    if (tableResult && tableResult.meals.length > 0) {
      return {
        success: true,
        meals: tableResult.meals,
        guidanceNotes,
        daysFound: tableResult.daysFound,
        totalMealsParsed: tableResult.meals.length,
        rawTextPreview: rawText.slice(0, 500),
      };
    }

    // 2. Try transposed table parsing (Meals in rows, Days in columns)
    const transposedResult = parseTransposedTablePlan(combinedLines);
    if (transposedResult && transposedResult.meals.length > 0) {
      return {
        success: true,
        meals: transposedResult.meals,
        guidanceNotes,
        daysFound: transposedResult.daysFound,
        totalMealsParsed: transposedResult.meals.length,
        rawTextPreview: rawText.slice(0, 500),
      };
    }

    // 3. Fall back to section/line-by-line parsing (strictly extracts ONLY meals present in document)
    const sectionResult = parseSectionPlan(combinedLines);
    if (sectionResult && sectionResult.meals.length > 0) {
      return {
        success: true,
        meals: sectionResult.meals,
        guidanceNotes,
        daysFound: sectionResult.daysFound,
        totalMealsParsed: sectionResult.meals.length,
        rawTextPreview: rawText.slice(0, 500),
      };
    }

    // 4. If buffer was empty, return standard template for backwards compatibility
    if (buffer.length === 0) {
      return {
        success: true,
        meals: createInitial7DaySchedule(),
        guidanceNotes,
        daysFound: [],
        totalMealsParsed: 28,
        rawTextPreview: '',
      };
    }

    // If a document was uploaded but no meals could be extracted
    return {
      success: false,
      meals: [],
      guidanceNotes,
      daysFound: [],
      totalMealsParsed: 0,
      rawTextPreview: rawText.slice(0, 500),
      error:
        'Could not detect any meals in the uploaded document. Please ensure meals are labeled (e.g. Breakfast, Lunch, Dinner, or Meal 1, Meal 2).',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown diet plan parsing error';
    return {
      success: false,
      meals: buffer.length === 0 ? createInitial7DaySchedule() : [],
      guidanceNotes: '',
      daysFound: [],
      totalMealsParsed: 0,
      rawTextPreview: '',
      error: errorMsg,
    };
  }
}

/**
 * Backwards compatibility alias for parseDietPlanFile
 */
export async function parseWordDietPlan(buffer: Buffer): Promise<ParsedDietPlanResult> {
  return parseDietPlanFile(buffer);
}
