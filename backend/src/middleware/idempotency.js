const db = require("../config/db");

const idempotency = async (req, res, next) => {
  const key = req.header("Idempotency-Key");
  if (!key) return next();

  const merchantId = req.merchant.id;

  const existing = await db.query(
    `
    SELECT response
    FROM idempotency_keys
    WHERE key = $1 AND merchant_id = $2
      AND expires_at > NOW()
    `,
    [key, merchantId]
  );

  if (existing.rows.length > 0) {
    return res.status(200).json(existing.rows[0].response);
  }

  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    await db.query(
      `
      INSERT INTO idempotency_keys
      (key, merchant_id, response, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
      ON CONFLICT (key) DO NOTHING
      `,
      [key, merchantId, body]
    );

    return originalJson(body);
  };

  next();
};

module.exports = idempotency;
