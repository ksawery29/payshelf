import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createProductFn } from '#/lib/products.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Badge } from '#/components/ui/badge'
import {
  PackageOpen,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  CircleCheck,
} from 'lucide-react'

export const Route = createFileRoute('/_dashboard/onboarding')({
  component: OnboardingPage,
})

const TOTAL_STEPS = 3

function OnboardingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <span className="font-heading text-lg font-semibold tracking-tight">Payshelf</span>
          <div className="flex items-center gap-2">
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
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
        {step === 2 && <StepStripe onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepAddProduct />}
      </main>
    </div>
  )
}

// ── Step 1: Welcome ──────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">Step 1 of 3</Badge>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Welcome to Payshelf 👋
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Let's get your first digital product live in a few minutes. Payshelf
          uses Stripe to handle payments, so you'll need a Stripe account.
        </p>
      </div>

      <div className="grid gap-4">
        <FeatureRow
          icon={<PackageOpen className="size-5" />}
          title="List your digital products"
          description="eBooks, templates, presets, courses — anything downloadable."
        />
        <FeatureRow
          icon={<CircleCheck className="size-5" />}
          title="Stripe handles payments"
          description="Customers pay via Stripe Checkout. You collect the money directly."
        />
        <FeatureRow
          icon={<ExternalLink className="size-5" />}
          title="Magic link delivery"
          description="After purchase, customers get an email with a link to download their file."
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Don't have a Stripe account yet?{' '}
          <a
            href="https://dashboard.stripe.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Create one free →
          </a>
        </p>
        <Button className="w-full sm:w-auto" onClick={onNext}>
          I have Stripe, let's go
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
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      <div className="mt-0.5 shrink-0 text-primary">{icon}</div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ── Step 2: Stripe setup guide ───────────────────────────────────────────────

function StepStripe({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">Step 2 of 3</Badge>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Set up your Stripe product
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Payshelf stores your Stripe Product ID so it can create checkout
          sessions on the fly. Here's how to find or create one.
        </p>
      </div>

      <ol className="flex flex-col gap-5">
        <InstructionStep
          number={1}
          title="Open the Stripe Product Catalog"
          description="In your Stripe Dashboard, go to Product catalog in the left sidebar."
          action={
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4 hover:text-foreground transition-colors text-muted-foreground"
            >
              Open Stripe Products
              <ExternalLink className="size-3.5" />
            </a>
          }
        />
        <InstructionStep
          number={2}
          title='Click "Add product"'
          description="Give it a name and description. You don't need to set a price here — Payshelf handles pricing from its own database."
        />
        <InstructionStep
          number={3}
          title="Copy the Product ID"
          description="After saving, open the product. At the top you'll see an ID like prod_AbCdEf… — copy that."
          action={<CopyExample value="prod_AbCdEfGhIj1234" />}
        />
        <InstructionStep
          number={4}
          title="Paste it in the next step"
          description="You'll enter that ID when filling in your product details on Payshelf."
        />
      </ol>

      <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Tip:</strong> You can skip the Stripe
        Product ID for now and add it later. Checkout will still work — Stripe just
        won't link the purchase to a specific product in your dashboard.
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>
          Got it, add my product
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
    <li className="flex gap-4">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        {number}
      </div>
      <div className="flex flex-col gap-1 pt-0.5">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
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
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-muted transition-colors"
    >
      {value}
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  )
}

// ── Step 3: Add first product ────────────────────────────────────────────────

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
      // Hard redirect so the dashboard loader re-runs and picks up the new product
      window.location.href = '/dashboard'
    } catch {
      setError('Failed to create product. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">Step 3 of 3</Badge>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Add your first product
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Fill in the details below. You can always edit everything later from
          the dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-name">Product name *</Label>
            <Input
              id="ob-name"
              placeholder="e.g. Notion Template Pack"
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
              placeholder="What does the customer get?"
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
              placeholder="19.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ob-stripe">
              Stripe Product ID{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="ob-stripe"
              placeholder="prod_..."
              value={stripeProductId}
              onChange={(e) => setStripeProductId(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-image">
              Image URL{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="ob-image"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ob-file">
              File path{' '}
              <span className="text-muted-foreground font-normal">(optional — S3 coming soon)</span>
            </Label>
            <Input
              id="ob-file"
              placeholder="uploads/my-file.zip"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating your product…
            </span>
          ) : (
            <>
              Launch my shelf
              <ArrowRight className="size-4" data-icon="inline-end" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
