import { useState } from 'react';
import { createFileRoute, useRouter, redirect } from '@tanstack/react-router';
import { authClient } from '#/lib/auth-client';
import { listProductsFn, createProductFn } from '#/lib/products.functions';
import { updateProductFn, deleteProductFn } from '#/lib/products.mutations';
import { getAnalyticsFn } from '#/lib/analytics.functions';
import { getSettingsFn } from '#/lib/settings.functions';
import { BrandLockup } from '#/components/brand';
import { FileUpload } from '#/components/file-upload';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '#/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  FileArchive,
  Link2,
  LogOut,
  PackageOpen,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { PrimaryGrowButton } from '#/components/ui/grow-button';

export const Route = createFileRoute('/_dashboard/dashboard/')({
  loader: async () => {
    const [products, analytics, settings] = await Promise.all([
      listProductsFn(),
      getAnalyticsFn(),
      getSettingsFn(),
    ]);
    if (products.length === 0) {
      throw redirect({ to: '/onboarding' });
    }
    return { products, analytics, settings };
  },
  component: DashboardPage,
});

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

interface ProductType {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  filePath: string | null;
  stripePriceId: string | null;
}

function DashboardPage() {
  const { data: session } = authClient.useSession();
  const { products, analytics, settings } = Route.useLoaderData();
  const router = useRouter();

  const chartData = analytics.chartData.map((d) => ({
    ...d,
    revenue: d.revenue / 100,
    label: formatDate(d.date),
  }));

  const linkedProducts = products.filter((product) => product.stripePriceId).length;
  const downloadableProducts = products.filter((product) => product.filePath).length;

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-3 bg-accent text-accent-foreground">Seller dashboard</Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Sales overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track your sales and grow your business.
            </p>
          </div>
          <CreateProductDialog onCreated={() => router.invalidate()} />
        </section>

        <section
          aria-label="Performance metrics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            title="Total revenue"
            value={formatPrice(analytics.totalRevenue)}
            sub={`${analytics.totalSales} sale${analytics.totalSales === 1 ? '' : 's'} processed`}
            icon={<TrendingUp className="size-4" />}
          />
          <StatCard
            title="This month"
            value={formatPrice(analytics.monthRevenue)}
            sub={`${analytics.monthSales} sale${analytics.monthSales === 1 ? '' : 's'} this month`}
            icon={<Calendar className="size-4" />}
          />
          <StatCard
            title="This week"
            value={formatPrice(analytics.weekRevenue)}
            sub={`${analytics.weekSales} sale${analytics.weekSales === 1 ? '' : 's'} since Monday`}
            icon={<CalendarDays className="size-4" />}
          />
          <StatCard
            title="Products"
            value={String(products.length)}
            sub={`${linkedProducts} Stripe linked`}
            icon={<ShoppingBag className="size-4" />}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
          <RevenueChartCard chartData={chartData} />
          <ReadinessCard
            products={products.length}
            linkedProducts={linkedProducts}
            downloadableProducts={downloadableProducts}
          />
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Product shelf</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The products customers can buy from your public storefront.
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {products.length} item{products.length === 1 ? '' : 's'}
            </span>
          </div>

          {products.length === 0 ? (
            <EmptyProducts onCreate={() => router.invalidate()} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductManagementCard
                  key={product.id}
                  product={product}
                  onUpdated={() => router.invalidate()}
                  onDeleted={() => router.invalidate()}
                />
              ))}
            </div>
          )}
        </section>
      </main>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Card size="sm" className="bg-card/95">
      <CardContent className="py-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span className="flex size-8 items-center justify-center rounded-lg text-accent-foreground">
            {icon}
          </span>
        </div>
        <p className="metric-number text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function RevenueChartCard({
  chartData,
}: {
  chartData: Array<{
    date: string;
    revenue: number;
    sales: number;
    label: string;
  }>;
}) {
  return (
    <Card className="bg-card/95">
      <CardHeader className="border-b border-border/80 pb-5">
        <div>
          <CardTitle className="text-lg">Revenue trend</CardTitle>
          <CardDescription>Daily purchase revenue over the last 30 days.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="8%" stopColor="var(--color-revenue)" stopOpacity={0.24} />
                <stop offset="92%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/70" />
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
              tickFormatter={(v: number) => `$${v}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Revenue']}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ReadinessCard({
  products,
  linkedProducts,
  downloadableProducts,
}: {
  products: number;
  linkedProducts: number;
  downloadableProducts: number;
}) {
  const items = [
    {
      label: 'Stripe IDs',
      value: `${linkedProducts}/${products}`,
      ready: linkedProducts === products,
      icon: <Link2 className="size-4" />,
    },
    {
      label: 'Download files',
      value: `${downloadableProducts}/${products}`,
      ready: downloadableProducts === products,
      icon: <FileArchive className="size-4" />,
    },
    {
      label: 'Storefront',
      value: products > 0 ? 'Live' : 'Draft',
      ready: products > 0,
      icon: <ShoppingBag className="size-4" />,
    },
  ];

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle className="text-lg">Shelf readiness</CardTitle>
        <CardDescription>A quick check before sending customers to checkout.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-border/80 bg-background/70 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="metric-number text-sm font-semibold">{item.value}</span>
              {item.ready ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <AlertCircle className="size-4 text-amber-600" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProductManagementCard({
  product,
  onUpdated,
  onDeleted,
}: {
  product: ProductType;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  return (
    <Card className="group overflow-hidden bg-card/95 py-0 transition-transform duration-200 hover:-translate-y-0.5">
      {product.imageUrl ? (
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center border-b border-border/80 bg-muted/70">
          <span className="flex size-12 items-center justify-center rounded-lg bg-card text-lg font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold tracking-tight">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <EditProductDialog product={product} onUpdated={onUpdated} />
            <DeleteProductButton product={product} onDeleted={onDeleted} />
          </div>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <StatusRow
            icon={<Link2 className="size-3.5" />}
            label={product.stripePriceId ? product.stripePriceId : 'Stripe Price ID missing'}
            ready={Boolean(product.stripePriceId)}
          />
          <StatusRow
            icon={<FileArchive className="size-3.5" />}
            label={product.filePath ? product.filePath : 'Download file not set'}
            ready={Boolean(product.filePath)}
          />
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t border-border/80 bg-muted/30 px-5 py-4">
        <Badge variant="secondary" className="font-mono text-sm">
          {formatPrice(product.priceCents)}
        </Badge>
        <Badge
          variant={product.stripePriceId ? 'outline' : 'secondary'}
          className={product.stripePriceId ? 'text-emerald-700' : ''}
        >
          {product.stripePriceId ? 'Checkout ready' : 'Draft'}
        </Badge>
      </CardFooter>
    </Card>
  );
}

function StatusRow({
  icon,
  label,
  ready,
}: {
  icon: React.ReactNode;
  label: string;
  ready: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={ready ? 'text-emerald-600' : 'text-amber-600'}>{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function EmptyProducts({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="items-center border-dashed bg-card/70 py-14 text-center">
      <PackageOpen className="size-9 text-muted-foreground" strokeWidth={1.5} />
      <CardContent className="max-w-md">
        <h3 className="font-heading text-xl font-semibold">No products yet</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Add a first product with a price, Stripe Product ID, and download path so customers can
          buy from your shelf.
        </p>
      </CardContent>
      <CreateProductDialog onCreated={onCreate} />
    </Card>
  );
}

function CreateProductDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');

  function resetForm() {
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setFilePath('');
    setStripePriceId('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const priceCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Enter a valid price.');
      return;
    }
    setLoading(true);
    try {
      await createProductFn({
        data: {
          name,
          description,
          priceCents,
          imageUrl: imageUrl || undefined,
          filePath: filePath || undefined,
          stripePriceId: stripePriceId || undefined,
        },
      });
      resetForm();
      setOpen(false);
      onCreated();
    } catch {
      setError('We could not create the product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger render={<PrimaryGrowButton />}>
        <Plus className="size-4" data-icon="inline-start" />
        Add product
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
          <DialogDescription>
            Add the product details customers will see at checkout.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ProductFormFields
            error={error}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            price={price}
            setPrice={setPrice}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            filePath={filePath}
            setFilePath={setFilePath}
            stripePriceId={stripePriceId}
            setStripePriceId={setStripePriceId}
            prefix="product"
          />
          <DialogFooter className="pt-6">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating
                </span>
              ) : (
                'Create product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditProductDialog({
  product,
  onUpdated,
}: {
  product: ProductType;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState((product.priceCents / 100).toString());
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
  const [filePath, setFilePath] = useState(product.filePath || '');
  const [stripePriceId, setStripePriceId] = useState(product.stripePriceId || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const priceCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Enter a valid price.');
      return;
    }
    setLoading(true);
    try {
      await updateProductFn({
        data: {
          id: product.id,
          name,
          description,
          priceCents,
          imageUrl: imageUrl || undefined,
          filePath: filePath || undefined,
          stripePriceId: stripePriceId || undefined,
        },
      });
      setOpen(false);
      onUpdated();
    } catch {
      setError('We could not save the product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-xs" title="Edit product" aria-label="Edit product" />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>
            Update storefront copy, pricing, and delivery settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ProductFormFields
            error={error}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            price={price}
            setPrice={setPrice}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            filePath={filePath}
            setFilePath={setFilePath}
            stripePriceId={stripePriceId}
            setStripePriceId={setStripePriceId}
            prefix="edit"
          />
          <DialogFooter className="pt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductFormFields({
  error,
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  imageUrl,
  setImageUrl,
  filePath,
  setFilePath,
  stripePriceId,
  setStripePriceId,
  prefix,
}: {
  error: string;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  filePath: string;
  setFilePath: (url: string) => void;
  stripePriceId: string;
  setStripePriceId: (value: string) => void;
  prefix: string;
}) {
  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${prefix}-name`}>Name *</Label>
          <Input
            id={`${prefix}-name`}
            placeholder="Creator Finance Toolkit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${prefix}-description`}>Description</Label>
          <Input
            id={`${prefix}-description`}
            placeholder="What customers receive after purchase"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-price`}>Price (USD) *</Label>
          <Input
            id={`${prefix}-price`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="49.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-stripe`}>Stripe Price ID</Label>
          <Input
            id={`${prefix}-stripe`}
            placeholder="price_..."
            value={stripePriceId}
            onChange={(e) => setStripePriceId(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <FileUpload
            id={`${prefix}-image`}
            label="Product image"
            blobType="image"
            accept="image/*"
            value={imageUrl}
            onChange={setImageUrl}
            hint="PNG, JPG, WebP up to 50 MB"
          />
        </div>
        <div className="sm:col-span-2">
          <FileUpload
            id={`${prefix}-file`}
            label="Download file"
            blobType="file"
            accept="*"
            value={filePath}
            onChange={setFilePath}
            hint="ZIP, PDF, or any file type"
          />
        </div>
      </div>
    </div>
  );
}

function DeleteProductButton({
  product,
  onDeleted,
}: {
  product: ProductType;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    setLoading(true);
    try {
      await deleteProductFn({ data: { id: product.id } });
      setOpen(false);
      onDeleted();
    } catch {
      setError('We could not delete this product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setError('');
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            title="Delete product"
            aria-label="Delete product"
          />
        }
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription>
            This removes {product.name} from your shelf. Existing purchase records stay in your
            database.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting' : 'Delete product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
