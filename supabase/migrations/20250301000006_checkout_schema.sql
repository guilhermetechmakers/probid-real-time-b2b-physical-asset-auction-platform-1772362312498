-- Checkout / Payment schema for ProBid
-- Run with: supabase db push

-- Payout instructions (seller bank details for Stripe Connect)
CREATE TABLE IF NOT EXISTS payout_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  bank_account_id TEXT,
  routing_number TEXT,
  instructions_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices (post-auction checkout)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'COMPLETE')),
  due_date TIMESTAMPTZ NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  fees DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(12,2) DEFAULT 0,
  payout_instructions_id UUID REFERENCES payout_instructions(id),
  invoice_pdf_url TEXT,
  receipt_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments (Stripe PaymentIntent records)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'requires_payment_method' CHECK (status IN ('succeeded', 'requires_payment_method', 'requires_action', 'failed')),
  method_id TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deposits (hold/capture flow)
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'CAPTURED')),
  hold_until TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payouts (seller payouts via Stripe)
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  payout_method TEXT DEFAULT 'stripe',
  stripe_payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhooks log (Stripe webhook audit)
CREATE TABLE IF NOT EXISTS webhooks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (status IN ('PROCESSED', 'ERROR')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_auction ON invoices(auction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer ON invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_deposits_invoice ON deposits(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payouts_seller ON payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_instructions_seller ON payout_instructions(seller_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_event ON webhooks_log(event_id);

-- RLS
ALTER TABLE payout_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks_log ENABLE ROW LEVEL SECURITY;

-- Payout instructions: sellers manage own
CREATE POLICY "Sellers can manage own payout instructions" ON payout_instructions
  FOR ALL USING (auth.uid() = seller_id);

-- Invoices: buyers can read/update own; sellers can read own
CREATE POLICY "Buyers can read own invoices" ON invoices
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can read own invoices" ON invoices
  FOR SELECT USING (auth.uid() = seller_id);

-- Payments: via invoice ownership
CREATE POLICY "Buyers can read own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND buyer_id = auth.uid())
  );

-- Deposits: via invoice ownership
CREATE POLICY "Buyers can read own deposits" ON deposits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND buyer_id = auth.uid())
  );

-- Payouts: sellers read own
CREATE POLICY "Sellers can read own payouts" ON payouts
  FOR SELECT USING (auth.uid() = seller_id);

-- Webhooks: service role only (no direct user access; admin via service)
-- No user policy - webhooks_log is backend-only
