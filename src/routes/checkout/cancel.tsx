import { createFileRoute } from '@tanstack/react-router'
import { BrandLockup } from '#/components/brand'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { CircleX } from 'lucide-react'

export const Route = createFileRoute('/checkout/cancel')({
  component: CheckoutCancelPage,
})

function CheckoutCancelPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <BrandLockup />
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl items-center justify-center px-4 py-10 sm:px-6"
      >
        <Card className="w-full max-w-lg bg-card/95 text-center">
          <CardContent className="flex flex-col items-center gap-5 py-12">
            <span className="flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CircleX className="size-7" strokeWidth={1.8} />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Payment cancelled
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                No charge was made. You can return to the store and start
                checkout again when you are ready.
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Back to store
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
