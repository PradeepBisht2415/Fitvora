export interface PaymentFailedEmailProps {
  firstName: string;
  retryUrl: string;
}

export function renderPaymentFailedEmail({
  firstName,
  retryUrl,
}: PaymentFailedEmailProps): { subject: string; html: string } {
  const subject = 'Important: Payment Attempt Failed for Your Fitvora Membership';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #FFFDF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #FEE2E2; overflow: hidden; box-shadow: 0 2px 8px rgba(220,38,38,0.04);">
          <!-- Header -->
          <div style="background-color: #991B1B; padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Fitvora</h1>
            <p style="margin: 4px 0 0 0; color: #FEE2E2; font-size: 13px; font-weight: 500;">Subscription Renewal Notice</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px 0; color: #1A2E1C; font-size: 20px; font-weight: 700;">Hello ${firstName},</h2>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px; line-height: 1.6;">
              We were unable to process your recurring membership renewal through Razorpay. This commonly happens due to insufficient funds, card expiry, or temporary bank authentication limits.
            </p>

            <div style="background-color: #FEF2F2; border-radius: 12px; padding: 18px; margin: 24px 0; border: 1px solid #FCA5A5;">
              <p style="margin: 0; color: #991B1B; font-size: 13px; font-weight: 600; line-height: 1.5;">
                • Your meal plan and dashboard access remain open during your grace period.<br />
                • Please update your payment method to ensure uninterrupted weekly plan guidance.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${retryUrl}" style="background-color: #075B2B; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block;">
                Update Payment Details &rarr;
              </a>
            </div>

            <p style="margin: 0; color: #6B7280; font-size: 12px; line-height: 1.5;">
              If you believe this is in error or need assistance, reach us directly at support@fitvora.com.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #F3F4F6; padding: 20px 32px; background-color: #FAFDF9; text-align: center; font-size: 11px; color: #9CA3AF;">
            <p style="margin: 0 0 8px 0;">Fitvora Wellness • Routine Nutrition Guidance • DPDP Act Compliant</p>
            <p style="margin: 0;">General wellness only. Not medical diagnosis or treatment.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return { subject, html };
}
