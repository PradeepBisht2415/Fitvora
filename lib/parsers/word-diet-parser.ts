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

type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner';

function detectMealType(line: string): MealType | null {
  const lower = line.toLowerCase();
  if (lower.includes('morning snack') || lower.includes('mid morning') || lower.includes('mid-morning')) {
    return 'morning_snack';
  }
  if (
    lower.includes('evening snack') ||
    lower.includes('evening tea') ||
    lower.includes('afternoon snack') ||
    lower.includes('snack') ||
    lower.includes('chai time')
  ) {
    return 'evening_snack';
  }
  if (lower.includes('breakfast') || lower.includes('nashta') || lower.includes('subah')) {
    return 'breakfast';
  }
  if (lower.includes('lunch') || lower.includes('dopahar') || lower.includes('afternoon meal')) {
    return 'lunch';
  }
  if (lower.includes('post dinner') || lower.includes('bedtime') || lower.includes('night snack')) {
    return 'post_dinner';
  }
  if (lower.includes('dinner') || lower.includes('raat') || lower.includes('evening meal')) {
    return 'dinner';
  }
  return null;
}

/**
 * Extracts meal time from text lines (e.g. "8:00 AM", "8:30 AM", "1:30 PM", "8:30 PM", "08:30")
 * Returns normalized 24-hr "HH:mm" string for storage and sorting.
 */
export function extractMealTime(str: string): string | null {
  if (!str) return null;

  // 1. Range like "8:00 AM - 8:30 AM" or "8:00 to 8:30 AM" -> take start time
  const rangeMatch = str.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s*(?:[-–—]|to)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)/i
  );
  const target = rangeMatch ? rangeMatch[1]! : str;

  // 2. 12-hour AM/PM: e.g. 8:30 AM, 08:30 am, 1:30 PM, 8 AM, 8PM
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
 * Formats a 24-hr "08:00" or raw string into clean 12-hr display for cards ("8:00 AM").
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

function cleanHtmlText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanMealContent(line: string): string {
  // 1. Remove meal type label
  let str = line
    .replace(
      /^(?:breakfast|morning\s*snack|mid\s*morning|lunch|evening\s*snack|evening\s*tea|dinner|post\s*dinner|snack)/i,
      ''
    )
    .trim();
  // 2. Remove leading delimiter
  str = str.replace(/^[\s:–—|@-]+/, '').trim();
  // 3. Remove time bracket or timing indicator if present at start (e.g. "(8:30 AM)", "9:00 AM:", "[8:00 AM - 8:30 AM]")
  str = str
    .replace(
      /^[\s(\[]*(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm|\d{2})|\d{1,2}[:.]\d{2})(?:\s*[-–—to]+\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm|\d{2})|\s*(?:AM|PM|am|pm))?[\s)\]]*/i,
      ''
    )
    .trim();
  // 4. Remove any remaining leading delimiter
  str = str.replace(/^[\s:–—|@-]+/, '').trim();
  return str;
}

function extractPortionFromText(rawText: string): { title: string; portion: string } {
  // Check for parenthesis: e.g. "Vegetable Poha (1 medium bowl / 200g)"
  const parenMatch = rawText.match(/^(.*?)\(([^)]+)\)(.*)$/);
  if (parenMatch && parenMatch[1] && parenMatch[2]) {
    const title = parenMatch[1].trim();
    const portion = parenMatch[2].trim();
    return { title: title || rawText.trim(), portion: portion || '1 standard portion' };
  }

  // Check for dash/hyphen: e.g. "Vegetable Poha - 1 medium bowl"
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

/**
 * Unified Diet Plan Parser supporting both PDF (.pdf) and Word (.docx/.doc) files.
 * Accurately extracts meal timing (e.g. 8:00 AM, 1:30 PM) directly from the diet plan document.
 */
export async function parseDietPlanFile(
  buffer: Buffer,
  fileName?: string
): Promise<ParsedDietPlanResult> {
  try {
    let rawText = '';
    let tableText = '';

    if (buffer.length === 0) {
      // Empty buffer test fallback
      rawText = '';
    } else if (isPdfBuffer(buffer, fileName)) {
      // PDF text extraction using PDFParse
      const parser = new PDFParse({ data: buffer });
      try {
        const parsed = await parser.getText();
        rawText = parsed.text || '';
      } finally {
        await parser.destroy();
      }
    } else {
      // Word (.docx / .doc) extraction
      try {
        const rawResult = await mammoth.extractRawText({ buffer });
        const htmlResult = await mammoth.convertToHtml({ buffer });
        rawText = rawResult.value || '';
        tableText = cleanHtmlText(htmlResult.value || '');
      } catch {
        // Fallback UTF-8 text
        rawText = buffer.toString('utf-8');
      }
    }

    // Combine lines from both text extraction and table conversion
    const combinedLines = (rawText + '\n\n' + tableText)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Initial default schedule
    const schedule: PlanMealSlot[] = createInitial7DaySchedule();

    const daysDetected = new Set<string>();
    let currentDayOfWeek: number | null = null;
    let currentMealType: MealType | null = null;
    let guidanceNotes = '';
    const guidanceLines: string[] = [];

    // Track slots by day and mealType to update
    const slotMap = new Map<string, PlanMealSlot>();
    schedule.forEach((s) => {
      slotMap.set(`${s.dayOfWeek}_${s.mealType}`, s);
    });

    let mealsParsedCount = 0;

    for (let i = 0; i < combinedLines.length; i++) {
      const line = combinedLines[i]!;

      // 1. Detect Guidance Notes headers
      if (
        /^(?:guidelines?|instructions?|general notes?|hydration|tips?|founder notes?|important):/i.test(
          line
        ) ||
        line.toLowerCase().includes('water intake') ||
        line.toLowerCase().includes('drink 2.') ||
        line.toLowerCase().includes('drink 3')
      ) {
        guidanceLines.push(
          line
            .replace(
              /^(?:guidelines?|instructions?|general notes?|hydration|tips?|founder notes?|important):/i,
              ''
            )
            .trim() || line
        );
        continue;
      }

      // 2. Detect Day of Week
      const cleanLineLower = line.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      let matchedDay: number | null = null;
      for (const [key, val] of Object.entries(DAY_MAP)) {
        if (
          cleanLineLower === key ||
          cleanLineLower.startsWith(key + ' ') ||
          cleanLineLower.endsWith(' ' + key)
        ) {
          matchedDay = val;
          daysDetected.add(key.charAt(0).toUpperCase() + key.slice(1));
          break;
        }
      }

      if (matchedDay !== null) {
        currentDayOfWeek = matchedDay;
        currentMealType = null;
        continue;
      }

      // If we haven't reached any day yet, check if line belongs to top guidance
      if (currentDayOfWeek === null) {
        if (
          line.toLowerCase().includes('water') ||
          line.toLowerCase().includes('sleep') ||
          line.toLowerCase().includes('chew')
        ) {
          guidanceLines.push(line);
        }
        continue;
      }

      // 3. Detect Meal Type & Content
      const detectedType = detectMealType(line);
      if (detectedType) {
        currentMealType = detectedType;

        // Extract meal time from this line (e.g. "Breakfast (8:30 AM): Vegetable Poha")
        const extractedTime = extractMealTime(line);

        // Strip the meal type and timing prefix
        const mealContent = cleanMealContent(line);

        const key = `${currentDayOfWeek}_${currentMealType}`;
        const existingSlot = slotMap.get(key);

        if (existingSlot) {
          if (extractedTime) {
            existingSlot.scheduledTime = extractedTime;
          }

          if (mealContent && mealContent.length > 1) {
            const { title, portion } = extractPortionFromText(mealContent);
            if (title) {
              existingSlot.customTitle = title;
              existingSlot.customPortion = portion;
              mealsParsedCount++;
            }
          }
        }
        continue;
      }

      // 4. Sub-properties for the current meal (Time, Portion, Notes, Swaps)
      if (currentDayOfWeek !== null && currentMealType !== null) {
        const key = `${currentDayOfWeek}_${currentMealType}`;
        const slot = slotMap.get(key);

        if (slot) {
          const lower = line.toLowerCase();

          // Time sub-property: e.g. "Time: 8:00 AM" or "Timing: 13:30"
          if (lower.startsWith('time:') || lower.startsWith('timing:') || lower.startsWith('schedule:')) {
            const timeFound = extractMealTime(line);
            if (timeFound) {
              slot.scheduledTime = timeFound;
            }
          } else if (
            lower.startsWith('portion:') ||
            lower.startsWith('qty:') ||
            lower.startsWith('quantity:')
          ) {
            slot.customPortion = line.replace(/^(?:portion|qty|quantity):\s*/i, '').trim();
          } else if (
            lower.startsWith('notes:') ||
            lower.startsWith('note:') ||
            lower.startsWith('tip:')
          ) {
            slot.customNotes = line.replace(/^(?:notes?|tip):\s*/i, '').trim();
          } else if (
            lower.startsWith('swaps:') ||
            lower.startsWith('swap:') ||
            lower.startsWith('alternatives:') ||
            lower.startsWith('options:')
          ) {
            const rawSwaps = line.replace(/^(?:swaps?|alternatives?|options?):\s*/i, '').trim();
            const parsed = parseSwaps(rawSwaps);
            if (parsed.length > 0) {
              slot.customAlternatives = parsed;
            }
          } else if (
            !slot.customTitle ||
            slot.customTitle.startsWith('Sample') ||
            slot.customTitle === 'Standard Meal'
          ) {
            const timeCheck = extractMealTime(line);
            if (timeCheck) {
              slot.scheduledTime = timeCheck;
            }

            const cleanContent = cleanMealContent(line);
            const { title, portion } = extractPortionFromText(cleanContent || line);
            if (title.length > 2) {
              slot.customTitle = title;
              if (portion !== 'Standard household portion') {
                slot.customPortion = portion;
              }
              mealsParsedCount++;
            }
          }
        }
      }
    }

    if (guidanceLines.length > 0) {
      guidanceNotes = guidanceLines.join(' ');
    } else {
      guidanceNotes =
        'Drink 2.5–3 liters of water throughout the day. Finish dinner at least 2 hours before sleeping. Feel free to use the swap alternatives if any ingredient is unavailable.';
    }

    const finalMeals = Array.from(slotMap.values()).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.orderIndex - b.orderIndex;
    });

    return {
      success: true,
      meals: finalMeals,
      guidanceNotes,
      daysFound: Array.from(daysDetected),
      totalMealsParsed: mealsParsedCount > 0 ? mealsParsedCount : finalMeals.length,
      rawTextPreview: rawText.slice(0, 500),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown diet plan parsing error';
    return {
      success: false,
      meals: createInitial7DaySchedule(),
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
