import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { shopSettings } from '../db/schema';
import { resend } from './resend';

const SINGLETON_ID = 'singleton';

/**
 * Get shop settings, inserting defaults if the row doesn't exist yet.
 */
export const getSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select().from(shopSettings).limit(1);

  if (rows.length > 0) return rows[0];

  // First-time: seed defaults
  const [created] = await db.insert(shopSettings).values({ id: SINGLETON_ID }).returning();

  return created;
});

/**
 * Save shop settings (upsert on the singleton row).
 */
export const saveSettingsFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      shopName: string;
      shopTagline?: string;
      fromEmail?: string;
      termsOfService?: string;
      privacyPolicy?: string;
      waitlistEmailHtml?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(shopSettings)
      .values({
        id: SINGLETON_ID,
        shopName: data.shopName,
        shopTagline: data.shopTagline || null,
        fromEmail: data.fromEmail || null,
        termsOfService: data.termsOfService || null,
        privacyPolicy: data.privacyPolicy || null,
        waitlistEmailHtml: data.waitlistEmailHtml || null,
      })
      .onConflictDoUpdate({
        target: shopSettings.id,
        set: {
          shopName: data.shopName,
          shopTagline: data.shopTagline || null,
          fromEmail: data.fromEmail || null,
          termsOfService: data.termsOfService || null,
          privacyPolicy: data.privacyPolicy || null,
          waitlistEmailHtml: data.waitlistEmailHtml || null,
        },
      })
      .returning();

    return row;
  });

/**
 * Send a test waitlist confirmation email using the current HTML template.
 */
export const sendTestWaitlistEmailFn = createServerFn({ method: 'POST' })
  .validator((data: { to: string }) => data)
  .handler(async ({ data }) => {
    const rows = await db.select().from(shopSettings).limit(1);
    const settings = rows[0] ?? { shopName: 'My Shop', fromEmail: null, waitlistEmailHtml: null };

    const fromEmail =
      settings.fromEmail ||
      process.env.RESEND_FROM_EMAIL ||
      `${settings.shopName} <onboarding@resend.dev>`;

    const defaultHtml = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h1 style="font-size:22px;font-weight:600;color:#171717;">You're on the list!</h1>
        <p style="color:#404040;line-height:1.6;">
          Thanks for joining the waitlist for <strong>Example Product</strong>.
          We'll email you at <strong>${data.to}</strong> as soon as it's ready.
        </p>
      </div>`;

    const rawHtml = settings.waitlistEmailHtml || defaultHtml;

    const html = rawHtml
      .replace(/\{\{productName\}\}/g, 'Example Product')
      .replace(/\{\{email\}\}/g, data.to);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [data.to],
      subject: `[Test] Waitlist confirmation from ${settings.shopName}`,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });
