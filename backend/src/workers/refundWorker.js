const { Worker } = require("bullmq");
const db = require("../config/db");
const { webhookQueue } = require("../queue");

const connection = { host: "redis", port: 6379 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const refundWorker = new Worker(
  "refunds",
  async (job) => {
    const { refundId } = job.data;

    console.log("Processing refund:", refundId);

    const res = await db.query(
      `SELECT * FROM refunds WHERE id = $1`,
      [refundId]
    );
    if (!res.rows.length) return;

    const refund = res.rows[0];
    if (refund.status !== "pending") return;

    await sleep(1000);

    const success =
      process.env.TEST_MODE === "true" ? true : Math.random() < 0.95;

    const status = success ? "success" : "failed";

    await db.query(
      `
      UPDATE refunds
      SET status = $1,
          processed_at = NOW()
      WHERE id = $2
      `,
      [status, refundId]
    );

    console.log(`Refund ${status}:`, refundId);

    const event = `refund.${status}`;

    const payload = {
      event,
      timestamp: Math.floor(Date.now() / 1000),
      data: {
        refund: {
          id: refund.id,
          payment_id: refund.payment_id,
          amount: refund.amount,
          status,
          reason: refund.reason,
          created_at: refund.created_at,
          processed_at: new Date(),
        },
      },
    };

    const logRes = await db.query(
      `
      INSERT INTO webhook_logs (
        merchant_id,
        event,
        payload,
        status,
        attempts,
        created_at
      )
      VALUES ($1, $2, $3, 'pending', 0, NOW())
      RETURNING id
      `,
      [refund.merchant_id, event, payload]
    );

    const webhookLogId = logRes.rows[0].id;

    await webhookQueue.add("deliver-webhook", { webhookLogId });
  },
  { connection }
);

module.exports = refundWorker;
