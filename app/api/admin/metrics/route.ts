import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Verify admin
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Pending assessments
    const { count: pendingAssessmentsCount } = await adminSupabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review');

    // 2. Active memberships & tier counts
    const { data: activeSubs } = await adminSupabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('status', 'active');

    const normalCount = (activeSubs || []).filter((s) => s.plan_id === 'normal').length;
    const premiumCount = (activeSubs || []).filter((s) => s.plan_id === 'premium').length;

    // 3. Unanswered support tickets
    const { data: openThreads } = await adminSupabase
      .from('support_threads')
      .select('id, subject, priority, last_message_at')
      .eq('status', 'open');

    const openTicketsCount = openThreads?.length || 0;
    const premiumOpenTicketsCount = (openThreads || []).filter(
      (t) => t.priority === 'premium'
    ).length;

    // 4. Check-ins awaiting review
    const { count: pendingCheckInsCount } = await adminSupabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // 5. Plans needing publication (active members without published plan)
    const { data: membersWithoutPlan } = await adminSupabase
      .from('memberships')
      .select('user_id')
      .eq('lifecycle_status', 'active');

    let plansNeedingPublication = 0;
    if (membersWithoutPlan && membersWithoutPlan.length > 0) {
      const userIds = membersWithoutPlan.map((m) => m.user_id);
      const { data: publishedPlans } = await adminSupabase
        .from('diet_plans')
        .select('user_id')
        .in('user_id', userIds)
        .eq('status', 'published');

      const publishedUserIds = new Set((publishedPlans || []).map((p) => p.user_id));
      plansNeedingPublication = userIds.filter((uid) => !publishedUserIds.has(uid)).length;
    }

    // Immediate action items list
    const actionItems = [];

    if ((pendingAssessmentsCount || 0) > 0) {
      actionItems.push({
        type: 'assessment',
        title: `${pendingAssessmentsCount} Intake Assessments Pending Review`,
        description: 'New health assessments submitted by visitors awaiting triage.',
        href: '/admin/assessments',
        urgency: 'high',
      });
    }

    if (premiumOpenTicketsCount > 0) {
      actionItems.push({
        type: 'support',
        title: `${premiumOpenTicketsCount} Premium Inquiries Need Reply`,
        description: 'Priority queue questions from Premium tier members.',
        href: '/admin/support',
        urgency: 'high',
      });
    } else if (openTicketsCount > 0) {
      actionItems.push({
        type: 'support',
        title: `${openTicketsCount} Support Inquiries Open`,
        description: 'Member questions regarding meal timing or swaps.',
        href: '/admin/support',
        urgency: 'medium',
      });
    }

    if ((pendingCheckInsCount || 0) > 0) {
      actionItems.push({
        type: 'check_in',
        title: `${pendingCheckInsCount} Weekly Check-Ins Awaiting Review`,
        description: 'Submitted adherence logs from Premium members.',
        href: '/admin/check-ins',
        urgency: 'medium',
      });
    }

    if (plansNeedingPublication > 0) {
      actionItems.push({
        type: 'diet_plan',
        title: `${plansNeedingPublication} Active Members Need Meal Plans`,
        description: 'Paid members who have not yet had their first 7-day diet plan published.',
        href: '/admin/members',
        urgency: 'high',
      });
    }

    return NextResponse.json({
      metrics: {
        pendingAssessments: pendingAssessmentsCount || 0,
        activeNormalMembers: normalCount,
        activePremiumMembers: premiumCount,
        totalActiveMembers: normalCount + premiumCount,
        openSupportTickets: openTicketsCount,
        premiumOpenTickets: premiumOpenTicketsCount,
        pendingCheckIns: pendingCheckInsCount || 0,
        plansNeedingPublication,
      },
      actionItems,
      isZeroState:
        (pendingAssessmentsCount || 0) === 0 &&
        normalCount === 0 &&
        premiumCount === 0 &&
        openTicketsCount === 0 &&
        (pendingCheckInsCount || 0) === 0,
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
