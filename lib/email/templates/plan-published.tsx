export interface PlanPublishedEmailProps {
  firstName: string;
  planVersion: number;
  dashboardUrl: string;
}

export function renderPlanPublishedEmail({
  firstName,
  planVersion,
  dashboardUrl,
}: PlanPublishedEmailProps): { subject: string; html: string } {
  const subject = 'Your Personalized 7-Day Indian Meal Plan is Ready!';
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
            <p style="margin: 4px 0 0 0; color: #EAF8E7; font-size: 13px; font-weight: 500;">Meal Plan Ready (Version ${planVersion})</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px 0; color: #1A2E1C; font-size: 20px; font-weight: 700;">Hello ${firstName},</h2>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px; line-height: 1.6;">
              Your customized 7-day Indian home food plan has been prepared by your founder reviewer and published to your member dashboard.
            </p>

            <div style="background-color: #EAF8E7; border-radius: 12px; padding: 18px; margin: 24px 0; border: 1px solid #2FAF37/20;">
              <h4 style="margin: 0 0 8px 0; color: #075B2B; font-size: 14px; font-weight: 700;">What&apos;s Included in Your Plan:</h4>
              <p style="margin: 0; color: #1A2E1C; font-size: 13px; line-height: 1.5;">
                • Exact daily meals (Breakfast, Lunch, Evening Snacks, Dinner)<br />
                • Familiar household portions (katori, spoons, phulkas)<br />
                • Approved alternative food swaps with 1-click preview<br />
                • Consolidated staple grocery overview for the week
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${dashboardUrl}" style="background-color: #075B2B; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(7,91,43,0.2);">
                Open Member Dashboard &rarr;
              </a>
            </div>

            <p style="margin: 0; color: #6B7280; font-size: 12px; line-height: 1.5;">
              Tip: You can also print your full 7-day schedule or save it as a clean PDF from the &quot;7-Day Plan&quot; tab.
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
