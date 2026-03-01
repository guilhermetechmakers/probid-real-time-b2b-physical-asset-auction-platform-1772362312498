-- Help / Support tickets for Help/About page
CREATE TABLE IF NOT EXISTS help_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: allow insert from anyone (public form), read only for service role / admins
ALTER TABLE help_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON help_tickets
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON help_tickets
  FOR ALL
  USING (auth.role() = 'service_role');
