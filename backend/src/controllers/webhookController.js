const db = require("../config/db");
const { webhookQueue } = require("../queue");

const retryWebhook = async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `
    UPDATE webhook_logs
    SET status = 'pending',
        attempts = 0,
        next_retry_at = NOW()
    WHERE id = $1 AND merchant_id = $2
    `,
    [id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      error: {
        code: "WEBHOOK_NOT_FOUND",
        description: "Webhook not found",
      },
    });
  }

  await webhookQueue.add(
    "deliver-webhook",
    { webhookLogId: id },
    { removeOnComplete: true }
  );

  res.json({
    id,
    status: "pending",
    message: "Webhook retry scheduled",
  });
};

const listWebhooks = async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const offset = Number(req.query.offset || 0);

  const data = await db.query(
    `
    SELECT id, event, status, attempts, created_at, last_attempt_at, response_code
    FROM webhook_logs
    WHERE merchant_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [req.merchant.id, limit, offset]
  );

  const total = await db.query(
    `SELECT COUNT(*) FROM webhook_logs WHERE merchant_id = $1`,
    [req.merchant.id]
  );

  res.json({
    data: data.rows,
    total: Number(total.rows[0].count),
    limit,
    offset,
  });
};

module.exports = { retryWebhook, listWebhooks };
