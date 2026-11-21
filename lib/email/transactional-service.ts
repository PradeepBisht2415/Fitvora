import { Resend } from 'resend';
import { renderAssessmentApprovedEmail } from './templates/assessment-approved';
import { renderPlanPublishedEmail } from './templates/plan-published';
import { renderPaymentReceiptEmail } from './templates/payment-receipt';
import { renderPaymentFailedEmail } from './templates/payment-failed';

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

const FROM_EMAIL = 'Fitvora <notifications@fitvora.com>';

export async function sendAssessmentApprovedEmail(
  to: string,
  firstName: string,
  claimUrl: string
): Promise<boolean> {
  const { subject, html } = renderAssessmentApprovedEmail({ firstName, claimUrl });
  return sendEmail(to, subject, html);
}

export async function sendPlanPublishedEmail(
  to: string,
  firstName: string,
  planVersion: number
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardUrl = `${appUrl}/dashboard`;
  const { subject, html } = renderPlanPublishedEmail({
    firstName,
    planVersion,
    dashboardUrl,
  });
  return sendEmail(to, subject, html);
}

export async function sendPaymentReceiptEmail(
  to: string,
  firstName: string,
  planName: string,
  amountPaise: number,
  currentPeriodEnd?: string | null
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const subscriptionUrl = `${appUrl}/dashboard/subscription`;
  const { subject, html } = renderPaymentReceiptEmail({
    firstName,
    planName,
    amountPaise,
    currentPeriodEnd,
    subscriptionUrl,
  });
  return sendEmail(to, subject, html);
}

export async function sendPaymentFailedEmail(
  to: string,
  firstName: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const retryUrl = `${appUrl}/dashboard/subscription`;
  const { subject, html } = renderPaymentFailedEmail({ firstName, retryUrl });
  return sendEmail(to, subject, html);
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const client = getResendClient();

  if (!client) {
    console.log(
      `[Fitvora Transactional Email Simulated] To: ${to} | Subject: "${subject}"`
    );
    return true;
  }

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.warn(`[Fitvora Transactional Email Warning] Failed sending to ${to}:`, err);
    return false;
  }
}
