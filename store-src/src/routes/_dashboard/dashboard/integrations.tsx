import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import {
  getIntegrationsFn,
  saveIntegrationFn,
  sendTestNotificationFn,
} from '#/lib/integrations.functions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Puzzle,
  Send,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const Route = createFileRoute('/_dashboard/dashboard/integrations')({
  loader: async () => {
    const integrations = await getIntegrationsFn();
    return { integrations };
  },
  component: IntegrationsPage,
});

const EVENT_CATEGORIES = [
  {
    title: 'Sales & Payments',
    events: [
      {
        id: 'purchase.created',
        label: 'Order Completed',
        desc: 'Triggered when a customer successfully purchases a product',
      },
      {
        id: 'purchase.refunded',
        label: 'Order Refunded',
        desc: 'Triggered when a customer purchase status changes to refunded',
      },
      {
        id: 'purchase.disputed',
        label: 'Order Disputed',
        desc: 'Triggered when a purchase transaction is disputed by the customer',
      },
    ],
  },
  {
    title: 'Customer Support',
    events: [
      {
        id: 'support.chat_opened',
        label: 'Support Chat Opened',
        desc: 'Triggered when a visitor or customer opens a support session',
      },
      {
        id: 'support.message_created',
        label: 'New Message Received',
        desc: 'Triggered when a message is sent in support chat (customer or agent)',
      },
      {
        id: 'support.chat_closed',
        label: 'Support Chat Closed',
        desc: 'Triggered when a support chat is closed or resolved',
      },
    ],
  },
  {
    title: 'Product Catalog',
    events: [
      {
        id: 'product.created',
        label: 'Product Created',
        desc: 'Triggered when a new product is added to the shop catalog',
      },
      {
        id: 'product.updated',
        label: 'Product Updated',
        desc: 'Triggered when details of an existing product are edited',
      },
      {
        id: 'product.deleted',
        label: 'Product Deleted',
        desc: 'Triggered when a product is deleted from the shop catalog',
      },
    ],
  },
];

function IntegrationsPage() {
  const { integrations } = Route.useLoaderData();
  const router = useRouter();

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 bg-accent text-accent-foreground">Webhook integrations</Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Integrations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Connect your Payshelf store with external platforms using incoming webhooks to receive
            real-time notifications about events.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-10">
        {/* Event Notifications Category */}
        <section aria-labelledby="category-event-notifications" className="flex flex-col gap-4">
          <div>
            <h2 id="category-event-notifications" className="text-lg font-semibold tracking-tight text-foreground">
              Event Notifications
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get notified immediately in your channel workspaces when store events occur.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Slack Card */}
            <IntegrationCard
              provider="slack"
              name="Slack"
              description="Send event notifications directly to a Slack channel."
              logoUrl="/icons/slack.webp"
              config={integrations.slack}
              onSave={() => router.invalidate()}
            />

            {/* Discord Card */}
            <IntegrationCard
              provider="discord"
              name="Discord"
              description="Post real-time event updates to a Discord server webhook."
              logoUrl="/icons/discord.png"
              config={integrations.discord}
              onSave={() => router.invalidate()}
            />
          </div>
        </section>

        {/* Marketing & Advertising Category */}
        <section aria-labelledby="category-marketing-ads" className="flex flex-col gap-4 pt-6 border-t border-border/50">
          <div>
            <h2 id="category-marketing-ads" className="text-lg font-semibold tracking-tight text-foreground">
              Marketing & Advertising
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sync conversion events directly to advertising networks to optimize attribution.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Meta Ads Card */}
            <UpcomingIntegrationCard
              name="Meta Ads"
              description="Sync customer purchase events with Meta Pixel to optimize Facebook ad campaigns."
              logoUrl="/icons/meta.png"
            />

            {/* TikTok Ads Card */}
            <UpcomingIntegrationCard
              name="TikTok Ads"
              description="Send checkout completion and sales events directly to TikTok Event API."
              logoUrl="/icons/tiktok.webp"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function UpcomingIntegrationCard({
  name,
  description,
  logoUrl,
}: {
  name: string;
  description: string;
  logoUrl: string;
}) {
  return (
    <Card className="bg-card/40 opacity-70 border-dashed border-border/80 select-none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-muted/30 p-2">
              <img
                src={logoUrl}
                alt={`${name} Logo`}
                className="size-10 object-contain grayscale"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg text-muted-foreground">{name}</CardTitle>
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 uppercase text-[10px] tracking-wider font-semibold">
                  Soon
                </Badge>
              </div>
              <CardDescription className="mt-1 text-xs">{description}</CardDescription>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border/30 pt-4 flex justify-between items-center">
          <span className="text-xs text-muted-foreground/80 italic">Integration coming soon...</span>
          <Button variant="outline" size="sm" disabled className="gap-2 text-muted-foreground/50 border-border/30">
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface IntegrationConfig {
  id: string;
  url: string;
  enabled: boolean;
  events: string[];
}

function IntegrationCard({
  provider,
  name,
  description,
  logoUrl,
  config,
  onSave,
}: {
  provider: 'slack' | 'discord';
  name: string;
  description: string;
  logoUrl: string;
  config: IntegrationConfig;
  onSave: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(config.enabled);
  const [webhookUrl, setWebhookUrl] = useState(config.url);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(config.events);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveIntegrationFn({
        data: {
          id: provider,
          url: webhookUrl,
          enabled: isEnabled,
          events: selectedEvents,
        },
      });
      onSave();
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to save integration:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      setTestStatus('error');
      setTestError('Please provide a webhook URL first.');
      return;
    }
    setTesting(true);
    setTestStatus('idle');
    try {
      await sendTestNotificationFn({
        data: {
          id: provider,
          url: webhookUrl,
        },
      });
      setTestStatus('success');
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err?.message || 'Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-card/95 hover:border-border transition-colors duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-muted/65 p-2">
              <img src={logoUrl} alt={`${name} Logo`} className="size-10 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                {config.enabled ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-border/80">
                    Inactive
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1 text-xs">{description}</CardDescription>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border/50 pt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Webhook URL</span>
            <span className="font-mono text-foreground/80 max-w-[200px] truncate">
              {config.url ? config.url.replace(/(https?:\/\/)[^\/]+/, '$1...') : 'Not configured'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Subscribed Events</span>
            <span className="font-semibold text-foreground">
              {config.enabled
                ? `${config.events.length} event${config.events.length === 1 ? '' : 's'}`
                : 'None'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sliders className="size-3.5" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[85vh] overflow-y-auto"
              showCloseButton={false}
            >
              <DialogHeader>
                <DialogTitle>Configure {name} Webhook</DialogTitle>
                <DialogDescription>
                  Set up your incoming webhook URL and select which event notifications you want to
                  receive.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-6 py-4">
                {/* Enable Switch */}
                <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/10 p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Enable Integration</span>
                    <span className="text-xs text-muted-foreground">
                      Activate notifications to your {name} channel.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      isEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Webhook URL Input */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`${provider}-url`} className="font-semibold text-sm">
                    Webhook URL
                  </Label>
                  <Input
                    id={`${provider}-url`}
                    type="url"
                    placeholder={
                      provider === 'slack'
                        ? 'https://hooks.slack.com/services/...'
                        : 'https://discord.com/api/webhooks/...'
                    }
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {provider === 'slack' ? (
                      <>
                        Obtain an incoming webhook URL from the{' '}
                        <a
                          href="https://api.slack.com/apps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-foreground text-primary inline-flex items-center gap-0.5"
                        >
                          Slack Console <ExternalLink className="size-3" />
                        </a>
                      </>
                    ) : (
                      <>
                        Create a webhook in channel settings → Integrations → Webhooks on Discord.
                      </>
                    )}
                  </p>
                </div>

                {/* Event Category Selector */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Event Notifications</span>
                    <span className="text-xs text-muted-foreground">
                      Choose which real-time event updates to send to this webhook.
                    </span>
                  </div>

                  <div className="flex flex-col gap-6">
                    {EVENT_CATEGORIES.map((cat) => (
                      <div key={cat.title} className="flex flex-col gap-2.5">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {cat.title}
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {cat.events.map((evt) => (
                            <label
                              key={evt.id}
                              className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-3 hover:bg-muted/10 cursor-pointer transition select-none"
                            >
                              <input
                                type="checkbox"
                                checked={selectedEvents.includes(evt.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEvents([...selectedEvents, evt.id]);
                                  } else {
                                    setSelectedEvents(selectedEvents.filter((id) => id !== evt.id));
                                  }
                                }}
                                className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-ring"
                              />
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-foreground text-sm">
                                  {evt.label}
                                </span>
                                <span className="text-xs text-muted-foreground leading-normal">
                                  {evt.desc}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testing Connection Panel */}
                <div className="border-t border-border/60 pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">Test Connection</span>
                      <span className="text-xs text-muted-foreground">
                        Send a message to check if the webhook is set up correctly.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleTest}
                      disabled={testing || !webhookUrl}
                      className="gap-2 shrink-0"
                    >
                      {testing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      Test Hook
                    </Button>
                  </div>

                  {testStatus === 'success' && (
                    <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-emerald-600 border border-emerald-500/20 text-xs">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Test webhook sent successfully! Check your channel.</span>
                    </div>
                  )}

                  {testStatus === 'error' && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive border border-destructive/20 text-xs">
                      <AlertCircle className="size-4 shrink-0" />
                      <span className="font-medium truncate">{testError}</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-border/60 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
