-- ─────────────────────────────────────────────────────────────────────────────
-- Repeat Dance Record Store — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Orders ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Customer
  customer_email           TEXT NOT NULL DEFAULT '',
  customer_name            TEXT NOT NULL,

  -- Shipping destination
  shipping_address         JSONB NOT NULL,
  -- Shape: { name, line1, line2?, city, state?, postal_code, country, country_name, phone? }

  -- Items purchased
  items                    JSONB NOT NULL,
  -- Shape: [{ listingId, releaseId, title, artist, price, condition, sleeveCondition, imageUrl, format }]

  -- Pricing (JPY — no decimal)
  subtotal                 INTEGER NOT NULL,
  shipping_cost            INTEGER NOT NULL,
  total                    INTEGER NOT NULL,

  -- Payment
  stripe_session_id        TEXT UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Fulfillment
  status                   TEXT NOT NULL DEFAULT 'pending_payment'
                           CHECK (status IN (
                             'pending_payment',
                             'paid',
                             'processing',
                             'shipped',
                             'delivered',
                             'cancelled',
                             'refunded'
                           )),
  tracking_number          TEXT,
  carrier                  TEXT,
  notes                    TEXT
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS orders_status_idx         ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx     ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_stripe_session_idx ON orders (stripe_session_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Only allow the service_role key to read/write orders (admin operations)
-- The anon key cannot access order data directly from the client

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Deny all public access (orders are only accessed via server-side API routes)
CREATE POLICY "No public access" ON orders
  FOR ALL TO anon USING (false);

-- Service role bypasses RLS by default
