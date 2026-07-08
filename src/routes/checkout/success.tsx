import { createFileRoute } from '@tanstack/react-router'
import { BrandLockup } from '#/components/brand'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { CircleCheck, MailCheck } from 'lucide-react'
import { getSettingsFn } from '#/lib/settings.functions'
import { Footer } from '#/components/footer'

export const Route = createFileRoute('/checkout/success')({
  loader: async () => {
    const settings = await getSettingsFn()
    return { settings }
  },
  component: CheckoutSuccessPage,
})

function CheckoutSuccessPage() {
  const { settings } = Route.useLoaderData()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <BrandLockup shopName={settings.shopName} />
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto flex flex-1 w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6"
      >
        <Card className="w-full max-w-lg bg-card/95 text-center">
          <CardContent className="flex flex-col items-center gap-5 py-12">
            <span className="flex size-14 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CircleCheck className="size-7" strokeWidth={1.8} />
            </span>
            <div>
              <Badge className="mb-3 bg-accent text-accent-foreground">
                Payment received
              </Badge>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                You're all set 🎉
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Check your email for a secure access link. You can use it
                anytime to download your product.
              </p>
            </div>
            <div className="flex w-full items-center gap-3 rounded-lg border border-border/80 bg-background/70 p-3 text-left">
              <MailCheck className="size-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-muted-foreground">
                Delivery can take a minute if your inbox is filtering new mail.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Back to store
              </Button>
              <Button variant="ghost" onClick={() => (window.location.href = '/support')}>
                Customer support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer shopName={settings.shopName} />
    </div>
  )
}
