# Payshelf

A minimal, self-hosted digital storefront. Sell digital products (eBooks, templates, presets, courses) via Stripe Checkout. Buyers receive a magic-link email to download their purchase. Access is revoked automatically on refund or dispute.

Built with [TanStack Start](https://tanstack.com/start), [Better Auth](https://www.better-auth.com/), [Drizzle ORM](https://orm.drizzle.team/), [Turso](https://turso.tech/), [Stripe](https://stripe.com/), and [Resend](https://resend.com/).

---

## Features

- 🛒 **Public storefront** — product grid with Stripe Checkout
- 🔐 **Single-admin dashboard** — protected by Better Auth; first user to sign up owns the store
- 📦 **Product management** — create, edit, and delete products with Stripe Product ID linking
- 📊 **Analytics** — total revenue, weekly/monthly sales, 30-day revenue chart
- 📧 **Magic link delivery** — purchase confirmation email with a one-click download link
- 🔁 **Automated access revocation** — webhook revokes access on refund or dispute
- ⚙️ **Shop settings** — customize store name, tagline, and sender email from the dashboard
- 🧭 **Onboarding flow** — step-by-step guide for new admins

---

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React, SSR) |
| Auth | Better Auth |
| Database | Turso (LibSQL / SQLite) |
| ORM | Drizzle ORM |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend |
| Deployment | Vercel |
| Styling | Tailwind CSS v4 + shadcn/ui |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/payshelf.git
cd payshelf
bun install
```

### 2. Create a Turso database

```bash
# Install the Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

turso auth login
turso db create payshelf
turso db show payshelf           # note the URL
turso db tokens create payshelf  # note the auth token
```

### 3. Configure environment variables

Copy and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Your Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso database auth token |
| `BETTER_AUTH_SECRET` | Long random secret — run `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your app's public URL (e.g. `https://payshelf.vercel.app`) |
| `STRIPE_SECRET_KEY` | Stripe secret key from the Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (see step 6) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender address (e.g. `Store <hello@yourdomain.com>`) |
| `APP_URL` | Your app's public URL — used in magic-link emails |

### 4. Push the database schema

```bash
bunx drizzle-kit push
```

This creates all tables in your Turso database.

### 5. Run locally

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Navigate to `/setup` to create your admin account, then follow the onboarding flow.

### 6. Set up the Stripe webhook

**Locally (for testing)** — install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret printed by the CLI and set it as `STRIPE_WEBHOOK_SECRET`.

**In production:**

1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**
2. Set the URL to `https://your-app.vercel.app/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET`

### 7. Deploy to Vercel

Connect your GitHub repo at [vercel.com/new](https://vercel.com/new) and add all environment variables in **Settings → Environment Variables**.

Or via CLI:

```bash
npx vercel
```

---

## Environment variables reference

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Auth (Better Auth)
BETTER_AUTH_SECRET=your-long-random-secret
BETTER_AUTH_URL=https://your-app.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Your Store <hello@yourdomain.com>

# App
APP_URL=https://your-app.vercel.app
```

---

## Usage

1. Sign up at `/setup` (only works once — redirects to `/login` after)
2. Complete onboarding to add your first product and link a Stripe Product ID
3. Customers visit `/` to browse and purchase
4. After payment they receive a magic-link email to download their file
5. Manage products, view analytics, and update branding from `/dashboard` and `/settings`

---

## License

MIT © Ksawery
