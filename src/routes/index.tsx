import { createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Separator } from '#/components/ui/separator'
import { PackageOpen } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

type Product = {
  id: string
  name: string
  description: string
  priceCents: number
  image: string
}

const products: Product[] = [
  {
    id: '1',
    name: 'Notion Template Pack',
    description: '12 templates for project tracking and personal planning.',
    priceCents: 1900,
    image: 'https://picsum.photos/seed/notion/600/450',
  },
  {
    id: '2',
    name: 'Lightroom Preset Bundle',
    description: '24 presets for moody, film-inspired color grading.',
    priceCents: 2400,
    image: 'https://picsum.photos/seed/presets/600/450',
  },
  {
    id: '3',
    name: 'Figma UI Kit',
    description: 'A component library for building dashboards fast.',
    priceCents: 4900,
    image: 'https://picsum.photos/seed/figma/600/450',
  },
]

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function Home() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 border-b pb-6">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            Payshelf
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            The shelf
          </h1>
        </header>

        {products.length === 0 ? (
          <EmptyShelf />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 px-5 pt-5">
        <h2 className="font-medium">{product.name}</h2>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>

      <Separator />

      <CardFooter className="flex items-center justify-between px-5 py-4">
        <Badge variant="secondary" className="font-mono text-sm">
          {formatPrice(product.priceCents)}
        </Badge>
        <Button size="sm">Buy</Button>
      </CardFooter>
    </Card>
  )
}

function EmptyShelf() {
  return (
    <Card className="flex flex-col items-center gap-4 border-dashed bg-transparent py-24 text-center shadow-none">
      <PackageOpen className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <div>
        <h2 className="text-xl font-medium">The shelf is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nothing's for sale yet. Add a product to fill it.
        </p>
      </div>
    </Card>
  )
}