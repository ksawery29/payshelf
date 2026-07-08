import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createProductFn } from '#/lib/products.functions'
import { BrandLockup } from '#/components/brand'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Badge } from '#/components/ui/badge'
import {
  ArrowRight,
  Check,
  CircleCheck,
  Copy,
  ExternalLink,
  PackageOpen,
  PanelsTopLeft,
  WalletCards,
} from 'lucide-react'

export const Route = createFileRoute('/_dashboard/onboarding')({
  component: OnboardingPage,
})

const TOTAL_STEPS = 3

function OnboardingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <BrandLockup />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Step {step} of {TOTAL_STEPS}
            </span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                    i + 1 <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-2">
              {[
                'Basics',
                'Stripe setup',
                'First product',
              ].map((label, index) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    index + 1 === step
                      ? 'bg-card font-medium text-foreground shadow-[0_12px_32px_-30px_rgba(15,23,42,0.6)]'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-md text-xs ${
                      index + 1 < step
                        ? 'bg-accent text-accent-foreground'
                        : index + 1 === step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1 < step ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </aside>

          <section className="app-surface animate-in fade-in-0 slide-in-from-bottom-3 p-5 duration-500 sm:p-8">
            {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
            {step === 2 && (
              <StepStripe onNext={() => setStep(3)} onBack={() => setStep(1)} />
            )}
            {step === 3 && <StepAddProduct />}
          </section>
        </div>
      </main>
    </div>
  )
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Badge className="w-fit bg-accent text-accent-foreground">Step 1 of 3</Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em]">
          Welcome to Payshelf 👋
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Get a first product live in a few minutes. Payshelf uses Stripe
          Checkout for payment and sends buyers an access link after purchase.
        </p>
      </div>

      <div className="grid gap-3">
        <FeatureRow
          icon={<PackageOpen className="size-5" />}
          title="List digital products"
          description="Templates, downloads, presets, courses, or anything else delivered as a file."
        />
        <FeatureRow
          icon={<WalletCards className="size-5" />}
          title="Let Stripe handle payment"
          description="Customers pay through Stripe Checkout while revenue lands in your own Stripe account."
        />
        <FeatureRow
          icon={<PanelsTopLeft className="size-5" />}
          title="Send access automatically"
          description="After purchase, customers receive an email with a secure link to their file."
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="https://dashboard.stripe.com/register"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Create a Stripe account
        </a>
        <Button onClick={onNext}>
          I have Stripe
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-border/80 bg-background/70 p-4">
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

function StepStripe({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Badge className="w-fit bg-accent text-accent-foreground">Step 2 of 3</Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em]">
          Set up your Stripe product
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Payshelf stores your Stripe Product ID so checkout sessions can be
          created on demand.
        </p>
      </div>

      <ol className="grid gap-3">
        <InstructionStep
          number={1}
          title="Open the Stripe product catalog"
          description="In your Stripe Dashboard, go to Product catalog in the left sidebar."
          action={
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Open Stripe Products
              <ExternalLink className="size-3.5" />
            </a>
          }
        />
        <InstructionStep
          number={2}
          title="Click Add product"
          description="Give it a name and description. Payshelf keeps pricing in its own product record."
        />
        <InstructionStep
          number={3}
          title="Copy the Product ID"
          description="After saving, open the product. At the top you will see an ID like prod_AbCdEf."
          action={<CopyExample value="prod_AbCdEfGhIj1234" />}
        />
        <InstructionStep
          number={4}
          title="Paste it in Payshelf"
          description="You can add the ID in the next step or come back and edit it later."
        />
      </ol>

      <div className="rounded-lg border border-border/80 bg-accent/60 p-4 text-sm leading-6 text-accent-foreground">
        <strong>Tip:</strong> You can skip the Stripe Product ID for now.
        Checkout still works, but the purchase will not be linked to a specific
        Stripe product in your dashboard.
      </div>

      <div className="flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>
          Add my product
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

function InstructionStep({
  number,
  title,
  description,
  action,
}: {
  number: number
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <li className="grid gap-4 rounded-lg border border-border/80 bg-background/70 p-4 sm:grid-cols-[2rem_minmax(0,1fr)]">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {action && <div className="mt-1">{action}</div>}
      </div>
    </li>
  )
}

function CopyExample({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted"
    >
      {value}
      {copied ? (
        <Check className="size-3 text-emerald-600" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  )
}

function StepAddProduct() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [filePath, setFilePath] = useState('')
  const [stripeProductId, setStripeProductId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const priceCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Enter a valid price.')
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
      window.location.href = '/dashboard'
    } catch {
      setError('We could not create the product. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Badge className="w-fit bg-accent text-accent-foreground">Step 3 of 3</Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em]">
          Add your first product
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Add storefront copy, pricing, and delivery details. You can edit all
          fields from the dashboard later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-name">Product name *</Label>
            <Input
              id="ob-name"
              placeholder="Creator Finance Toolkit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-description">Description</Label>
            <Input
              id="ob-description"
              placeholder="What customers receive after purchase"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ob-price">Price (USD) *</Label>
            <Input
              id="ob-price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="49.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ob-stripe">Stripe Product ID</Label>
            <Input
              id="ob-stripe"
              placeholder="prod_..."
              value={stripeProductId}
              onChange={(e) => setStripeProductId(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-image">Image URL</Label>
            <Input
              id="ob-image"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-file">File path</Label>
            <Input
              id="ob-file"
              placeholder="uploads/product-file.zip"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-border/80 pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating product
              </span>
            ) : (
              <>
                Launch my shelf
                <CircleCheck className="size-4" data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
