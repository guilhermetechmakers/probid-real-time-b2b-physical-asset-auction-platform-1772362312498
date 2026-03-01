-- Cart / Deposits - Pre-bidding deposit holds schema for ProBid
-- Run with: supabase db push

-- Deposit holds (pre-bidding; separate from checkout deposits)
CREATE TABLE IF NOT EXISTS deposit_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'holding' CHECK (status IN ('holding', 'captured', 'released', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  payment_method_id TEXT,
  stripe_payment_intent_id TEXT,
  hold_type TEXT NOT NULL DEFAULT 'deposit',
  release_rule JSONB DEFAULT '{}',
  notes TEXT,
  captured_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);

-- Deposit events (audit trail)
CREATE TABLE IF NOT EXISTS deposit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES deposit_holds(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  actor_id UUID
);

-- Audit logs for deposit actions
CREATE TABLE IF NOT EXISTS deposit_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  deposit_id UUID REFERENCES deposit_holds(id) ON DELETE SET NULL,
  actor_id UUID,
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deposit_holds_buyer ON deposit_holds(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deposit_holds_status ON deposit_holds(status);
CREATE INDEX IF NOT EXISTS idx_deposit_holds_expires ON deposit_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_deposit_holds_auction ON deposit_holds(auction_id);
CREATE INDEX IF NOT EXISTS idx_deposit_events_deposit ON deposit_events(deposit_id);
CREATE INDEX IF NOT EXISTS idx_deposit_audit_deposit ON deposit_audit_logs(deposit_id);

-- RLS
ALTER TABLE deposit_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_audit_logs ENABLE ROW LEVEL SECURITY;

-- Buyers can read/write own deposit holds
CREATE POLICY "Buyers can manage own deposit holds" ON deposit_holds
  FOR ALL USING (auth.uid() = buyer_id);

-- Deposit events: read via deposit ownership
CREATE POLICY "Buyers can read own deposit events" ON deposit_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM deposit_holds WHERE id = deposit_id AND buyer_id = auth.uid())
  );

-- Audit logs: backend/service only (no direct user policy)
-- Edge functions use service role for writes
