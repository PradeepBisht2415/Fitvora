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
    if (parts.length >= 2 && /^day/i.test(parts[0]!)) {
      headerIndex = i;
      for (let c = 1; c < parts.length; c++) {
        const colHeader = parts[c]!;
        const time = extractMealTime(colHeader) || (c === 1 ? '16:00' : c === 2 ? '21:00' : '02:00');

        let mealType: PlanMealSlot['mealType'] = 'breakfast';
        let mealLabel = 'Meal 1';

        if (/meal\s*2/i.test(colHeader)) {
          mealType = 'lunch';
          mealLabel = 'Meal 2';
        } else if (/meal\s*3/i.test(colHeader)) {
          mealType = 'dinner';
          mealLabel = 'Meal 3';
        } else if (/meal\s*4/i.test(colHeader)) {
          mealType = 'evening_snack';
          mealLabel = 'Meal 4';
        } else if (/lunch/i.test(colHeader)) {
          mealType = 'lunch';
          mealLabel = 'Lunch';
        } else if (/dinner/i.test(colHeader)) {
          mealType = 'dinner';
          mealLabel = 'Dinner';
        } else if (/snack|tea/i.test(colHeader)) {
          mealType = 'evening_snack';
          mealLabel = 'Evening Snack';
        } else {
          mealLabel = c === 1 ? 'Meal 1' : c === 2 ? 'Meal 2' : c === 3 ? 'Meal 3' : `Meal ${c}`;
        }

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
    const dayOfWeek = DAY_MAP[dayLabel];
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
        customNotes: `${col.mealLabel} · ${formatMealTime(col.time)}`,
        customAlternatives: [],
        allergenTags: [],
        orderIndex: col.orderIndex,
      });
    }
  }

  if (parsedMeals.length >= 7) {
    return {
      meals: parsedMeals.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.orderIndex - b.orderIndex;
      }),
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
    if (!line) continue;
    if (line.includes('|')) continue; // Skip table lines

    // Trigger section
    if (
      /^(?:guidance|hydration|reminders|rules|notes|portion key|how to monitor|movement|clinical):/i.test(
        line
      ) ||
      line.toLowerCase().includes('guidance & hydration reminders') ||
      line.toLowerCase().includes('mess / tiffin ordering rules') ||
      line.toLowerCase().includes('portion key:') ||
      line.toLowerCase().includes('how to monitor and adjust') ||
      line.toLowerCase().includes('meal clock & important schedule check')
    ) {
      inGuidanceSection = true;
      guidanceLines.push(line);
      continue;
    }

    if (inGuidanceSection) {
      if (
        /^(?:water|limit|protein|portions?|walk|strength|sleep|track|note|ask|weigh|movement):/i.test(
          line
        )
      ) {
        guidanceLines.push(line);
      } else if (
        line.length > 15 &&
        !line.startsWith('Seven-day menu') &&
        !line.startsWith('Client assessment')
      ) {
        guidanceLines.push(line);
      }
    }
  }

  if (guidanceLines.length > 0) {
    return guidanceLines.join('\n\n');
  }

  return 'Drink 2.5–3 liters of water throughout the day. Finish dinner at least 2 hours before sleeping. Feel free to use the swap alternatives if any ingredient is unavailable.';
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

    const combinedLines = (rawText + '\n\n' + tableText)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // 1. Try table plan parsing first (e.g. 7-day grid with Day 1..Day 7 and Meal 1..Meal 3)
    const tableResult = parseTablePlan(combinedLines);
    const guidanceNotes = extractAllGuidanceNotes(combinedLines);

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

    // 2. Fall back to section/line-by-line parsing
    const schedule: PlanMealSlot[] = createInitial7DaySchedule();
    const daysDetected = new Set<string>();
    let currentDayOfWeek: number | null = null;
    let currentMealType: MealType | null = null;

    const slotMap = new Map<string, PlanMealSlot>();
    schedule.forEach((s) => {
      slotMap.set(`${s.dayOfWeek}_${s.mealType}`, s);
    });

    let mealsParsedCount = 0;

    for (let i = 0; i < combinedLines.length; i++) {
      const line = combinedLines[i]!;

      // Day of Week detection
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

      if (currentDayOfWeek === null) continue;

      // Meal Type detection
      const detectedType = detectMealType(line);
      if (detectedType) {
        currentMealType = detectedType;
        const extractedTime = extractMealTime(line);
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

      // Sub-properties for the current meal
      if (currentDayOfWeek !== null && currentMealType !== null) {
        const key = `${currentDayOfWeek}_${currentMealType}`;
        const slot = slotMap.get(key);

        if (slot) {
          const lower = line.toLowerCase();
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
