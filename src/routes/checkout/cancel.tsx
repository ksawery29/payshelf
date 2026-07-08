import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { CircleX } from 'lucide-react'

export const Route = createFileRoute('/checkout/cancel')({
  component: CheckoutCancelPage,
})

function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CircleX className="size-12 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold">Payment cancelled</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Your payment was not completed. No charges were made.
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
