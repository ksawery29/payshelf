import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BrandLockup } from '#/components/brand'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { CircleX, CircleCheck } from 'lucide-react'
import { trackEventFn, submitCancelFeedbackFn, getOrCreateVisitorId } from '#/lib/events.functions'
import { getSettingsFn } from '#/lib/settings.functions'
import { Footer } from '#/components/footer'

export const Route = createFileRoute('/checkout/cancel')({
  loader: async () => {
    const settings = await getSettingsFn()
    return { settings }
  },
  component: CheckoutCancelPage,
})

type Reason = 'too_expensive' | 'just_browsing' | 'found_alternative' | 'trust' | 'other'

const REASONS: { value: Reason; label: string }[] = [
  { value: 'too_expensive', label: 'Price was too high' },
  { value: 'just_browsing', label: 'Just browsing for now' },
  { value: 'found_alternative', label: 'Found a free or cheaper alternative' },
  { value: 'trust', label: "Wasn't sure about the purchase" },
  { value: 'other', label: 'Something else' },
]

function CheckoutCancelPage() {
  const { settings } = Route.useLoaderData()
  const [stage, setStage] = useState<'form' | 'thanks'>('form')
  const [selected, setSelected] = useState<Reason | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  // Fire checkout_cancelled event once on mount
  useEffect(() => {
    const visitorId = getOrCreateVisitorId()
    void trackEventFn({ data: { event: 'checkout_cancelled', visitorId } })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    try {
      const visitorId = getOrCreateVisitorId()
      await submitCancelFeedbackFn({
        data: {
          reason: selected,
          comment: comment.trim() || undefined,
          visitorId,
        },
      })
      setStage('thanks')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      // Still show thanks — don't punish the user for a backend error
      setStage('thanks')
    } finally {
      setLoading(false)
    }
  }

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
        {stage === 'form' ? (
          <Card className="w-full max-w-md bg-card/95">
            <CardContent className="flex flex-col gap-6 py-8 px-6">
              {/* Icon + heading */}
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-13 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <CircleX className="size-7" strokeWidth={1.8} />
                </span>
                <div>
                  <h1 className="font-heading text-xl font-semibold tracking-tight">
                    Payment cancelled
                  </h1>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    No charge was made. Mind sharing why you stopped?
                  </p>
                </div>
              </div>

              {/* Reason form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <fieldset className="flex flex-col gap-2">
                  <legend className="sr-only">Reason for cancelling</legend>
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      htmlFor={`reason-${r.value}`}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                        selected === r.value
                          ? 'border-foreground bg-accent text-foreground'
                          : 'border-border/80 bg-background hover:border-border hover:bg-muted/50 text-muted-foreground',
                      ].join(' ')}
                    >
                      <input
                        id={`reason-${r.value}`}
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={selected === r.value}
                        onChange={() => setSelected(r.value)}
                        className="sr-only"
                      />
                      <span
                        className={[
                          'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                          selected === r.value
                            ? 'border-foreground bg-foreground'
                            : 'border-border/80 bg-background',
                        ].join(' ')}
                      >
                        {selected === r.value && (
                          <span className="size-1.5 rounded-full bg-background" />
                        )}
                      </span>
                      {r.label}
                    </label>
                  ))}
                </fieldset>

                {/* Optional comment — only visible once a reason is picked */}
                {selected && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cancel-comment">
                      Anything else? <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="cancel-comment"
                      placeholder="A sentence is fine"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={280}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <Button type="submit" disabled={!selected || loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending
                      </span>
                    ) : (
                      'Send feedback'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => (window.location.href = '/')}
                    className="text-muted-foreground"
                  >
                    Skip — back to store
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => (window.location.href = '/support')}
                    className="text-muted-foreground/80 text-xs h-auto py-1"
                  >
                    Need help? Contact customer support
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md bg-card/95 text-center">
            <CardContent className="flex flex-col items-center gap-5 py-12">
              <span className="flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <CircleCheck className="size-7 text-emerald-600" strokeWidth={1.8} />
              </span>
              <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                  Thanks for the feedback
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  It helps improve the store. Come back whenever you're ready.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => (window.location.href = '/')}>
                  Back to store
                </Button>
                <Button variant="ghost" onClick={() => (window.location.href = '/support')}>
                  Contact support
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer shopName={settings.shopName} />
    </div>
  )
}
