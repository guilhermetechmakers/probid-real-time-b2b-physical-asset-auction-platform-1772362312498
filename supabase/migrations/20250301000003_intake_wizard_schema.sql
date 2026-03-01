-- Intake Wizard schema for ProBid Create Listing flow
-- Note: Create storage bucket 'listing-photos' via Supabase Dashboard if not exists:
-- Storage > New bucket > listing-photos, Public
-- Drafts table: seller drafts before submission
-- Ops notes: ops team notes on listings
-- Extend listing_photos with angle column

-- Drafts table (independent of listings until submit)
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  step INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_seller ON drafts(seller_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);

-- Add angle column to listing_photos if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listing_photos' AND column_name = 'angle'
  ) THEN
    ALTER TABLE listing_photos ADD COLUMN angle TEXT;
  END IF;
END $$;

-- Ops notes for listings
CREATE TABLE IF NOT EXISTS ops_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_notes_listing ON ops_notes(listing_id);

-- Enrichment results (for async enrichment status)
CREATE TABLE IF NOT EXISTS enrichment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrichment_results_draft ON enrichment_results(draft_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_results_listing ON enrichment_results(listing_id);

-- QA results (provider-agnostic)
CREATE TABLE IF NOT EXISTS qa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_results_draft ON qa_results(draft_id);
CREATE INDEX IF NOT EXISTS idx_qa_results_listing ON qa_results(listing_id);

-- RLS for drafts
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can manage own drafts" ON drafts
  FOR ALL USING (auth.uid() = seller_id);

-- RLS for ops_notes (sellers read, ops write - simplified: sellers can read)
ALTER TABLE ops_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can read ops notes of own listings" ON ops_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- RLS for enrichment_results
ALTER TABLE enrichment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can manage enrichment for own drafts" ON enrichment_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM drafts WHERE id = draft_id AND seller_id = auth.uid())
  );
CREATE POLICY "Sellers can manage enrichment for own listings" ON enrichment_results
  FOR ALL USING (
    listing_id IS NOT NULL AND EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- RLS for qa_results
ALTER TABLE qa_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can manage qa for own drafts" ON qa_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM drafts WHERE id = draft_id AND seller_id = auth.uid())
  );
CREATE POLICY "Sellers can manage qa for own listings" ON qa_results
  FOR ALL USING (
    listing_id IS NOT NULL AND EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );
