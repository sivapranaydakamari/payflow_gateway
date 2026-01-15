const db = require("../config/db");
const { paymentQueue, webhookQueue, refundQueue } = require("../queue");

const getTestMerchant = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, email, api_key
      FROM merchants
      WHERE email = $1
      `,
      ["test@example.com"]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Test merchant not found",
        },
      });
    }

    const merchant = result.rows[0];

    return res.status(200).json({
      id: merchant.id,
      email: merchant.email,
      api_key: merchant.api_key,
      seeded: true,
    });
  } catch (err) {
    console.error("Test merchant API error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

const getJobStatus = async (req, res) => {
  try {
    const paymentCounts = await paymentQueue.getJobCounts();
    const webhookCounts = await webhookQueue.getJobCounts();
    const refundCounts = await refundQueue.getJobCounts();

    res.json({
      pending:
        paymentCounts.waiting +
        webhookCounts.waiting +
        refundCounts.waiting,

      processing:
        paymentCounts.active +
        webhookCounts.active +
        refundCounts.active,

      completed:
        paymentCounts.completed +
        webhookCounts.completed +
        refundCounts.completed,

      failed:
        paymentCounts.failed +
        webhookCounts.failed +
        refundCounts.failed,

      worker_status: "running",
    });
  } catch (err) {
    console.error("Job status error:", err);
    res.status(500).json({
      error: "Unable to fetch job status",
    });
  }
};

module.exports = { getTestMerchant, getJobStatus };
