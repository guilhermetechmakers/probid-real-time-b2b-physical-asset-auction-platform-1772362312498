-- Listing Detail & Bids - Allow buyers to read bids and place bids for auctions
-- Run with: supabase db push

-- Bids: anyone can read (anonymized in app), authenticated users can insert
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'Anyone can read bids') THEN
    CREATE POLICY "Anyone can read bids" ON bids FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'Authenticated users can place bids') THEN
    CREATE POLICY "Authenticated users can place bids" ON bids FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Trigger: update auction and listing current_bid when a bid is inserted
CREATE OR REPLACE FUNCTION update_current_bid_on_bid_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auctions SET current_bid = NEW.amount WHERE id = NEW.auction_id;
  UPDATE listings SET current_bid = NEW.amount
  WHERE id = (SELECT listing_id FROM auctions WHERE id = NEW.auction_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bid_insert_update_current ON bids;
CREATE TRIGGER trg_bid_insert_update_current
  AFTER INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION update_current_bid_on_bid_insert();
