# Repeat Dance Record Store — Setup Guide

## Overview

This is a full-stack Next.js app with:
- **Customer store** — browse and buy records from your Discogs inventory
- **Admin dashboard** — at `/admin`, manage orders and view inventory
- **Discogs integration** — live inventory from your Marketplace listings
- **Stripe payments** — full checkout with international support
- **Japan Post EMS shipping** — rates calculated for all countries

---

## Prerequisites

1. **Node.js 18+** — [nodejs.org](https://nodejs.org)
2. **Discogs account** with marketplace listings
3. **Stripe account** — [stripe.com](https://stripe.com) (free to create)
4. **Supabase account** — [supabase.com](https://supabase.com) (free tier)

---

## Step 1: Install dependencies

Open Terminal, navigate to this folder, and run:

```bash
npm install
```

---

## Step 2: Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `repeat-dance` (or anything)
3. Choose a strong database password
4. Once created, go to **SQL Editor** → **New Query**
5. Copy the contents of `supabase/schema.sql` and run it
6. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Set up Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create an account (or log in)
3. Go to **Developers → API keys**:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. For webhooks (needed for order confirmation):
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe-cli`
   - For **development**: run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`
   - For **production**: add webhook endpoint in Stripe Dashboard → Webhooks
     - URL: `https://your-domain.com/api/webhooks/stripe`
     - Events to listen for: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

---

## Step 4: Get your Discogs username

1. Go to [discogs.com](https://www.discogs.com)
2. Your username is in the URL when you visit your profile
3. Set it as `DISCOGS_USERNAME`
4. Your personal access token: `DISCOGS_TOKEN`

> **Security note:** Regenerate your Discogs token after setup at:
> discogs.com → Settings → Developers → New Token

---

## Step 5: Create your `.env.local` file

Create a file called `.env.local` in this folder (it's already in `.gitignore`):

```env
# Discogs
DISCOGS_TOKEN=your_token_here
DISCOGS_USERNAME=your_discogs_username

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin login (choose your own)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password_here
ADMIN_JWT_SECRET=at_least_32_random_characters_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 6: Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your store is running!

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Step 7: Replace the logo

The current logo is an SVG approximation. To use your actual logo:

1. Open your logo in Illustrator or Affinity Designer
2. Export as **SVG** (scalable) or **PNG** (simpler)
3. Save to `public/logo-black.svg` and `public/logo-white.svg`
4. Edit `src/components/Logo.tsx` to use `<Image>` with your file

---

## Deploying to Vercel (free)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add all your environment variables in Vercel's Settings → Environment Variables
4. Deploy! Vercel auto-deploys on every push
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Update your Stripe webhook endpoint to the Vercel URL

---

## How the store works

- **Inventory** is pulled live from your Discogs Marketplace listings (items marked "For Sale")
- **Prices** are set on Discogs and shown in ¥ JPY
- **Shipping** is calculated using Japan Post EMS rates based on the customer's country
- **Payment** goes through Stripe — customers pay by card
- **After payment**: the Discogs listing is automatically marked as "Sold"
- **Orders** are stored in your Supabase database

## Managing orders (Admin)

Go to `/admin` → log in with your credentials:

- **Dashboard** — overview of orders and revenue
- **Orders** — full order list with status filters
- **Order detail** — update status, add tracking number, add notes
- **Inventory** — live view of your Discogs listings

---

## Shipping rates

Rates are based on Japan Post EMS zones:
- **Zone 1** (Asia) — ¥1,400+ from 300g
- **Zone 2** (North America, Oceania, Middle East) — ¥2,000+ from 300g
- **Zone 3** (Europe) — ¥2,400+ from 300g
- **Zone 4** (South America, Africa) — ¥2,700+ from 300g

Rates are calculated per order based on the number/format of records. Verify current rates at [japanpost.jp](https://www.japanpost.jp/index-e.html).
