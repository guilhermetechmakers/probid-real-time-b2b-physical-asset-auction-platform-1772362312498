-- Seller Dashboard schema for ProBid
-- Run with: supabase db push (or supabase migration up)

-- Sellers (extends auth.users via profile)
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  identifier TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'live', 'sold', 'unsold')),
  reserve_price DECIMAL(12,2),
  starting_price DECIMAL(12,2),
  current_bid DECIMAL(12,2),
  image_urls JSONB DEFAULT '[]',
  specs JSONB,
  enrichment JSONB,
  qa_results JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Listing photos
CREATE TABLE IF NOT EXISTS listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  width INT,
  height INT,
  stored_at TIMESTAMPTZ DEFAULT now()
);

-- Intakes (draft intake flow)
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  current_step INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  results_json JSONB,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enrichment results
CREATE TABLE IF NOT EXISTS enrich_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  data_json JSONB NOT NULL,
  confidence DECIMAL(3,2),
  hard_fail BOOLEAN DEFAULT false,
  warnings JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auctions
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reserve_price DECIMAL(12,2),
  current_bid DECIMAL(12,2),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bids
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  placed_at TIMESTAMPTZ DEFAULT now()
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  inspector_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sale_price DECIMAL(12,2) NOT NULL,
  sold_at TIMESTAMPTZ DEFAULT now(),
  buyer_id UUID
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  "read" BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing ON listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_intakes_listing ON intakes(listing_id);
CREATE INDEX IF NOT EXISTS idx_auctions_listing ON auctions(listing_id);
CREATE INDEX IF NOT EXISTS idx_inspections_listing ON inspections(listing_id);
CREATE INDEX IF NOT EXISTS idx_sales_listing ON sales(listing_id);
CREATE INDEX IF NOT EXISTS idx_notifications_seller ON notifications(seller_id);

-- RLS policies (sellers can only access their own data)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrich_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: sellers table - users can read/update own row
CREATE POLICY "Sellers can manage own profile" ON sellers
  FOR ALL USING (auth.uid() = id);

-- Policy: listings - sellers access own
CREATE POLICY "Sellers can manage own listings" ON listings
  FOR ALL USING (auth.uid() = seller_id);

-- Policy: listing_photos - via listing
CREATE POLICY "Sellers can manage photos of own listings" ON listing_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Policy: intakes - via listing
CREATE POLICY "Sellers can manage intakes of own listings" ON intakes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Policy: enrich_results - via listing
CREATE POLICY "Sellers can read enrich_results of own listings" ON enrich_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Policy: auctions - via listing
CREATE POLICY "Sellers can manage auctions of own listings" ON auctions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Policy: inspections - via listing
CREATE POLICY "Sellers can manage inspections of own listings" ON inspections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Policy: sales - via listing
CREATE POLICY "Sellers can read sales of own listings" ON sales
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Policy: notifications - own
CREATE POLICY "Sellers can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = seller_id);
