import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { purchase, product, analyticsEvent, cancelFeedback } from '../db/schema';
import { eq, sql, and, gte, count } from 'drizzle-orm';

/**
 * Fetch dashboard analytics data.
 */
export const getAnalyticsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const now = new Date();

  // Start of current week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Total revenue (active purchases only) ──
  const [totalResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(purchase)
    .innerJoin(product, eq(purchase.productId, product.id))
    .where(eq(purchase.status, 'active'));

  // ── This week revenue ──
  const [weekResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(purchase)
    .innerJoin(product, eq(purchase.productId, product.id))
    .where(and(eq(purchase.status, 'active'), gte(purchase.createdAt, startOfWeek)));

  // ── This month revenue ──
  const [monthResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(purchase)
    .innerJoin(product, eq(purchase.productId, product.id))
    .where(and(eq(purchase.status, 'active'), gte(purchase.createdAt, startOfMonth)));

  // ── Daily revenue for the last 30 days (for chart) ──
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dailyRevenue = await db
    .select({
      date: sql<string>`date(${purchase.createdAt} / 1000, 'unixepoch')`,
      revenue: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
      sales: sql<number>`count(*)`,
    })
    .from(purchase)
    .innerJoin(product, eq(purchase.productId, product.id))
    .where(and(eq(purchase.status, 'active'), gte(purchase.createdAt, thirtyDaysAgo)))
    .groupBy(sql`date(${purchase.createdAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${purchase.createdAt} / 1000, 'unixepoch')`);

  // Fill in missing days with zeros
  const chartData: { date: string; revenue: number; sales: number }[] = [];
  const revenueMap = new Map(
    dailyRevenue.map((r) => [r.date, { revenue: r.revenue, sales: r.sales }])
  );

  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const data = revenueMap.get(dateStr);
    chartData.push({
      date: dateStr,
      revenue: data?.revenue ?? 0,
      sales: data?.sales ?? 0,
    });
  }

  return {
    totalRevenue: totalResult.total,
    totalSales: totalResult.count,
    weekRevenue: weekResult.total,
    weekSales: weekResult.count,
    monthRevenue: monthResult.total,
    monthSales: monthResult.count,
    chartData,
  };
});

/**
 * Fetch event-level analytics: funnel, trends, cancellation reasons,
 * and per-product conversion stats. Accepts a dayRange (7 | 30 | 90 | 0=all).
 */
export const getEventAnalyticsFn = createServerFn({ method: 'GET' })
  .validator((data: { days: number }) => data)
  .handler(async ({ data }) => {
    const { days } = data;
    const now = new Date();

    const cutoff = days > 0 ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : new Date(0);

    // ── Funnel: aggregate counts per event type ──
    const funnelRows = await db
      .select({
        event: analyticsEvent.event,
        total: count(),
      })
      .from(analyticsEvent)
      .where(gte(analyticsEvent.createdAt, cutoff))
      .groupBy(analyticsEvent.event);

    const funnelMap = new Map(funnelRows.map((r) => [r.event, r.total]));
    const pageViews = funnelMap.get('page_view') ?? 0;
    const initiated = funnelMap.get('checkout_initiated') ?? 0;
    const completed = funnelMap.get('checkout_completed') ?? 0;
    const cancelled = funnelMap.get('checkout_cancelled') ?? 0;

    // ── Daily event trend (page_view + checkout_initiated) ──
    const daysBack = days > 0 ? days : 30;
    const trendCutoff = new Date(now.getTime() - (daysBack - 1) * 24 * 60 * 60 * 1000);
    trendCutoff.setHours(0, 0, 0, 0);

    const trendRows = await db
      .select({
        date: sql<string>`date(${analyticsEvent.createdAt} / 1000, 'unixepoch')`,
        event: analyticsEvent.event,
        total: count(),
      })
      .from(analyticsEvent)
      .where(
        and(
          gte(analyticsEvent.createdAt, trendCutoff),
          sql`${analyticsEvent.event} in ('page_view', 'checkout_initiated')`
        )
      )
      .groupBy(sql`date(${analyticsEvent.createdAt} / 1000, 'unixepoch')`, analyticsEvent.event)
      .orderBy(sql`date(${analyticsEvent.createdAt} / 1000, 'unixepoch')`);

    // Build daily map: date -> { page_view, checkout_initiated }
    type DayData = { page_view: number; checkout_initiated: number };
    const dayMap = new Map<string, DayData>();
    for (const row of trendRows) {
      const entry = dayMap.get(row.date) ?? {
        page_view: 0,
        checkout_initiated: 0,
      };
      if (row.event === 'page_view') entry.page_view = row.total;
      if (row.event === 'checkout_initiated') entry.checkout_initiated = row.total;
      dayMap.set(row.date, entry);
    }

    const trendData: {
      date: string;
      page_view: number;
      checkout_initiated: number;
    }[] = [];
    for (let i = 0; i < daysBack; i++) {
      const d = new Date(trendCutoff);
      d.setDate(trendCutoff.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = dayMap.get(dateStr) ?? {
        page_view: 0,
        checkout_initiated: 0,
      };
      trendData.push({ date: dateStr, ...entry });
    }

    // ── Cancellation reasons ──
    const reasonRows = await db
      .select({
        reason: cancelFeedback.reason,
        total: count(),
      })
      .from(cancelFeedback)
      .where(gte(cancelFeedback.createdAt, cutoff))
      .groupBy(cancelFeedback.reason)
      .orderBy(sql`count(*) desc`);

    // ── Per-product conversion ──
    // Get all products
    const products = await db
      .select({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
      })
      .from(product);

    // Get event counts per product
    const productEventRows = await db
      .select({
        productId: analyticsEvent.productId,
        event: analyticsEvent.event,
        total: count(),
      })
      .from(analyticsEvent)
      .where(
        and(gte(analyticsEvent.createdAt, cutoff), sql`${analyticsEvent.productId} is not null`)
      )
      .groupBy(analyticsEvent.productId, analyticsEvent.event);

    type ProductEventMap = Map<string, Record<string, number>>;
    const productEventMap: ProductEventMap = new Map();
    for (const row of productEventRows) {
      if (!row.productId) continue;
      const entry = productEventMap.get(row.productId) ?? {};
      entry[row.event] = row.total;
      productEventMap.set(row.productId, entry);
    }

    const productConversions = products.map((p) => {
      const events = productEventMap.get(p.id) ?? {};
      const views = events['page_view'] ?? 0;
      const inits = events['checkout_initiated'] ?? 0;
      const comps = events['checkout_completed'] ?? 0;
      const conversionRate = inits > 0 ? Math.round((comps / inits) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        priceCents: p.priceCents,
        views,
        initiated: inits,
        completed: comps,
        conversionRate,
      };
    });

    return {
      funnel: { pageViews, initiated, completed, cancelled },
      trendData,
      reasonBreakdown: reasonRows,
      productConversions,
    };
  });
