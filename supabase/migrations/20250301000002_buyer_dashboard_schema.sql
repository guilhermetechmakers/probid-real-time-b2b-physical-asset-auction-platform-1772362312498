-- Buyer Dashboard schema for ProBid
-- Run with: supabase db push (or supabase migration up)

-- Buyers (extends auth.users via profile)
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'submitted', 'approved', 'rejected')),
  admin_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (Stripe-based)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Note: buyers.subscription_id references subscriptions.id (optional FK omitted to avoid circular dependency)

-- Watchlists (buyer saved listings)
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  alert_enabled BOOLEAN DEFAULT false,
  alert_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, listing_id)
);

-- Saved filters (buyer filter presets)
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KYC records (verification submissions)
CREATE TABLE IF NOT EXISTS kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  admin_review_status TEXT DEFAULT 'pending' CHECK (admin_review_status IN ('pending', 'approved', 'rejected')),
  evidence JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add bidder_id FK to bids if not exists (bids references auth users; buyer_id in context = user_id)
-- Bids table already has bidder_id; we use it for buyer bidding history

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buyers_user ON buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_buyer ON subscriptions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_buyer ON watchlists(buyer_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_listing ON watchlists(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_buyer ON saved_filters(buyer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_buyer ON kyc_records(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);

-- RLS
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;

-- Buyers: users can manage own profile
CREATE POLICY "Buyers can manage own profile" ON buyers
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: buyers access own
CREATE POLICY "Buyers can read own subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM buyers WHERE id = buyer_id AND user_id = auth.uid())
  );

-- Watchlists: buyers manage own
CREATE POLICY "Buyers can manage own watchlist" ON watchlists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM buyers WHERE id = buyer_id AND user_id = auth.uid())
  );

-- Saved filters: buyers manage own
CREATE POLICY "Buyers can manage own saved filters" ON saved_filters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM buyers WHERE id = buyer_id AND user_id = auth.uid())
  );

-- KYC records: buyers manage own (submit/read)
CREATE POLICY "Buyers can manage own kyc records" ON kyc_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM buyers WHERE id = buyer_id AND user_id = auth.uid())
  );

-- Allow buyers to read auctions (public/scheduled/live)
CREATE POLICY "Anyone can read auctions" ON auctions
  FOR SELECT USING (true);

-- Allow buyers to read listings (for auction cards)
CREATE POLICY "Anyone can read listings" ON listings
  FOR SELECT USING (true);
