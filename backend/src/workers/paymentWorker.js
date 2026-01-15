const { Worker } = require("bullmq");
const db = require("../config/db");
const { webhookQueue } = require("../queue");

const connection = {
  host: "redis",
  port: 6379,
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const paymentWorker = new Worker(
  "payments",
  async (job) => {
    const { paymentId } = job.data;

    console.log("Processing payment:", paymentId);

    const result = await db.query(
      `SELECT * FROM payments WHERE id = $1`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Payment not found");
    }

    const payment = result.rows[0];

    const testMode = process.env.TEST_MODE === "true";
    const delay = testMode
      ? parseInt(process.env.TEST_PROCESSING_DELAY || "1000")
      : Math.floor(Math.random() * 5000) + 5000;

    await sleep(delay);

    let success;
    if (testMode) {
      success = process.env.TEST_PAYMENT_SUCCESS !== "false";
    } else {
      success =
        payment.method === "upi"
          ? Math.random() < 0.9
          : Math.random() < 0.95;
    }

    if (success) {
      await db.query(
        `UPDATE payments SET status='success', updated_at=NOW() WHERE id=$1`,
        [paymentId]
      );
      console.log("Payment success:", paymentId);
    } else {
      await db.query(
        `
        UPDATE payments
        SET status='failed',
            error_code='PAYMENT_FAILED',
            error_description='Payment processing failed',
            updated_at=NOW()
        WHERE id=$1
        `,
        [paymentId]
      );
      console.log("Payment failed:", paymentId);
    }

    const event =
      success ? "payment.success" : "payment.failed";

    const payload = {
      event,
      timestamp: Math.floor(Date.now() / 1000),
      data: {
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: success ? "success" : "failed",
          vpa: payment.vpa,
          created_at: payment.created_at,
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
      [payment.merchant_id, event, payload]
    );

    const webhookLogId = logRes.rows[0].id;

    await webhookQueue.add("deliver-webhook", { webhookLogId });
  },
  { connection }
);

module.exports = paymentWorker;
