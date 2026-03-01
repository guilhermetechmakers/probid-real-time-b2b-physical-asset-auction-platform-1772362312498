-- Admin User Management - user_bans, user_restrictions
-- Extends existing auth.users, user_profiles, buyers, sellers, subscriptions, kyc_records, audit_logs

-- User bans (admin-enforced)
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

-- User restrictions (temporary limits)
CREATE TABLE IF NOT EXISTS user_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reasons JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extend audit_logs for user entity (target_type = 'user', target_id = user_id)
-- Existing audit_logs table already supports this

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(active);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_user ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_active ON user_restrictions(active);

-- RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;

-- Admin/ops access via service role; no direct client policies for bans/restrictions
CREATE POLICY "Service role full access user_bans" ON user_bans
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access user_restrictions" ON user_restrictions
  FOR ALL USING (auth.role() = 'service_role');
