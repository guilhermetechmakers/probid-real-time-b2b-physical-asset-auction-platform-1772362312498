-- Admin User Management - bans, restrictions, audit enhancements
-- Run with: supabase db push

-- Bans (user-level enforcement)
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Restrictions (temporary limits: bidding, listing, etc.)
CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bidding', 'listing', 'withdrawal', 'custom')),
  active BOOLEAN NOT NULL DEFAULT true,
  reasons TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add details_hash and immutable to audit_logs for compliance (if columns don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'details_hash') THEN
    ALTER TABLE audit_logs ADD COLUMN details_hash TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'immutable') THEN
    ALTER TABLE audit_logs ADD COLUMN immutable BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
    ALTER TABLE audit_logs ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(active);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_user ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_active ON user_restrictions(active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- RLS: Only service role (Edge Functions) can access; no permissive policies for anon/authenticated
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;
