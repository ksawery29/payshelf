import { resend } from './resend';
import { db } from '../db';
import { shopSettings } from '../db/schema';

const appUrl = process.env.APP_URL || 'http://localhost:3000';

async function getShopSettings() {
  const rows = await db.select().from(shopSettings).limit(1);
  return rows[0] ?? { shopName: 'My Shop', fromEmail: null };
}

/**
 * Send a purchase confirmation email with a magic link to access the product.
 * Uses shop name and from address from the database settings.
 */
export async function sendPurchaseEmail(to: string, productName: string, accessToken: string) {
  const settings = await getShopSettings();
  const accessUrl = `${appUrl}/access/${accessToken}`;

  const fromEmail =
    settings.fromEmail ||
    process.env.RESEND_FROM_EMAIL ||
    `${settings.shopName} <onboarding@resend.dev>`;

  const shopName = settings.shopName;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `Your purchase: ${productName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e5e5;overflow:hidden;">
            <div style="padding:32px 32px 24px;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#737373;">
                ${shopName}
              </p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#171717;">
                Thanks for your purchase!
              </h1>
              <p style="margin:0 0 8px;font-size:15px;color:#404040;line-height:1.6;">
                You purchased <strong>${productName}</strong>.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#404040;line-height:1.6;">
                Use the link below to access your product at any time.
              </p>
              <a href="${accessUrl}"
                 style="display:inline-block;padding:12px 28px;background-color:#171717;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:9999px;">
                Access your product
              </a>
            </div>
            <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#a3a3a3;line-height:1.5;">
                You can also copy this link: <a href="${accessUrl}" style="color:#737373;">${accessUrl}</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#a3a3a3;">
                Sent by ${shopName}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error(`[${shopName}] Failed to send purchase email:`, error);
  }
}
