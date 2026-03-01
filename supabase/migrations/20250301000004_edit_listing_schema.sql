-- Edit / Manage Listing schema extensions
-- Adds columns for auction scheduling, enrichment status, QA status, archived flag

-- Add optional columns to listings if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'auction_window') THEN
    ALTER TABLE listings ADD COLUMN auction_window JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category') THEN
    ALTER TABLE listings ADD COLUMN category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'identifiers') THEN
    ALTER TABLE listings ADD COLUMN identifiers JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'enrichment_status') THEN
    ALTER TABLE listings ADD COLUMN enrichment_status TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'enrichment_results') THEN
    ALTER TABLE listings ADD COLUMN enrichment_results JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'archived') THEN
    ALTER TABLE listings ADD COLUMN archived BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'qa_status') THEN
    ALTER TABLE listings ADD COLUMN qa_status TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'location') THEN
    ALTER TABLE listings ADD COLUMN location TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listing_photos' AND column_name = 'updated_at') THEN
    ALTER TABLE listing_photos ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listing_photos' AND column_name = 'qa_results') THEN
    ALTER TABLE listing_photos ADD COLUMN qa_results JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ops_notes' AND column_name = 'author_id') THEN
    ALTER TABLE ops_notes ADD COLUMN author_id UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ops_notes' AND column_name = 'status') THEN
    ALTER TABLE ops_notes ADD COLUMN status TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ops_notes' AND column_name = 'related_action') THEN
    ALTER TABLE ops_notes ADD COLUMN related_action TEXT;
  END IF;
END $$;

-- Ensure enrichment_results can link to listings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrichment_results' AND column_name = 'listing_id') THEN
    ALTER TABLE enrichment_results ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Activity log for audit trail (edits, QA runs, status changes)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_listing ON activity_log(listing_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can insert activity for own listings" ON activity_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );
CREATE POLICY "Sellers can read activity of own listings" ON activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );

-- Sellers can add ops notes to their own listings
ALTER TABLE ops_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sellers can read ops notes of own listings" ON ops_notes;
CREATE POLICY "Sellers can read ops notes of own listings" ON ops_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );
CREATE POLICY "Sellers can add ops notes to own listings" ON ops_notes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
  );
