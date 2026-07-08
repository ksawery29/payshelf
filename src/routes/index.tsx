import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { listProductsFn } from '#/lib/products.functions';
import { getSettingsFn } from '#/lib/settings.functions';
import { createCheckoutFn } from '#/lib/checkout.functions';
import { trackEventFn, getOrCreateVisitorId } from '#/lib/events.functions';
import { BrandLockup } from '#/components/brand';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardFooter } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { Footer } from '#/components/footer';

export const Route = createFileRoute('/')({
  loader: async () => {
    const [products, settings] = await Promise.all([listProductsFn(), getSettingsFn()]);
    return { products, settings };
  },
  component: Home,
});

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
};

function Home() {
  const { products, settings } = Route.useLoaderData();

  // Fire a page_view event once on mount (anonymous, best-effort)
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    void trackEventFn({ data: { event: 'page_view', visitorId } });
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLockup shopName={settings.shopName} />
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/login')}>
            Seller login
          </Button>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8"
      >
        {products.length === 0 ? (
          <EmptyShelf />
        ) : (
          <section
            aria-label="Products"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>

      <Footer shopName={settings.shopName} />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBuy() {
    setError('');
    setLoading(true);
    try {
      const visitorId = getOrCreateVisitorId();
      const result = await createCheckoutFn({
        data: { productId: product.id, visitorId },
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      setError('Checkout could not be started. Please try again.');
      setLoading(false);
    }
  }

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

      <CardContent className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-base font-semibold tracking-tight">{product.name}</h2>
          <Badge variant="secondary" className="font-mono text-sm">
            {formatPrice(product.priceCents)}
          </Badge>
        </div>
        {product.description && (
          <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
        )}
        {error && (
          <p className="mt-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </CardContent>

      <CardFooter className="border-t border-border/80 bg-muted/30 px-5 py-4">
        <Button className="w-full" onClick={handleBuy} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting checkout
            </span>
          ) : (
            <>
              Buy now
              <ArrowRight className="size-4" data-icon="inline-end" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyShelf() {
  return (
    <Card className="items-center border-dashed bg-card/70 py-16 text-center">
      <PackageOpen className="size-10 text-muted-foreground" strokeWidth={1.5} />
      <CardContent className="max-w-md">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">The shelf is empty</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Products added from the seller dashboard will appear here with secure checkout.
        </p>
      </CardContent>
      <Button variant="outline" onClick={() => (window.location.href = '/login')}>
        Go to dashboard
      </Button>
    </Card>
  );
}
