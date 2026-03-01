-- Admin Dashboard schema - disputes, roles, users_roles
-- Run with: supabase db push

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_entity_type TEXT NOT NULL,
  related_entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'escalated')),
  case_notes TEXT,
  evidence_links TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users-Roles mapping
CREATE TABLE IF NOT EXISTS users_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Seed default roles
INSERT INTO roles (id, name, permissions) VALUES
  ('admin', 'Admin', '["*"]'::jsonb),
  ('ops', 'Ops', '["listings:approve","buyers:approve","auctions:manage","disputes:resolve","audit:read"]'::jsonb),
  ('seller', 'Seller', '["listings:manage","auctions:view"]'::jsonb),
  ('buyer', 'Buyer', '["auctions:bid","watchlist:manage"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_entity ON disputes(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_users_roles_user ON users_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_roles_role ON users_roles(role_id);

-- RLS - admin/ops access via service role or policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_roles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated for now; admin check in Edge Functions
CREATE POLICY "Authenticated can read disputes" ON disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read users_roles" ON users_roles FOR SELECT TO authenticated USING (true);
