ALTER TABLE payments
ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS captured BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL,
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,

  CONSTRAINT fk_refunds_payment
    FOREIGN KEY (payment_id)
    REFERENCES payments(id),

  CONSTRAINT fk_refunds_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id
  ON refunds(payment_id);


CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  response_code INTEGER,
  response_body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_webhook_logs_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_merchant_id
  ON webhook_logs(merchant_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_status
  ON webhook_logs(status);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_next_retry
  ON webhook_logs(next_retry_at)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  merchant_id UUID NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,

  CONSTRAINT fk_idempotency_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
);

ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(64);
