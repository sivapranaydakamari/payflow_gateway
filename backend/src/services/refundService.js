const db = require("../config/db");
const crypto = require("crypto");
const { refundQueue } = require("../queue");

const generateRefundId = () =>
  "rfnd_" + crypto.randomBytes(8).toString("hex");


const createRefund = async (merchantId, paymentId, payload) => {
  const { amount, reason } = payload;

  if (!amount) {
    throw {
      status: 400,
      code: "INVALID_REQUEST",
      message: "amount is required",
    };
  }

  const paymentRes = await db.query(
    `SELECT * FROM payments WHERE id = $1 AND merchant_id = $2`,
    [paymentId, merchantId]
  );

  if (paymentRes.rows.length === 0) {
    throw {
      status: 404,
      code: "PAYMENT_NOT_FOUND",
      message: "Payment not found",
    };
  }

  const payment = paymentRes.rows[0];

  if (payment.status !== "success") {
    throw {
      status: 400,
      code: "PAYMENT_NOT_REFUNDABLE",
      message: "Only successful payments can be refunded",
    };
  }

  const refundedRes = await db.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM refunds
    WHERE payment_id = $1 AND status != 'failed'
    `,
    [paymentId]
  );

  const alreadyRefunded = Number(refundedRes.rows[0].total);
  const refundableAmount = payment.amount - alreadyRefunded;

  if (amount > refundableAmount) {
    throw {
      status: 400,
      code: "REFUND_AMOUNT_EXCEEDED",
      message: "Refund amount exceeds refundable balance",
    };
  }

  const refundId = generateRefundId();

  const refundRes = await db.query(
    `
    INSERT INTO refunds (
      id, payment_id, merchant_id, amount, reason, status
    )
    VALUES ($1, $2, $3, $4, $5, 'pending')
    RETURNING *
    `,
    [refundId, paymentId, merchantId, amount, reason || null]
  );

  const refund = refundRes.rows[0];

  await refundQueue.add("process-refund", {
    refundId,
  });

  return refund;
};

const getRefundById = async (refundId, merchantId) => {
  const res = await db.query(
    `
    SELECT *
    FROM refunds
    WHERE id = $1 AND merchant_id = $2
    `,
    [refundId, merchantId]
  );

  if (res.rows.length === 0) {
    throw {
      status: 404,
      code: "REFUND_NOT_FOUND",
      message: "Refund not found",
    };
  }

  return res.rows[0];
};

const listRefunds = async (merchantId) => {
  const res = await db.query(
    `
    SELECT *
    FROM refunds
    WHERE merchant_id = $1
    ORDER BY created_at DESC
    `,
    [merchantId]
  );

  return res.rows;
};

module.exports = {  createRefund, getRefundById, listRefunds, };
