import { createFileRoute, Link } from "@tanstack/react-router";
import { getSettingsFn } from "#/lib/settings.functions";
import { BrandLockup } from "#/components/brand";
import { Button } from "#/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  loader: async () => {
    const settings = await getSettingsFn();
    return { settings };
  },
  component: TermsPage,
});

function TermsPage() {
  const { settings } = Route.useLoaderData();
  const shopName = settings.shopName || "My Shop";

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
          <h1 className="font-heading text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <section className="space-y-6 text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
            {settings.termsOfService ? (
              settings.termsOfService
            ) : (
              <div className="space-y-6">
                <p>
                  Welcome to <strong>{shopName}</strong>. By purchasing digital products from our store, you agree to comply with and be bound by the following terms and conditions.
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">1. Digital Deliverables</h2>
                <p>
                  All purchases made through this storefront are for digital goods. Upon successful checkout completed via Stripe, you will receive a secure access link delivered to your customer email. This link provides download access to the files purchased.
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">2. License & Usage</h2>
                <p>
                  When you purchase a product, we grant you a personal, non-exclusive, non-transferable license to download and use the product for your personal or specified commercial use (as detailed in the product description). You may not resell, redistribute, or sub-license the product files to third parties.
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">3. Refund Policy</h2>
                <p>
                  Due to the nature of digital products, all sales are final once download access is provided. Refunds may be granted solely at our discretion under exceptional circumstances (e.g. file corruption or duplicate purchase errors).
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">4. Limitation of Liability</h2>
                <p>
                  Products are provided on an "as-is" basis without warranties of any kind. <strong>{shopName}</strong> shall not be liable for any direct, indirect, or incidental damages resulting from the use or inability to use the purchased digital assets.
                </p>

                <h2 className="text-base font-semibold text-foreground pt-4">5. Customer Support & Contact</h2>
                <p>
                  If you have any questions regarding your order, licensing, or these terms, please reach out to us using our **live Customer Support chat** on the website or contact the store administrator directly at: <strong>{settings.fromEmail || "our customer support"}</strong>.
                </p>
              </div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}
