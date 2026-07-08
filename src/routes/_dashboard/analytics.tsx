import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { getEventAnalyticsFn } from '#/lib/analytics.functions'
import { getSettingsFn } from '#/lib/settings.functions'
import { BrandLockup } from '#/components/brand'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '#/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BarChart2,
  ChevronDown,
  Eye,
  LogOut,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type DayRange = 7 | 30 | 90 | 0

const DAY_OPTIONS: { label: string; value: DayRange }[] = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'All time', value: 0 },
]

// ── Route ──────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/_dashboard/analytics')({
  loader: async () => {
    const settings = await getSettingsFn()
    // Default to 30 days on initial load
    const eventData = await getEventAnalyticsFn({ data: { days: 30 } })
    return { settings, eventData, initialDays: 30 as DayRange }
  },
  component: AnalyticsPage,
})

// ── Helpers ────────────────────────────────────────────────────────────────

function pct(num: number, den: number) {
  if (den === 0) return '—'
  return `${Math.round((num / den) * 100)}%`
}

function dropOff(from: number, to: number) {
  if (from === 0) return null
  const lost = from - to
  return Math.round((lost / from) * 100)
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const REASON_LABELS: Record<string, string> = {
  too_expensive: 'Too expensive',
  just_browsing: 'Just browsing',
  found_alternative: 'Found alternative',
  trust: 'Trust concern',
  other: 'Other',
}

// ── Chart configs ──────────────────────────────────────────────────────────

const trendConfig = {
  page_view: {
    label: 'Page views',
    color: 'var(--color-chart-1)',
  },
  checkout_initiated: {
    label: 'Checkout started',
    color: 'var(--color-chart-3)',
  },
} satisfies ChartConfig

const reasonConfig = {
  total: {
    label: 'Responses',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig

// ── Main page component ────────────────────────────────────────────────────

function AnalyticsPage() {
  const { settings, eventData, initialDays } = Route.useLoaderData()
  const { data: session } = authClient.useSession()

  const [days, setDays] = useState<DayRange>(initialDays)
  const [data, setData] = useState(eventData)
  const [loading, setLoading] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)

  async function handleRangeChange(value: DayRange) {
    setRangeOpen(false)
    if (value === days) return
    setDays(value)
    setLoading(true)
    try {
      const fresh = await getEventAnalyticsFn({ data: { days: value } })
      setData(fresh)
    } finally {
      setLoading(false)
    }
  }

  const { funnel, trendData, reasonBreakdown, productConversions } = data
  const drop1 = dropOff(funnel.pageViews, funnel.initiated)
  const drop2 = dropOff(funnel.initiated, funnel.completed)

  const trendChartData = trendData.map((d) => ({
    ...d,
    label: fmtDate(d.date),
  }))

  const reasonChartData = reasonBreakdown.map((r) => ({
    reason: REASON_LABELS[r.reason] ?? r.reason,
    total: r.total,
  }))

  const selectedLabel =
    DAY_OPTIONS.find((o) => o.value === days)?.label ?? 'Last 30 days'

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <BrandLockup shopName={settings.shopName} />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              <a
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="/analytics"
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
              >
                Analytics
              </a>
              <a
                href="/settings"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Settings
              </a>
              <a
                href="/"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Storefront
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {session?.user && (
              <div className="hidden max-w-[220px] truncate rounded-lg border border-border/80 bg-card px-3 py-1.5 text-sm text-muted-foreground sm:block">
                {session.user.email}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/login'
                    },
                  },
                })
              }}
            >
              <LogOut className="size-4" data-icon="inline-start" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Page header + date range picker */}
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="mb-3 bg-accent text-accent-foreground">
              Seller dashboard
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Visitor funnel, event trends, cancellation feedback, and per-product conversion.
            </p>
          </div>

          {/* Date range dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              id="range-picker-btn"
              aria-haspopup="listbox"
              aria-expanded={rangeOpen}
              onClick={() => setRangeOpen((v) => !v)}
              className="min-w-[148px] justify-between gap-2"
            >
              <span>{selectedLabel}</span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${rangeOpen ? 'rotate-180' : ''}`}
              />
            </Button>
            {rangeOpen && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRangeOpen(false)}
                />
                <ul
                  role="listbox"
                  aria-labelledby="range-picker-btn"
                  className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-border/80 bg-card shadow-lg"
                >
                  {DAY_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        role="option"
                        aria-selected={days === opt.value}
                        className={[
                          'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors',
                          days === opt.value
                            ? 'bg-accent font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        ].join(' ')}
                        onClick={() => handleRangeChange(opt.value)}
                      >
                        {opt.label}
                        {days === opt.value && (
                          <CheckCircle2 className="size-3.5 text-foreground" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="size-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ── A. Funnel ── */}
            <section aria-label="Conversion funnel">
              <h2 className="mb-3 font-heading text-lg font-semibold tracking-tight">
                Conversion funnel
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FunnelStep
                  icon={<Eye className="size-4" />}
                  label="Store visits"
                  count={funnel.pageViews}
                  rate={null}
                />
                <FunnelConnector drop={drop1} />
                <FunnelStep
                  icon={<ShoppingCart className="size-4" />}
                  label="Checkout started"
                  count={funnel.initiated}
                  rate={pct(funnel.initiated, funnel.pageViews)}
                />
                <FunnelConnector drop={drop2} />
                <FunnelStep
                  icon={<CheckCircle2 className="size-4" />}
                  label="Purchase complete"
                  count={funnel.completed}
                  rate={pct(funnel.completed, funnel.initiated)}
                  highlight
                />
              </div>
              {/* Cancelled row */}
              {funnel.cancelled > 0 && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <XCircle className="size-4" />
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <span className="text-sm font-medium">Cancelled at checkout</span>
                    <div className="flex items-center gap-4">
                      <span className="metric-number text-sm font-semibold">{funnel.cancelled}</span>
                      <Badge variant="secondary" className="text-xs">
                        {pct(funnel.cancelled, funnel.initiated)} of started
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ── B. Event trend chart ── */}
            <Card className="bg-card/95">
              <CardHeader className="border-b border-border/80 pb-5">
                <div>
                  <CardTitle className="text-lg">Event trend</CardTitle>
                  <CardDescription>
                    Daily page views and checkouts started over the selected period.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {trendChartData.every(
                  (d) => d.page_view === 0 && d.checkout_initiated === 0,
                ) ? (
                  <EmptyChart message="No events recorded yet. Visit the storefront to start tracking." />
                ) : (
                  <ChartContainer config={trendConfig} className="h-72 w-full">
                    <LineChart
                      data={trendChartData}
                      margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-border/70"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                        minTickGap={42}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="page_view"
                        name="Page views"
                        stroke="var(--color-page_view)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="checkout_initiated"
                        name="Checkout started"
                        stroke="var(--color-checkout_initiated)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                        strokeDasharray="5 3"
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* ── C. Cancellation reasons + D. Product conversion — side by side ── */}
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              {/* Cancellation reasons */}
              <Card className="bg-card/95">
                <CardHeader className="border-b border-border/80 pb-5">
                  <CardTitle className="text-lg">Cancellation reasons</CardTitle>
                  <CardDescription>
                    Why customers stopped at the Stripe checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {reasonChartData.length === 0 ? (
                    <EmptyChart message="No feedback collected yet." />
                  ) : (
                    <ChartContainer config={reasonConfig} className="h-64 w-full">
                      <BarChart
                        data={reasonChartData}
                        layout="vertical"
                        margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          strokeDasharray="4 4"
                          className="stroke-border/70"
                        />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11 }}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="reason"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11 }}
                          width={110}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="total"
                          fill="var(--color-total)"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Per-product conversion table */}
              <Card className="bg-card/95">
                <CardHeader className="border-b border-border/80 pb-5">
                  <CardTitle className="text-lg">Product conversion</CardTitle>
                  <CardDescription>
                    Visits, checkouts started, and purchases per product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {productConversions.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No products found.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/80">
                      {/* Header row */}
                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <span>Product</span>
                        <span className="text-right">Views</span>
                        <span className="text-right">Started</span>
                        <span className="text-right">Bought</span>
                        <span className="text-right">Conv.</span>
                      </div>
                      {productConversions.map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 px-5 py-3.5 text-sm"
                        >
                          <span className="truncate font-medium">{p.name}</span>
                          <span className="metric-number text-right tabular-nums text-muted-foreground">
                            {p.views}
                          </span>
                          <span className="metric-number text-right tabular-nums text-muted-foreground">
                            {p.initiated}
                          </span>
                          <span className="metric-number text-right tabular-nums">
                            {p.completed}
                          </span>
                          <span className="text-right">
                            {p.initiated > 0 ? (
                              <Badge
                                variant={p.conversionRate >= 50 ? 'outline' : 'secondary'}
                                className={[
                                  'font-mono text-xs',
                                  p.conversionRate >= 50 ? 'text-emerald-700' : '',
                                ].join(' ')}
                              >
                                {p.conversionRate}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FunnelStep({
  icon,
  label,
  count,
  rate,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  count: number
  rate: string | null
  highlight?: boolean
}) {
  return (
    <Card
      size="sm"
      className={`bg-card/95 ${highlight ? 'border-emerald-200 dark:border-emerald-900' : ''}`}
    >
      <CardContent className="py-1">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span
            className={[
              'flex size-8 items-center justify-center rounded-lg',
              highlight
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-accent text-accent-foreground',
            ].join(' ')}
          >
            {icon}
          </span>
        </div>
        <p className="metric-number text-3xl font-semibold">{count.toLocaleString()}</p>
        {rate !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {rate} conversion from previous step
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function FunnelConnector({ drop }: { drop: number | null }) {
  return (
    <div className="hidden sm:flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <ArrowRight className="size-5 text-border" />
        {drop !== null && (
          <span className="flex items-center gap-1 rounded-full bg-destructive/8 px-2 py-0.5 text-xs font-medium text-destructive">
            <TrendingDown className="size-3" />
            {drop}% drop
          </span>
        )}
      </div>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <BarChart2 className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="max-w-[260px] text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
