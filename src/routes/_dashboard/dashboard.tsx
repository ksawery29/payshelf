import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { listProductsFn, createProductFn } from '#/lib/products.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent, CardFooter } from '#/components/ui/card'
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
import { PackageOpen, Plus } from 'lucide-react'

export const Route = createFileRoute('/_dashboard/dashboard')({
  loader: () => listProductsFn(),
  component: DashboardPage,
})

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function DashboardPage() {
  const { data: session } = authClient.useSession()
  const products = Route.useLoaderData()
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
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
                    onSuccess: () => {
                      window.location.href = '/login'
                    },
                  },
                })
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Products
          </h2>
          <CreateProductDialog
            onCreated={() => router.invalidate()}
          />
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
                  <h3 className="font-medium">{product.name}</h3>
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
      </main>
    </div>
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
    setName('')
    setDescription('')
    setPrice('')
    setImageUrl('')
    setFilePath('')
    setStripeProductId('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const priceCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Enter a valid price')
      return
    }

    setLoading(true)

    try {
      await createProductFn({
        data: {
          name,
          description,
          priceCents,
          imageUrl: imageUrl || undefined,
          filePath: filePath || undefined,
          stripeProductId: stripeProductId || undefined,
        },
      })

      resetForm()
      setOpen(false)
      onCreated()
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
          <DialogDescription>
            Add a digital product to your shelf.
          </DialogDescription>
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
              <Input
                id="product-name"
                placeholder="e.g. Notion Template Pack"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Input
                id="product-description"
                placeholder="A short description of the product"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (USD) *</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="19.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image">Image URL</Label>
              <Input
                id="product-image"
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-file">File path</Label>
              <Input
                id="product-file"
                placeholder="uploads/my-file.zip"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stripe">Stripe Product ID</Label>
              <Input
                id="product-stripe"
                placeholder="prod_..."
                value={stripeProductId}
                onChange={(e) => setStripeProductId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating…
                </span>
              ) : (
                'Create product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
