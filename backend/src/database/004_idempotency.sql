CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  merchant_id UUID NOT NULL,
  request_path TEXT NOT NULL,
  request_body JSONB NOT NULL,
  response_body JSONB,
  status_code INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
