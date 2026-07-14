import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { getSettingsFn } from '#/lib/settings.functions';
import { listOrdersFn, updateOrderStatusFn } from '#/lib/orders.functions';
import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#/components/ui/card';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { ShoppingBag, Search, MoreHorizontal, ArrowLeftRight, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/_dashboard/dashboard/orders')({
  loader: async () => {
    const [settings, orders] = await Promise.all([
      getSettingsFn(),
      listOrdersFn(),
    ]);
    return { settings, initialOrders: orders };
  },
  component: OrdersPage,
});

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

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

function OrdersPage() {
  const { initialOrders } = Route.useLoaderData();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'refunded' | 'disputed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'refunded' | 'disputed') => {
    setUpdatingId(id);
    try {
      await updateOrderStatusFn({ data: { id, status: newStatus } });
      router.invalidate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch =
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.stripeSessionId && order.stripeSessionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 bg-accent text-accent-foreground">Order management</Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Orders & Transactions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor and manage customer purchases, refunds, and order status.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search email, product, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'refunded', 'disputed'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className="capitalize"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            A history of all storefront sales transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-4">
                <ShoppingBag className="size-7" />
              </span>
              <h3 className="font-semibold text-lg">No orders found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Orders will show up here once customers buy your products.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID & Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredOrders.map((order) => {
                    const isUpdating = updatingId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground max-w-[180px] truncate" title={order.id}>
                            {order.id}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {order.customerEmail}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {order.productName}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {formatPrice(order.productPriceCents)}
                        </td>
                        <td className="px-6 py-4">
                          {order.status === 'active' && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20">
                              Active
                            </Badge>
                          )}
                          {order.status === 'refunded' && (
                            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-amber-500/20">
                              Refunded
                            </Badge>
                          )}
                          {order.status === 'disputed' && (
                            <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-red-500/20">
                              Disputed
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.status !== 'refunded' && order.status !== 'disputed' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  disabled={isUpdating}
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                {order.status !== 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(order.id, 'active')}
                                    className="gap-2"
                                  >
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    <span>Mark Active</span>
                                  </DropdownMenuItem>
                                )}
                                {order.status !== 'refunded' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(order.id, 'refunded')}
                                    className="gap-2"
                                  >
                                    <RotateCcw className="size-4 text-amber-500" />
                                    <span>Refund Order</span>
                                  </DropdownMenuItem>
                                )}
                                {order.status !== 'disputed' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(order.id, 'disputed')}
                                    className="gap-2"
                                  >
                                    <AlertTriangle className="size-4 text-red-500" />
                                    <span>Mark Disputed</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
