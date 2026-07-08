# Payshelf

A minimal, self-hosted digital storefront. Sell digital products (eBooks, templates, presets, courses) via Stripe Checkout. Buyers receive a magic-link email to download their purchase. Access is revoked automatically on refund or dispute.

Built with [TanStack Start](https://tanstack.com/start), [Better Auth](https://www.better-auth.com/), [Drizzle ORM](https://orm.drizzle.team/), [Turso](https://turso.tech/), [Stripe](https://stripe.com/), and [Resend](https://resend.com/).

---

## Features

- 🛒 **Public storefront** — product grid with Stripe Checkout
- 🔐 **Single-admin dashboard** — protected by Better Auth; first user to sign up owns the store
- 📦 **Product management** — create, edit, and delete products with Stripe Product ID linking
- 🖼️ **Vercel Blob uploads** — drag-and-drop image and file upload from the dashboard (public images, private download files)
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
| File storage | Vercel Blob (public images + private downloads) |
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

<details>
<summary><strong>Option A — CLI</strong></summary>

Install the [Turso CLI](https://docs.turso.tech/cli/introduction):

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

Log in and create a database:

```bash
turso auth login
turso db create payshelf
```

Get your connection details:

```bash
turso db show payshelf           # copy the URL (libsql://...)
turso db tokens create payshelf  # copy the auth token
```

</details>

<details>
<summary><strong>Option B — Dashboard</strong></summary>

1. Go to [turso.tech](https://turso.tech/) and sign up (free tier is fine)
2. Click **Create Database** → name it `payshelf` → pick the closest region → **Create**
3. On the database page, click **Connect** or **Get connection string** — copy the `libsql://...` URL
4. Under **Tokens** (or in the connect modal), click **Generate Token** — copy it

You now have `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

</details>

### 3. Get a Stripe API key

<details>
<summary><strong>Option A — CLI</strong></summary>

If you have the [Stripe CLI](https://stripe.com/docs/stripe-cli) installed:

```bash
stripe login
```

Then find your secret key:

```bash
stripe config --list   # look for "test_mode_api_key"
```

Or just grab it from the dashboard (see Option B).

</details>

<details>
<summary><strong>Option B — Dashboard</strong></summary>

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com/) and sign in (or create a free account)
2. Make sure **Test mode** is toggled on (top-right switch)
3. Go to **Developers → API keys**
4. Copy the **Secret key** (starts with `sk_test_...`)

That's your `STRIPE_SECRET_KEY`.

</details>

### 4. Get a Resend API key

<details>
<summary><strong>Dashboard setup</strong></summary>

1. Go to [resend.com](https://resend.com/) and sign up
2. Go to **API Keys** → **Create API Key** → name it `payshelf` → **Create**
3. Copy the key (starts with `re_...`) — that's your `RESEND_API_KEY`
4. *(Optional)* Go to **Domains** → **Add Domain** → follow the DNS steps to send from your own address. Until then, use the default `onboarding@resend.dev`

</details>

### 5. Create Vercel Blob stores

Payshelf uses **two separate Blob stores** — one for public product images and one for private download files.

<details>
<summary><strong>Option A — Vercel Dashboard (recommended)</strong></summary>

1. Go to your [Vercel dashboard](https://vercel.com/dashboard) → open your project (or create it first via `npx vercel`)
2. Click **Storage** in the top nav → **Create Database** → select **Blob**
3. Name it `payshelf-public` → click **Create**
4. Once created, go to the store page → **Settings** → copy the **`PUBLIC_BLOB_READ_WRITE_TOKEN`** token (the env var name matches this prefix automatically if you use the Vercel CLI link)
5. Repeat steps 2–4 to create a second store named `payshelf-private`, using the token as `PRIVATE_BLOB_READ_WRITE_TOKEN`

</details>

<details>
<summary><strong>Option B — Vercel CLI</strong></summary>

```bash
# Link your project first if you haven't
npx vercel link

# Create both stores (answer the prompts)
npx vercel blob create payshelf-public
npx vercel blob create payshelf-private
```

Then pull the generated env vars:

```bash
npx vercel env pull .env.local
```

Rename the pulled tokens in `.env.local` to match the names Payshelf expects:
- `BLOB_READ_WRITE_TOKEN` (from the first store) → `PUBLIC_BLOB_READ_WRITE_TOKEN`
- `BLOB_READ_WRITE_TOKEN` (from the second store) → `PRIVATE_BLOB_READ_WRITE_TOKEN`

</details>

### 6. Configure environment variables

Create your `.env.local`:

```bash
cp .env.example .env.local
```

Fill it in with the values from the previous steps:

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Auth (Better Auth)
BETTER_AUTH_SECRET=your-long-random-secret
BETTER_AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=My Store <onboarding@resend.dev>

# Vercel Blob — public store (product images)
PUBLIC_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Vercel Blob — private store (download files)
PRIVATE_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# App
APP_URL=http://localhost:3000
```

> **Tip:** Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.
> You'll set `STRIPE_WEBHOOK_SECRET` in step 8 below.

### 7. Push the database schema

```bash
bunx drizzle-kit push
```

This creates the tables in your local or remote Turso database. 

> **Vercel Automatic Deployments:** You don't need to manually run this in production! The database schema sync is automatically run on every Vercel build using the environment variables you configure in the dashboard.

### 8. Set up the Stripe webhook

<details>
<summary><strong>Option A — CLI (recommended for local dev)</strong></summary>

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a signing secret like `whsec_...` — copy it and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

Keep this terminal running while you develop.

</details>

<details>
<summary><strong>Option B — Dashboard (for production)</strong></summary>

1. Go to **[Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)**
2. Click **Add endpoint**
3. Set the **Endpoint URL** to `https://your-app.vercel.app/api/stripe/webhook`
4. Under **Select events to listen to**, click **Select events** and add:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Click **Add endpoint**
6. On the endpoint page, click **Reveal** under **Signing secret** — copy it
7. Add it as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables

</details>

### 9. Run locally

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Navigate to `/setup` to create your admin account, then follow the onboarding flow.

### 10. Deploy to Vercel

<details>
<summary><strong>Option A — CLI</strong></summary>

```bash
npx vercel
```

Then add environment variables:

```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
# ... repeat for all variables
```

Or just paste them all in the Vercel dashboard (see Option B).

</details>

<details>
<summary><strong>Option B — Dashboard</strong></summary>

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click **Import** next to your `payshelf` repo
4. Before deploying, go to **Settings → Environment Variables**
5. Add each variable from your `.env.local` (swap `localhost:3000` for your Vercel URL in `BETTER_AUTH_URL` and `APP_URL`)
6. Go to **Storage** → link both `payshelf-public` and `payshelf-private` Blob stores to your project — Vercel will inject the tokens automatically. Make sure you rename them to `PUBLIC_BLOB_READ_WRITE_TOKEN` and `PRIVATE_BLOB_READ_WRITE_TOKEN` in the env var settings.
7. Click **Deploy**

After deploying, update `BETTER_AUTH_URL` and `APP_URL` to your production URL (e.g. `https://payshelf.vercel.app`).

</details>

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
