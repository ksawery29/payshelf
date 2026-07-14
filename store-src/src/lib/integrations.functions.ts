import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { db } from '../db';
import { webhookIntegration } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from './auth';

async function requireAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export const getIntegrationsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();

  const rows = await db.select().from(webhookIntegration);

  const slack = rows.find((r) => r.id === 'slack') || {
    id: 'slack',
    url: '',
    enabled: false,
    events: '[]',
  };
  const discord = rows.find((r) => r.id === 'discord') || {
    id: 'discord',
    url: '',
    enabled: false,
    events: '[]',
  };

  return {
    slack: {
      id: slack.id,
      url: slack.url,
      enabled: slack.enabled,
      events: JSON.parse(slack.events) as string[],
    },
    discord: {
      id: discord.id,
      url: discord.url,
      enabled: discord.enabled,
      events: JSON.parse(discord.events) as string[],
    },
  };
});

export const saveIntegrationFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      id: 'slack' | 'discord';
      url: string;
      enabled: boolean;
      events: string[];
    }) => data
  )
  .handler(async ({ data }) => {
    await requireAdmin();

    const [row] = await db
      .insert(webhookIntegration)
      .values({
        id: data.id,
        url: data.url,
        enabled: data.enabled,
        events: JSON.stringify(data.events),
      })
      .onConflictDoUpdate({
        target: webhookIntegration.id,
        set: {
          url: data.url,
          enabled: data.enabled,
          events: JSON.stringify(data.events),
          updatedAt: new Date(),
        },
      })
      .returning();

    return {
      id: row.id,
      url: row.url,
      enabled: row.enabled,
      events: JSON.parse(row.events) as string[],
    };
  });

export const sendTestNotificationFn = createServerFn({ method: 'POST' })
  .validator((data: { id: 'slack' | 'discord'; url: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();

    const text = `🔔 **Test Notification:** This is a test message from your Payshelf integrations panel for **${data.id === 'slack' ? 'Slack' : 'Discord'}**!`;
    let body: any = {};
    if (data.id === 'slack') {
      const slackText = text.replace(/\*\*/g, '*');
      body = { text: slackText };
    } else {
      body = { content: text };
    }

    try {
      const res = await fetch(data.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Integration endpoint returned status ${res.status}`);
      }
      return { ok: true };
    } catch (err: any) {
      throw new Error(`Failed to send test notification: ${err?.message || String(err)}`);
    }
  });
