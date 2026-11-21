import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_placeholder') || apiKey === 'placeholder') {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface NewAssessmentAlertPayload {
  assessmentId: string;
  firstName: string;
  targetDirection: string;
  hasMedicalFlags: boolean;
}

export async function sendNewAssessmentAlert({
  assessmentId,
  firstName,
  targetDirection,
  hasMedicalFlags,
}: NewAssessmentAlertPayload): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'support@fitvora.com';
  const client = getResendClient();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const triageUrl = `${appUrl}/admin/assessments/${assessmentId}`;

  const directionLabel =
    targetDirection === 'lose_weight'
      ? 'Weight Loss'
      : targetDirection === 'gain_weight'
      ? 'Weight Gain'
      : 'Maintain Health';

  const flagNotice = hasMedicalFlags
    ? '⚠️ [Safety Review Needed] Member disclosed conditions or routine factors requiring manual triage.'
    : 'Standard submission for healthy lifestyle review.';

  if (!client) {
    // In development or when email provider is not yet provisioned, log to stdout
    console.log(
      `[Fitvora Notification] [Assessment ${assessmentId}] New submission by ${firstName} for ${directionLabel}. Flag status: ${hasMedicalFlags ? 'FLAGGED' : 'STANDARD'}. Review link: ${triageUrl}`
    );
    return true;
  }

  try {
    await client.emails.send({
      from: 'Fitvora Alerts <onboarding@resend.dev>',
      to: adminEmail,
      subject: `[Fitvora Lead] New Assessment: ${firstName} (${directionLabel})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2ece0; border-radius: 12px; background-color: #fffdf7;">
          <h2 style="color: #075b2b; margin-top: 0;">New Assessment Submitted</h2>
          <p style="color: #1a2e1c; font-size: 16px;">
            A new prospective member has completed the public Fitvora intake assessment.
          </p>
          <div style="background-color: #eaf8e7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>First Name:</strong> ${firstName}</p>
            <p style="margin: 4px 0;"><strong>Direction:</strong> ${directionLabel}</p>
            <p style="margin: 4px 0; color: #075b2b;">${flagNotice}</p>
          </div>
          <a href="${triageUrl}" style="display: inline-block; background-color: #2faf37; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; margin-top: 12px;">
            Review in Admin Triage
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #536955;">
            Fitvora Confidential • DPDP Act Compliant • Zero sensitive health data in email body.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send assessment notification email:', error);
    return false;
  }
}
