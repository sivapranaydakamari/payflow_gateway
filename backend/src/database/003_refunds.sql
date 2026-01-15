CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL,
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refunds_payment
    FOREIGN KEY (payment_id)
    REFERENCES payments(id),

  CONSTRAINT fk_refunds_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id
  ON refunds(payment_id);

CREATE INDEX IF NOT EXISTS idx_refunds_status
  ON refunds(status);
