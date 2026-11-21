export interface PlanMealSlot {
  id: string; // client temporary ID or UUID
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner';
  scheduledTime: string; // "08:30"
  mealTemplateId?: string | null;
  customTitle: string;
  customPortion: string;
  customNotes?: string;
  customAlternatives: { title: string; portion: string }[];
  allergenTags: string[];
  approxCalories?: number | null;
  approxProteinG?: number | null;
  orderIndex: number;
}

export interface DayPlan {
  dayOfWeek: number;
  dayName: string;
  meals: PlanMealSlot[];
}

export const DAYS_OF_WEEK = [
  { dayOfWeek: 1, name: 'Monday' },
  { dayOfWeek: 2, name: 'Tuesday' },
  { dayOfWeek: 3, name: 'Wednesday' },
  { dayOfWeek: 4, name: 'Thursday' },
  { dayOfWeek: 5, name: 'Friday' },
  { dayOfWeek: 6, name: 'Saturday' },
  { dayOfWeek: 0, name: 'Sunday' },
];

export const DEFAULT_MEAL_TIMES: Record<string, string> = {
  breakfast: '08:30',
  morning_snack: '11:00',
  lunch: '13:30',
  evening_snack: '17:30',
  dinner: '20:30',
  post_dinner: '22:00',
};

export function createInitial7DaySchedule(): PlanMealSlot[] {
  const schedule: PlanMealSlot[] = [];

  DAYS_OF_WEEK.forEach(({ dayOfWeek }) => {
    schedule.push(
      {
        id: `slot_${dayOfWeek}_breakfast`,
        dayOfWeek,
        mealType: 'breakfast',
        scheduledTime: '08:30',
        customTitle: 'Vegetable Poha with Roasted Peanuts',
        customPortion: '1 medium bowl (approx. 200g)',
        customNotes: 'Squeeze fresh lemon before eating. Pair with warm water.',
        customAlternatives: [
          { title: 'Vegetable Upma with 1 boiled egg', portion: '1 bowl' },
        ],
        allergenTags: ['peanuts'],
        approxCalories: 310,
        approxProteinG: 7.5,
        orderIndex: 0,
      },
      {
        id: `slot_${dayOfWeek}_lunch`,
        dayOfWeek,
        mealType: 'lunch',
        scheduledTime: '13:30',
        customTitle: 'Dal Tadka, 2 Whole Wheat Phulkas & Bhindi Sabzi',
        customPortion: '1 katori dal + 2 phulkas + 1 katori sabzi + fresh salad',
        customNotes: 'Cook with minimal oil; eat salad 10 minutes prior.',
        customAlternatives: [
          { title: 'Moong Dal with 2 Phulkas & Lauki Sabzi', portion: '1 katori + 2 roti' },
        ],
        allergenTags: ['gluten'],
        approxCalories: 390,
        approxProteinG: 14.5,
        orderIndex: 1,
      },
      {
        id: `slot_${dayOfWeek}_snack`,
        dayOfWeek,
        mealType: 'evening_snack',
        scheduledTime: '17:30',
        customTitle: 'Roasted Chana with Spiced Chaas (Buttermilk)',
        customPortion: '1 handful roasted chana + 1 tall glass chaas',
        customNotes: 'Season chaas with roasted cumin and mint leaves.',
        customAlternatives: [
          { title: 'Roasted Makhana with black pepper', portion: '1 big bowl' },
        ],
        allergenTags: ['dairy'],
        approxCalories: 160,
        approxProteinG: 8.5,
        orderIndex: 2,
      },
      {
        id: `slot_${dayOfWeek}_dinner`,
        dayOfWeek,
        mealType: 'dinner',
        scheduledTime: '20:30',
        customTitle: 'Moong Dal Khichdi with 1 Katori Fresh Curd',
        customPortion: '1.5 katori warm khichdi + 1 katori curd',
        customNotes: 'Light dinner for restful sleep. Finish at least 2 hours before bed.',
        customAlternatives: [
          { title: 'Palak Paneer with 2 Multigrain Phulkas', portion: '1 katori + 2 roti' },
        ],
        allergenTags: ['dairy'],
        approxCalories: 370,
        approxProteinG: 15.0,
        orderIndex: 3,
      }
    );
  });

  return schedule;
}
