import { PrimaryGrowButton } from '#/components/ui/grow-button';
import { createCheckoutFn } from '#/lib/checkout.functions';
import { getOrCreateVisitorId } from '#/lib/events.functions';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertTriangleIcon, Loader2Icon, MailIcon } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/p/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { id } = Route.useParams();

  async function handleBuy() {
    setError('');
    setLoading(true);
    try {
      const visitorId = getOrCreateVisitorId();
      const result = await createCheckoutFn({
        data: { productId: id, visitorId },
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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-500/20 to-transparent" />

      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:mb-6 sm:h-16 sm:w-16">
            <MailIcon className="h-9 w-9 text-foreground sm:h-12 sm:w-12" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            You're buying a digital product
          </h1>

          <p className="mt-3 text-base leading-7 text-muted-foreground sm:mt-4 sm:text-lg sm:leading-8">
            During checkout, you'll be asked to provide your email address. Your download link will
            be sent there, so please make sure it's entered correctly.
          </p>

          {error && <p className="mt-4 text-sm text-red-600 sm:text-base">{error}</p>}
          <PrimaryGrowButton className="mt-8 sm:mt-10" onClick={handleBuy} disabled={loading}>
            {loading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Continue to checkout'
            )}
          </PrimaryGrowButton>
        </div>
      </div>

      <footer className="relative mt-8 flex items-center gap-4 text-sm text-muted-foreground">
        <Link to="/terms" className="hover:text-foreground hover:underline">
          Terms
        </Link>
        <span className="text-muted-foreground/50">·</span>
        <Link to="/privacy" className="hover:text-foreground hover:underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
