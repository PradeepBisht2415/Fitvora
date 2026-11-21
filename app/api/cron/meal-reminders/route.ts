import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET(req: Request) {
  try {
    // 1. Verify cron secret
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const secret =
      authHeader?.replace('Bearer ', '') ||
      searchParams.get('secret') ||
      req.headers.get('x-cron-secret');

    const expectedSecret = process.env.CRON_SECRET || 'fitvora_cron_secret_sandbox';

    if (secret !== expectedSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // 2. Query opted-in members with active subscriptions
    const { data: optedInProfiles, error: pErr } = await adminSupabase
      .from('profiles')
      .select('id, first_name, email, timezone, meal_reminders_enabled, reminder_channel')
      .eq('meal_reminders_enabled', true);

    if (pErr) {
      console.error('Error querying profiles for reminders:', pErr);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    if (!optedInProfiles || optedInProfiles.length === 0) {
      return NextResponse.json({
        message: 'No opted-in profiles found for meal reminders.',
        remindersDispatched: 0,
      });
    }

    let dispatchedCount = 0;
    const now = new Date();

    for (const member of optedInProfiles) {
      const tz = member.timezone || 'Asia/Kolkata';

      let localHours: number;
      let localMinutes: number;
      let localDayOfWeek: number; // 0=Sunday, 1=Monday...

      try {
        const dtf = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'short',
        });
        const parts = dtf.formatToParts(now);
        const map = new Map(parts.map((p) => [p.type, p.value]));

        localHours = parseInt(map.get('hour') || '12', 10);
        localMinutes = parseInt(map.get('minute') || '0', 10);

        // Map weekday short
        const weekdayMap: Record<string, number> = {
          Sun: 0,
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
        };
        localDayOfWeek = weekdayMap[map.get('weekday') || 'Mon'] ?? 1;
      } catch {
        // Fallback to Asia/Kolkata
        localHours = (now.getUTCHours() + 5) % 24;
        localMinutes = (now.getUTCMinutes() + 30) % 60;
        localDayOfWeek = now.getUTCDay();
      }

      // Quiet hours rule: 22:00 (10 PM) to 07:00 (7 AM)
      if (localHours >= 22 || localHours < 7) {
        continue;
      }

      // Check member's active published diet plan
      const { data: plan } = await adminSupabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', member.id)
        .eq('status', 'published')
        .maybeSingle();

      if (!plan) continue;

      // Query scheduled meals for today's day of week
      const { data: meals } = await adminSupabase
        .from('diet_plan_meals')
        .select('id, meal_type, scheduled_time, custom_title, custom_portion')
        .eq('diet_plan_id', plan.id)
        .eq('day_of_week', localDayOfWeek);

      if (!meals || meals.length === 0) continue;

      const currentTotalMinutes = localHours * 60 + localMinutes;

      for (const meal of meals) {
        const [mH, mM] = meal.scheduled_time.split(':').map((v) => parseInt(v, 10));
        if (mH !== undefined && mM !== undefined) {
          const mealTotalMinutes = mH * 60 + mM;
          const diff = mealTotalMinutes - currentTotalMinutes;

          // If meal is scheduled within the next 45 minutes (0 to 45 mins)
          if (diff >= 0 && diff <= 45) {
            console.log(
              `[Meal Reminder Dispatch] To: ${member.email} | Meal: ${meal.custom_title || meal.meal_type} at ${meal.scheduled_time} (in ${diff}m)`
            );
            dispatchedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checkedProfiles: optedInProfiles.length,
      remindersDispatched: dispatchedCount,
    });
  } catch (err) {
    console.error('Error in meal-reminders cron route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
