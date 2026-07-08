import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { CircleCheck } from 'lucide-react'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccessPage,
})

function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CircleCheck className="size-12 text-emerald-500" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold">Payment successful!</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Thank you for your purchase. Check your email for a magic link to
              access your product — you can use it anytime.
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
