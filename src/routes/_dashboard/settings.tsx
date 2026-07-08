import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getSettingsFn, saveSettingsFn } from '#/lib/settings.functions';
import { authClient } from '#/lib/auth-client';
import { BrandLockup } from '#/components/brand';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import { LogOut, Check } from 'lucide-react';

export const Route = createFileRoute('/_dashboard/settings')({
  loader: () => getSettingsFn(),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: session } = authClient.useSession();
  const settings = Route.useLoaderData();

  const [shopName, setShopName] = useState(settings.shopName);
  const [shopTagline, setShopTagline] = useState(settings.shopTagline ?? '');
  const [fromEmail, setFromEmail] = useState(settings.fromEmail ?? '');
  const [termsOfService, setTermsOfService] = useState(settings.termsOfService ?? '');
  const [privacyPolicy, setPrivacyPolicy] = useState(settings.privacyPolicy ?? '');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!shopName.trim()) {
      setError('Shop name is required.');
      return;
    }

    setSaving(true);
    try {
      await saveSettingsFn({
        data: {
          shopName: shopName.trim(),
          shopTagline: shopTagline.trim() || undefined,
          fromEmail: fromEmail.trim() || undefined,
          termsOfService: termsOfService.trim() || undefined,
          privacyPolicy: privacyPolicy.trim() || undefined,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <BrandLockup shopName={shopName} />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              <a
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="/analytics"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Analytics
              </a>
              <a
                href="/dashboard/support"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Support
              </a>
              <a
                href="/settings"
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
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
              onClick={() =>
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/login';
                    },
                  },
                })
              }
            >
              <LogOut className="size-4" data-icon="inline-start" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-3 bg-accent text-accent-foreground">Shop settings</Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em]">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Customize your storefront name and branding. These appear in the store header, emails,
            and browser tab.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
              <CardDescription>How your shop appears to customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop name *</Label>
                <Input
                  id="shop-name"
                  placeholder="e.g. Creator Toolkit"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Shown in the storefront header and email subject lines.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-tagline">
                  Tagline <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="shop-tagline"
                  placeholder="e.g. Premium digital products for creators"
                  value={shopTagline}
                  onChange={(e) => setShopTagline(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A short line shown below the shop name on the storefront.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle className="text-base">Email</CardTitle>
              <CardDescription>
                Sender address used for purchase confirmation emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-email">
                  From address <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="e.g. hello@yourshop.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Overrides the{' '}
                  <code className="rounded bg-muted px-1 py-0.5">RESEND_FROM_EMAIL</code> env
                  variable. Must be a verified sender in Resend.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle className="text-base">Legal Policies</CardTitle>
              <CardDescription>
                Add or override custom terms of service and privacy policy text for your store
                footer. Leaving these blank will use default standard legal texts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms-of-service">
                  Custom Terms of Service{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="terms-of-service"
                  placeholder="Welcome to our shop..."
                  value={termsOfService}
                  onChange={(e) => setTermsOfService(e.target.value)}
                  className="w-full min-h-[140px] rounded-lg border border-border/90 bg-background px-3 py-2 text-sm transition-[color,box-shadow,background-color,border-color] duration-200 outline-none placeholder:text-muted-foreground/75 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy-policy">
                  Custom Privacy Policy{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="privacy-policy"
                  placeholder="We care about your privacy..."
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  className="w-full min-h-[140px] rounded-lg border border-border/90 bg-background px-3 py-2 text-sm transition-[color,box-shadow,background-color,border-color] duration-200 outline-none placeholder:text-muted-foreground/75 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving
                </span>
              ) : saved ? (
                <span className="flex items-center gap-2">
                  <Check className="size-4" />
                  Saved
                </span>
              ) : (
                'Save settings'
              )}
            </Button>
            {saved && (
              <p className="text-sm text-muted-foreground animate-in fade-in-0">
                Your settings have been updated.
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
