-- Transaction History, Disputes, Logistics schema for ProBid
-- Run with: supabase db push

-- Disputes (transaction_id = invoice id)
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'under_review', 'resolved', 'rejected')),
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Evidences (linked to dispute)
CREATE TABLE IF NOT EXISTS evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'notes')),
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}'
);

-- Audit trails (polymorphic: entity_type + entity_id)
CREATE TABLE IF NOT EXISTS audit_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('dispute', 'transaction')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Logistics
CREATE TABLE IF NOT EXISTS logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  carrier TEXT,
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'in_transit', 'delivered', 'failed')),
  milestones JSONB DEFAULT '[]',
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Settlements (payout tracking per transaction)
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  paid_at TIMESTAMPTZ,
  method TEXT DEFAULT 'stripe',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_transaction ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_disputes_initiator ON disputes(initiator_id);
CREATE INDEX IF NOT EXISTS idx_evidences_dispute ON evidences(dispute_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_entity ON audit_trails(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_logistics_transaction ON logistics(transaction_id);
CREATE INDEX IF NOT EXISTS idx_settlements_transaction ON settlements(transaction_id);

-- RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Disputes: buyer or seller of the invoice can read; buyer can insert
CREATE POLICY "Users can read disputes for own transactions" ON disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = transaction_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    )
  );

CREATE POLICY "Buyers can create disputes" ON disputes
  FOR INSERT WITH CHECK (
    initiator_id = auth.uid() AND
    EXISTS (SELECT 1 FROM invoices WHERE id = transaction_id AND buyer_id = auth.uid())
  );

CREATE POLICY "Users can update disputes for own transactions" ON disputes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = transaction_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    )
  );

-- Evidences: via dispute ownership
CREATE POLICY "Users can read evidences for own disputes" ON evidences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN invoices i ON i.id = d.transaction_id
      WHERE d.id = dispute_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert evidences for own disputes" ON evidences
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN invoices i ON i.id = d.transaction_id
      WHERE d.id = dispute_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    )
  );

-- Audit trails: via entity ownership
CREATE POLICY "Users can read audit trails for own entities" ON audit_trails
  FOR SELECT USING (
    (entity_type = 'dispute' AND EXISTS (
      SELECT 1 FROM disputes d
      JOIN invoices i ON i.id = d.transaction_id
      WHERE d.id = entity_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    )) OR
    (entity_type = 'transaction' AND EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = entity_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    ))
  );

CREATE POLICY "Users can insert audit trails for own entities" ON audit_trails
  FOR INSERT WITH CHECK (actor_id = auth.uid());

-- Logistics: via invoice ownership
CREATE POLICY "Users can read logistics for own transactions" ON logistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = transaction_id AND (i.buyer_id = auth.uid() OR i.seller_id = auth.uid())
    )
  );

-- Settlements: sellers read own
CREATE POLICY "Sellers can read own settlements" ON settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = transaction_id AND i.seller_id = auth.uid()
    )
  );
