import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db'
import { purchase, product } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { ShieldX, Download } from 'lucide-react'

const getAccessFn = createServerFn({ method: 'GET' })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const results = await db
      .select({
        purchaseId: purchase.id,
        status: purchase.status,
        customerEmail: purchase.customerEmail,
        productName: product.name,
        productDescription: product.description,
        productImageUrl: product.imageUrl,
        productFilePath: product.filePath,
      })
      .from(purchase)
      .innerJoin(product, eq(purchase.productId, product.id))
      .where(eq(purchase.accessToken, data.token))
      .limit(1)

    if (results.length === 0) {
      return { found: false as const }
    }

    const row = results[0]

    if (row.status !== 'active') {
      return {
        found: true as const,
        revoked: true as const,
        reason: row.status as 'refunded' | 'disputed',
        productName: row.productName,
      }
    }

    return {
      found: true as const,
      revoked: false as const,
      productName: row.productName,
      productDescription: row.productDescription,
      productImageUrl: row.productImageUrl,
      productFilePath: row.productFilePath,
      customerEmail: row.customerEmail,
    }
  })

export const Route = createFileRoute('/access/$token')({
  loader: ({ params }) => getAccessFn({ data: { token: params.token } }),
  component: AccessPage,
})

function AccessPage() {
  const data = Route.useLoaderData()

  if (!data.found) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ShieldX className="size-10 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <h1 className="text-xl font-semibold">Link not found</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This access link is invalid or has expired.
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Back to store
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (data.revoked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ShieldX className="size-10 text-destructive" strokeWidth={1.5} />
            <div>
              <h1 className="text-xl font-semibold">Access revoked</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your access to <strong>{data.productName}</strong> has been revoked
                due to a {data.reason === 'refunded' ? 'refund' : 'payment dispute'}.
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Back to store
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg overflow-hidden py-0">
        {data.productImageUrl && (
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={data.productImageUrl}
              alt={data.productName}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              Purchased
            </Badge>
            <h1 className="text-xl font-semibold">{data.productName}</h1>
            {data.productDescription && (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.productDescription}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Purchased by <strong>{data.customerEmail}</strong>
          </p>

          {data.productFilePath && (
            <Button className="w-full">
              <Download className="size-4" data-icon="inline-start" />
              Download file
            </Button>
          )}

          {!data.productFilePath && (
            <p className="text-sm text-muted-foreground italic">
              The download file hasn't been uploaded yet. Check back soon.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
