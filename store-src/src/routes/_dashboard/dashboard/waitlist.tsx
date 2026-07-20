import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getSettingsFn } from '#/lib/settings.functions';
import { listWaitlistFn } from '#/lib/waitlist.functions';
import { Badge } from '#/components/ui/badge';
import { Card, CardContent } from '#/components/ui/card';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Search, Mail, Calendar, Clipboard, Check } from 'lucide-react';

export const Route = createFileRoute('/_dashboard/dashboard/waitlist')({
  loader: async () => {
    const [settings, waitlistSignups] = await Promise.all([
      getSettingsFn(),
      listWaitlistFn(),
    ]);
    return { settings, waitlistSignups };
  },
  component: WaitlistPage,
});

function formatDate(dateVal: string | number | Date) {
  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface WaitlistSignup {
  id: string;
  email: string;
  createdAt: number | Date;
  productId: string;
  productName: string;
}

function WaitlistPage() {
  const loaderData = Route.useLoaderData() as any;
  const waitlistSignups = (loaderData?.waitlistSignups || []) as WaitlistSignup[];
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSignups = waitlistSignups.filter((signup: WaitlistSignup) => {
    return (
      signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 bg-accent text-accent-foreground">Waitlist</Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Product Waitlist
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            View and manage emails collected from waitlist forms.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search email or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredSignups.length} of {waitlistSignups.length} entries
        </div>
      </div>

      <Card className="overflow-hidden border-border/80">
        <CardContent className="p-0">
          {filteredSignups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="size-10 text-muted-foreground mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-lg font-medium">No waitlist entries</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                When you enable Waitlist Mode for a product, customer signups will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Customer Email</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Signed Up</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredSignups.map((signup) => (
                    <tr key={signup.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {signup.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{signup.productName}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {formatDate(signup.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(signup.id, signup.email)}
                          className="h-8 gap-1.5"
                        >
                          {copiedId === signup.id ? (
                            <>
                              <Check className="size-3.5 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Clipboard className="size-3.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
