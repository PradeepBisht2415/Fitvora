export interface PaymentReceiptEmailProps {
  firstName: string;
  planName: string;
  amountPaise: number;
  currentPeriodEnd?: string | null;
  subscriptionUrl: string;
}

export function renderPaymentReceiptEmail({
  firstName,
  planName,
  amountPaise,
  currentPeriodEnd,
  subscriptionUrl,
}: PaymentReceiptEmailProps): { subject: string; html: string } {
  const formattedAmount = `₹${(amountPaise / 100).toFixed(0)}`;
  const formattedRenewal = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Next monthly billing cycle';

  const subject = `Fitvora Payment Receipt — ${planName} (${formattedAmount})`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #FFFDF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #EAF8E7; overflow: hidden; box-shadow: 0 2px 8px rgba(7,91,43,0.04);">
          <!-- Header -->
          <div style="background-color: #075B2B; padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Fitvora</h1>
            <p style="margin: 4px 0 0 0; color: #EAF8E7; font-size: 13px; font-weight: 500;">Payment Confirmation & Receipt</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px 0; color: #1A2E1C; font-size: 20px; font-weight: 700;">Thank you, ${firstName}!</h2>
            <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px; line-height: 1.6;">
              Your payment for your Fitvora monthly subscription has been successfully processed. Here is your receipt summary:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280;">Subscription Plan:</td>
                <td style="padding: 10px 0; font-weight: 700; color: #1A2E1C; text-align: right;">${planName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280;">Gross Amount:</td>
                <td style="padding: 10px 0; font-weight: 700; color: #075B2B; text-align: right; font-size: 16px;">${formattedAmount}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280;">Billing Interval:</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1A2E1C; text-align: right;">Monthly Recurring</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B7280;">Next Scheduled Renewal:</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1A2E1C; text-align: right;">${formattedRenewal}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${subscriptionUrl}" style="background-color: #075B2B; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                Manage Subscription &amp; Invoices &rarr;
              </a>
            </div>

            <p style="margin: 0; color: #6B7280; font-size: 11px; line-height: 1.5;">
              You can cancel recurring billing anytime from your Subscription Settings before your next renewal date. For questions regarding payments, review our Refund Policy or email support@fitvora.com.
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
