-- Analytics Events schema for ProBid Data & Analytics Event Logging
-- Records listing lifecycle, bids, outcomes, ops decisions from day one

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id TEXT,
  auction_id TEXT,
  listing_id TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_auction ON analytics_events(auction_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(category);

-- RLS - admin/ops/analyst can read; service role inserts
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users with admin/ops role to read (analyst uses ops for now)
CREATE POLICY "Admin ops can read analytics_events"
  ON analytics_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role_id IN ('admin', 'ops')
    )
  );

-- Inserts via service role only (Edge Functions use service role)
