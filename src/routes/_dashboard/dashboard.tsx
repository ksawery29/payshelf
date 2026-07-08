import { useState } from 'react'
import { createFileRoute, useRouter, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { listProductsFn, createProductFn } from '#/lib/products.functions'
import { updateProductFn, deleteProductFn } from '#/lib/products.mutations'
import { getAnalyticsFn } from '#/lib/analytics.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Separator } from '#/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '#/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { PackageOpen, Plus, TrendingUp, ShoppingBag, CalendarDays, Calendar } from 'lucide-react'

export const Route = createFileRoute('/_dashboard/dashboard')({
  loader: async () => {
    const [products, analytics] = await Promise.all([
      listProductsFn(),
      getAnalyticsFn(),
    ])
    // New users with no products get walked through onboarding
    if (products.length === 0) {
      throw redirect({ to: '/onboarding' })
    }
    return { products, analytics }
  },
  component: DashboardPage,
})

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

function DashboardPage() {
  const { data: session } = authClient.useSession()
  const { products, analytics } = Route.useLoaderData()
  const router = useRouter()

  const chartData = analytics.chartData.map((d) => ({
    ...d,
    revenue: d.revenue / 100, // convert to dollars for display
    label: formatDate(d.date),
  }))

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <h1 className="font-heading text-lg font-semibold tracking-tight">
            Payshelf
          </h1>
          <div className="flex items-center gap-3">
            {session?.user && (
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => { window.location.href = '/login' },
                  },
                })
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 space-y-8">

        {/* ── Analytics ──────────────────────────────────────── */}
        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-4">Overview</h2>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <StatCard
              title="Total revenue"
              value={formatPrice(analytics.totalRevenue)}
              sub={`${analytics.totalSales} sale${analytics.totalSales === 1 ? '' : 's'}`}
              icon={<TrendingUp className="size-4 text-muted-foreground" />}
            />
            <StatCard
              title="This month"
              value={formatPrice(analytics.monthRevenue)}
              sub={`${analytics.monthSales} sale${analytics.monthSales === 1 ? '' : 's'}`}
              icon={<Calendar className="size-4 text-muted-foreground" />}
            />
            <StatCard
              title="This week"
              value={formatPrice(analytics.weekRevenue)}
              sub={`${analytics.weekSales} sale${analytics.weekSales === 1 ? '' : 's'}`}
              icon={<CalendarDays className="size-4 text-muted-foreground" />}
            />
            <StatCard
              title="Products"
              value={String(products.length)}
              sub="in your shelf"
              icon={<ShoppingBag className="size-4 text-muted-foreground" />}
            />
          </div>

          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Revenue — last 30 days</CardTitle>
              <CardDescription>
                Daily active purchase revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-52 w-full">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          `$${(value as number).toFixed(2)}`,
                          'Revenue',
                        ]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        {/* ── Products ───────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Products
            </h2>
            <CreateProductDialog onCreated={() => router.invalidate()} />
          </div>

          {products.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 border-dashed bg-transparent py-24 text-center shadow-none">
              <PackageOpen className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <h3 className="text-xl font-medium">No products yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first product to start selling.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden py-0 gap-0">
                  {product.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col gap-1 px-5 pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <div className="flex gap-1 shrink-0">
                        <EditProductDialog product={product} onUpdated={() => router.invalidate()} />
                        <DeleteProductButton id={product.id} onDeleted={() => router.invalidate()} />
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                    {product.filePath && (
                      <p className="mt-1 truncate text-xs text-muted-foreground/60 font-mono">
                        {product.filePath}
                      </p>
                    )}
                  </CardContent>
                  <Separator />
                  <CardFooter className="flex items-center justify-between px-5 py-4">
                    <Badge variant="secondary" className="font-mono text-sm">
                      {formatPrice(product.priceCents)}
                    </Badge>
                    {product.stripeProductId ? (
                      <Badge variant="outline" className="text-xs">
                        Stripe linked
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No Stripe ID</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string
  value: string
  sub: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="font-heading text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function CreateProductDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [filePath, setFilePath] = useState('')
  const [stripeProductId, setStripeProductId] = useState('')

  function resetForm() {
    setName(''); setDescription(''); setPrice('')
    setImageUrl(''); setFilePath(''); setStripeProductId(''); setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const priceCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceCents) || priceCents <= 0) { setError('Enter a valid price'); return }
    setLoading(true)
    try {
      await createProductFn({
        data: { name, description, priceCents, imageUrl: imageUrl || undefined, filePath: filePath || undefined, stripeProductId: stripeProductId || undefined },
      })
      resetForm(); setOpen(false); onCreated()
    } catch {
      setError('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" data-icon="inline-start" />
        Add product
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
          <DialogDescription>Add a digital product to your shelf.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="product-name">Name *</Label>
              <Input id="product-name" placeholder="e.g. Notion Template Pack" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Input id="product-description" placeholder="A short description of the product" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (USD) *</Label>
              <Input id="product-price" type="number" step="0.01" min="0.01" placeholder="19.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image">Image URL</Label>
              <Input id="product-image" type="url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-file">File path</Label>
              <Input id="product-file" placeholder="uploads/my-file.zip" value={filePath} onChange={(e) => setFilePath(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stripe">Stripe Product ID</Label>
              <Input id="product-stripe" placeholder="prod_..." value={stripeProductId} onChange={(e) => setStripeProductId(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating…
                </span>
              ) : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ProductType {
  id: string
  name: string
  description: string
  priceCents: number
  imageUrl: string | null
  filePath: string | null
  stripeProductId: string | null
}

function EditProductDialog({ product, onUpdated }: { product: ProductType; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || '')
  const [price, setPrice] = useState((product.priceCents / 100).toString())
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '')
  const [filePath, setFilePath] = useState(product.filePath || '')
  const [stripeProductId, setStripeProductId] = useState(product.stripeProductId || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const priceCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceCents) || priceCents <= 0) { setError('Enter a valid price'); return }
    setLoading(true)
    try {
      await updateProductFn({
        data: {
          id: product.id,
          name,
          description,
          priceCents,
          imageUrl: imageUrl || undefined,
          filePath: filePath || undefined,
          stripeProductId: stripeProductId || undefined
        },
      })
      setOpen(false)
      onUpdated()
    } catch {
      setError('Failed to update product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="xs" />}>
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>Modify your product's details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (USD) *</Label>
              <Input id="edit-price" type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input id="edit-image" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-file">File path</Label>
              <Input id="edit-file" value={filePath} onChange={(e) => setFilePath(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stripe">Stripe Product ID</Label>
              <Input id="edit-stripe" value={stripeProductId} onChange={(e) => setStripeProductId(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteProductButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return
    setLoading(true)
    try {
      await deleteProductFn({ data: { id } })
      onDeleted()
    } catch {
      alert('Failed to delete product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="xs"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'Deleting…' : 'Delete'}
    </Button>
  )
}

