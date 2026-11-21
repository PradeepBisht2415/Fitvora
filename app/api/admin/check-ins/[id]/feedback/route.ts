import { NextResponse } from 'next/server';
import { submitCoachFeedback } from '@/features/checkins/checkin-actions';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { feedback } = body;

    const res = await submitCoachFeedback(id, feedback);

    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in feedback API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
