// const { Worker } = require("bullmq");
// const axios = require("axios");
// const db = require("../config/db");
// const { generateSignature } = require("../utils/webhook");

// const connection = {
//   host: "redis",
//   port: 6379,
// };

// const webhookWorker = new Worker(
//   "webhooks",
//   async (job) => {
//     const { webhookLogId } = job.data;

//     console.log("Delivering webhook:", webhookLogId);

//     const logRes = await db.query(
//       `SELECT * FROM webhook_logs WHERE id = $1`,
//       [webhookLogId]
//     );

//     if (logRes.rows.length === 0) {
//       throw new Error("Webhook log not found");
//     }

//     const log = logRes.rows[0];

//     const merchantRes = await db.query(
//       `SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1`,
//       [log.merchant_id]
//     );

//     if (merchantRes.rows.length === 0) {
//       throw new Error("Merchant not found");
//     }

//     const merchant = merchantRes.rows[0];

//     if (!merchant.webhook_url) {
//       console.log("Webhook URL not set, skipping");
//       return;
//     }

//     const payloadString = JSON.stringify(log.payload);
//     const signature = generateSignature(
//       payloadString,
//       merchant.webhook_secret
//     );

//     let responseCode = null;
//     let responseBody = null;

//     try {
//       const response = await axios.post(
//         merchant.webhook_url,
//         payloadString,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-Webhook-Signature": signature,
//           },
//           timeout: 5000,
//         }
//       );

//       responseCode = response.status;
//       responseBody = JSON.stringify(response.data);

//       await db.query(
//         `
//         UPDATE webhook_logs
//         SET status = 'success',
//             attempts = attempts + 1,
//             response_code = $1,
//             response_body = $2,
//             last_attempt_at = NOW()
//         WHERE id = $3
//         `,
//         [responseCode, responseBody, webhookLogId]
//       );

//       console.log("Webhook delivered:", webhookLogId);
//     } catch (err) {
//       const attempts = log.attempts + 1;

//       if (attempts >= MAX_ATTEMPTS) {
//         await db.query(
//           `
//       UPDATE webhook_logs
//       SET status = 'failed',
//           attempts = $1,
//           response_code = $2,
//           response_body = $3,
//           last_attempt_at = NOW()
//       WHERE id = $4
//       `,
//           [
//             attempts,
//             err.response?.status || null,
//             err.message,
//             webhookLogId,
//           ]
//         );

//         console.log("Webhook permanently failed:", webhookLogId);
//         return;
//       }

//       const delay = BACKOFF_DELAYS[attempts - 1];

//       await db.query(
//         `
//     UPDATE webhook_logs
//     SET status = 'pending',
//         attempts = $1,
//         response_code = $2,
//         response_body = $3,
//         last_attempt_at = NOW()
//     WHERE id = $4
//     `,
//         [
//           attempts,
//           err.response?.status || null,
//           err.message,
//           webhookLogId,
//         ]
//       );

//       await job.queue.add(
//         "deliver-webhook",
//         { webhookLogId },
//         { delay }
//       );

//       console.log(
//         `Webhook retry scheduled (attempt ${attempts}) in ${delay}ms`
//       );

//       throw err;
//     }

//   },
//   { connection }
// );

// module.exports = webhookWorker;

const { Worker } = require("bullmq");
const axios = require("axios");
const db = require("../config/db");
const { generateSignature } = require("../utils/webhook");
const { webhookQueue } = require("../queue");
const { MAX_ATTEMPTS, BACKOFF_DELAYS } = require("../config/webhookRetry");

const connection = { host: "redis", port: 6379 };

const webhookWorker = new Worker(
  "webhooks",
  async (job) => {
    const { webhookLogId } = job.data;

    console.log("Delivering webhook:", webhookLogId);

    const { rows } = await db.query(
      `SELECT * FROM webhook_logs WHERE id = $1`,
      [webhookLogId]
    );
    if (!rows.length) return;

    const log = rows[0];

    if (log.status === "success") {
      console.log("Webhook already delivered, skipping");
      return;
    }

    const merchantRes = await db.query(
      `SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1`,
      [log.merchant_id]
    );
    if (!merchantRes.rows.length) return;

    const merchant = merchantRes.rows[0];
    if (!merchant.webhook_url) return;

    const payloadString = JSON.stringify(log.payload);
    const signature = generateSignature(
      payloadString,
      merchant.webhook_secret
    );

    try {
      const response = await axios.post(
        merchant.webhook_url,
        payloadString,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
          },
          timeout: 5000,
        }
      );

      await db.query(
        `
        UPDATE webhook_logs
        SET status = 'success',
            attempts = attempts + 1,
            response_code = $1,
            response_body = $2,
            last_attempt_at = NOW()
        WHERE id = $3
        `,
        [response.status, JSON.stringify(response.data), webhookLogId]
      );

      console.log("Webhook delivered:", webhookLogId);
      return;
    } catch (err) {
      const attempts = log.attempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        await db.query(
          `
          UPDATE webhook_logs
          SET status = 'failed',
              attempts = $1,
              response_code = $2,
              response_body = $3,
              last_attempt_at = NOW()
          WHERE id = $4
          `,
          [
            attempts,
            err.response?.status || null,
            err.message,
            webhookLogId,
          ]
        );

        console.log("Webhook permanently failed:", webhookLogId);
        return;
      }

      const delay = BACKOFF_DELAYS[attempts - 1];

      await db.query(
        `
        UPDATE webhook_logs
        SET status = 'pending',
            attempts = $1,
            response_code = $2,
            response_body = $3,
            last_attempt_at = NOW()
        WHERE id = $4
        `,
        [
          attempts,
          err.response?.status || null,
          err.message,
          webhookLogId,
        ]
      );

      await webhookQueue.add(
        "deliver-webhook",
        { webhookLogId },
        { delay }
      );

      console.log(
        `Webhook retry scheduled (attempt ${attempts}) in ${delay}ms`
      );

      return;
    }
  },
  { connection }
);

module.exports = webhookWorker;
