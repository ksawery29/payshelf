import { createFileRoute, Link } from '@tanstack/react-router';
import { getSettingsFn } from '#/lib/settings.functions';
import { BrandLockup } from '#/components/brand';
import { Button } from '#/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/privacy')({
  loader: async () => {
    const settings = await getSettingsFn();
    return { settings };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const { settings } = Route.useLoaderData();
  const shopName = settings.shopName || 'My Shop';

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <BrandLockup shopName={shopName} />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to store
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="prose prose-neutral dark:prose-invert mx-auto">
          <h1 className="font-heading text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>

          <section className="space-y-6 text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
            {settings.privacyPolicy ? (
              settings.privacyPolicy
            ) : (
              <div className="space-y-6">
                <p>
                  At <strong>{shopName}</strong>, we are committed to protecting your privacy. This
                  policy describes how we collect, use, and handle your information when you
                  purchase digital items from our store.
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">
                  1. Information We Collect
                </h2>
                <p>
                  When purchasing from us or interacting with our storefront, we collect the
                  following details:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Customer Email:</strong> To deliver purchase links, send order
                    transaction details, and link your customer support chat sessions.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Processed directly via Stripe. We do not
                    store credit card or raw payment information on our servers; we only store
                    Stripe Session IDs and Payment Intent IDs to verify transactions.
                  </li>
                  <li>
                    <strong>Support Chat Communications:</strong> When using our live customer
                    support chat, we store chat message transcripts, the associated visitor ID, and
                    optional emails to maintain the two-way conversation history.
                  </li>
                  <li>
                    <strong>Anonymous Usage Data:</strong> We generate and store a randomized
                    visitor ID inside your browser's local storage to track checkout initiation,
                    cancellation, and completions for analytics, as well as to retrieve your chat
                    history.
                  </li>
                  <li>
                    <strong>Checkout Feedback:</strong> If you cancel a checkout session, we collect
                    optional feedback details (such as the reason for cancellation and voluntary
                    comments) to help improve our services.
                  </li>
                </ul>

                <h2 className="text-base font-semibold text-foreground pt-4">
                  2. How We Use Information
                </h2>
                <p>We use the collected information to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Process your transactions and deliver purchased digital products.</li>
                  <li>Generate secure, authenticated access links for product download.</li>
                  <li>Maintain, process, and respond to support chat communications.</li>
                  <li>Analyze conversion metrics, visitor counts, and storefront performance.</li>
                  <li>Improve customer purchase flows and overall user experience.</li>
                </ul>

                <h2 className="text-base font-semibold text-foreground pt-4">
                  3. Third-Party Services
                </h2>
                <p>
                  We share minimum necessary information with third-party service providers who
                  assist us in operating our store:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Stripe:</strong> Our third-party payment gateway processes all checkout
                    transactions.
                  </li>
                  <li>
                    <strong>Email Delivery:</strong> We use third-party email providers (such as
                    Resend) to send you order verification and digital asset links.
                  </li>
                </ul>

                <h2 className="text-base font-semibold text-foreground pt-4">4. Security</h2>
                <p>
                  We implement industry-standard security measures to safeguard your personal data.
                  Product access links are cryptographically random, unique to each purchase, and
                  valid only for delivery.
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">5. Contact Us</h2>
                <p>
                  For privacy-related questions or data deletion requests, please contact us via our
                  **Customer Support chat** or email:{' '}
                  <strong>{settings.fromEmail || 'our customer support'}</strong>.
                </p>
              </div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}
