import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { analyticsEvent, cancelFeedback } from '../db/schema';

// ── Visitor ID helper (client-only, called before server fn) ───────────────

export function getOrCreateVisitorId(): string {
  const key = '_ps_vid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Track a raw analytics event ────────────────────────────────────────────

export const trackEventFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      event: 'page_view' | 'checkout_initiated' | 'checkout_completed' | 'checkout_cancelled';
      productId?: string;
      visitorId?: string;
      metadata?: Record<string, unknown>;
    }) => data
  )
  .handler(async ({ data }) => {
    await db.insert(analyticsEvent).values({
      event: data.event,
      productId: data.productId ?? null,
      visitorId: data.visitorId ?? null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });
    return { ok: true };
  });

// ── Submit cancellation feedback ───────────────────────────────────────────

export const submitCancelFeedbackFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      reason: 'too_expensive' | 'just_browsing' | 'found_alternative' | 'trust' | 'other';
      comment?: string;
      productId?: string;
      visitorId?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    await db.insert(cancelFeedback).values({
      reason: data.reason,
      comment: data.comment ?? null,
      productId: data.productId ?? null,
      visitorId: data.visitorId ?? null,
    });
    return { ok: true };
  });
