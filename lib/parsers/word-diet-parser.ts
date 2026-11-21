import mammoth from 'mammoth';
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
  if (lower.includes('evening snack') || lower.includes('evening tea') || lower.includes('afternoon snack') || lower.includes('snack') || lower.includes('chai time')) {
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

function extractPortionFromText(rawText: string): { title: string; portion: string } {
  // Check for parenthesis: e.g. "Vegetable Poha (1 medium bowl / 200g)"
  const parenMatch = rawText.match(/^(.*?)\(([^)]+)\)(.*)$/);
  if (parenMatch && parenMatch[1] && parenMatch[2]) {
    const title = parenMatch[1].trim();
    const portion = parenMatch[2].trim();
    return { title: title || rawText.trim(), portion: portion || '1 standard portion' };
  }

  // Check for dash/hyphen: e.g. "Vegetable Poha - 1 medium bowl"
  const dashMatch = rawText.match(/^(.*?)\s*[-—–]\s*(1\s*(?:katori|bowl|plate|cup|glass|piece|pcs|roti|phulka).*)$/i);
  if (dashMatch && dashMatch[1] && dashMatch[2]) {
    return { title: dashMatch[1].trim(), portion: dashMatch[2].trim() };
  }

  return { title: rawText.trim(), portion: 'Standard household portion' };
}

function parseSwaps(rawSwaps: string): { title: string; portion: string }[] {
  if (!rawSwaps) return [];
  const parts = rawSwaps.split(/[,;\n•|]/).map((p) => p.trim()).filter(Boolean);
  return parts.map((part) => {
    const { title, portion } = extractPortionFromText(part);
    return { title, portion };
  });
}

/**
 * Parses a Word .docx buffer into structured 7-day Fitvora meal cards.
 */
export async function parseWordDietPlan(buffer: Buffer): Promise<ParsedDietPlanResult> {
  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    const htmlResult = await mammoth.convertToHtml({ buffer });

    const rawText = rawResult.value || '';
    const tableText = cleanHtmlText(htmlResult.value || '');

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
        /^(?:guidelines?|instructions?|general notes?|hydration|tips?|founder notes?|important):/i.test(line) ||
        line.toLowerCase().includes('water intake') ||
        line.toLowerCase().includes('drink 2.') ||
        line.toLowerCase().includes('drink 3')
      ) {
        guidanceLines.push(line.replace(/^(?:guidelines?|instructions?|general notes?|hydration|tips?|founder notes?|important):/i, '').trim() || line);
        continue;
      }

      // 2. Detect Day of Week
      const cleanLineLower = line.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      let matchedDay: number | null = null;
      for (const [key, val] of Object.entries(DAY_MAP)) {
        if (cleanLineLower === key || cleanLineLower.startsWith(key + ' ') || cleanLineLower.endsWith(' ' + key)) {
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
        if (line.toLowerCase().includes('water') || line.toLowerCase().includes('sleep') || line.toLowerCase().includes('chew')) {
          guidanceLines.push(line);
        }
        continue;
      }

      // 3. Detect Meal Type & Content
      const detectedType = detectMealType(line);
      if (detectedType) {
        currentMealType = detectedType;

        // Strip the meal type label from content
        // e.g. "Breakfast (8:30 AM): Vegetable Poha (1 bowl)" -> "Vegetable Poha (1 bowl)"
        let mealContent = line
          .replace(/^(?:breakfast|morning\s*snack|lunch|evening\s*snack|dinner|post\s*dinner|snack)[\s(0-9:AMPamp;)]*[:–—|-]\s*/i, '')
          .trim();

        if (mealContent && mealContent !== line) {
          const { title, portion } = extractPortionFromText(mealContent);
          const key = `${currentDayOfWeek}_${currentMealType}`;
          const existingSlot = slotMap.get(key);

          if (existingSlot && title) {
            existingSlot.customTitle = title;
            existingSlot.customPortion = portion;
            mealsParsedCount++;
          }
        }
        continue;
      }

      // 4. Sub-properties for the current meal (Portion, Notes, Swaps)
      if (currentDayOfWeek !== null && currentMealType !== null) {
        const key = `${currentDayOfWeek}_${currentMealType}`;
        const slot = slotMap.get(key);

        if (slot) {
          const lower = line.toLowerCase();
          if (lower.startsWith('portion:') || lower.startsWith('qty:') || lower.startsWith('quantity:')) {
            slot.customPortion = line.replace(/^(?:portion|qty|quantity):\s*/i, '').trim();
          } else if (lower.startsWith('notes:') || lower.startsWith('note:') || lower.startsWith('tip:')) {
            slot.customNotes = line.replace(/^(?:notes?|tip):\s*/i, '').trim();
          } else if (lower.startsWith('swaps:') || lower.startsWith('swap:') || lower.startsWith('alternatives?:\s*') || lower.startsWith('options?:')) {
            const rawSwaps = line.replace(/^(?:swaps?|alternatives?|options?):\s*/i, '').trim();
            const parsed = parseSwaps(rawSwaps);
            if (parsed.length > 0) {
              slot.customAlternatives = parsed;
            }
          } else if (!slot.customTitle || slot.customTitle.startsWith('Sample') || slot.customTitle === 'Standard Meal') {
            const { title, portion } = extractPortionFromText(line);
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
    const errorMsg = err instanceof Error ? err.message : 'Unknown Word parsing error';
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
