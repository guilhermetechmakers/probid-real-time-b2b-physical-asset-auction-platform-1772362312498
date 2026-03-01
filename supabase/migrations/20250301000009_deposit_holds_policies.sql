-- Additional RLS policies for deposit_events and deposit_audit_logs
-- Allows Edge Functions (running as user) to insert audit records

CREATE POLICY "Users can insert deposit events for own holds" ON deposit_events
  FOR INSERT WITH CHECK (
    actor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM deposit_holds WHERE id = deposit_id AND buyer_id = auth.uid())
  );

CREATE POLICY "Users can insert own deposit audit logs" ON deposit_audit_logs
  FOR INSERT WITH CHECK (actor_id = auth.uid());
