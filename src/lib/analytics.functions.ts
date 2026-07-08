import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { purchase, product } from '../db/schema'
import { eq, sql, and, gte } from 'drizzle-orm'

/**
 * Fetch dashboard analytics data.
 */
export const getAnalyticsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const now = new Date()

    // Start of current week (Monday)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    startOfWeek.setHours(0, 0, 0, 0)

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // ── Total revenue (active purchases only) ──
    const [totalResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(purchase)
      .innerJoin(product, eq(purchase.productId, product.id))
      .where(eq(purchase.status, 'active'))

    // ── This week revenue ──
    const [weekResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(purchase)
      .innerJoin(product, eq(purchase.productId, product.id))
      .where(
        and(
          eq(purchase.status, 'active'),
          gte(purchase.createdAt, startOfWeek),
        ),
      )

    // ── This month revenue ──
    const [monthResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(purchase)
      .innerJoin(product, eq(purchase.productId, product.id))
      .where(
        and(
          eq(purchase.status, 'active'),
          gte(purchase.createdAt, startOfMonth),
        ),
      )

    // ── Daily revenue for the last 30 days (for chart) ──
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const dailyRevenue = await db
      .select({
        date: sql<string>`date(${purchase.createdAt} / 1000, 'unixepoch')`,
        revenue: sql<number>`coalesce(sum(${product.priceCents}), 0)`,
        sales: sql<number>`count(*)`,
      })
      .from(purchase)
      .innerJoin(product, eq(purchase.productId, product.id))
      .where(
        and(
          eq(purchase.status, 'active'),
          gte(purchase.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`date(${purchase.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${purchase.createdAt} / 1000, 'unixepoch')`)

    // Fill in missing days with zeros
    const chartData: { date: string; revenue: number; sales: number }[] = []
    const revenueMap = new Map(
      dailyRevenue.map((r) => [r.date, { revenue: r.revenue, sales: r.sales }]),
    )

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(thirtyDaysAgo.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const data = revenueMap.get(dateStr)
      chartData.push({
        date: dateStr,
        revenue: data?.revenue ?? 0,
        sales: data?.sales ?? 0,
      })
    }

    return {
      totalRevenue: totalResult.total,
      totalSales: totalResult.count,
      weekRevenue: weekResult.total,
      weekSales: weekResult.count,
      monthRevenue: monthResult.total,
      monthSales: monthResult.count,
      chartData,
    }
  },
)
