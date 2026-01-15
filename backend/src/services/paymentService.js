const db = require("../config/db");
const { paymentQueue } = require("../queue");
const crypto = require("crypto");
const {
  isValidVPA,
  isValidCardNumber,
  detectCardNetwork,
  isValidExpiry,
} = require("./validationService");

const generatePaymentId = () =>
  "pay_" + crypto.randomBytes(8).toString("hex").slice(0, 16);

const createPayment = async (merchantId, payload) => {
  const { order_id, method } = payload;

  const orderRes = await db.query(
    `SELECT * FROM orders WHERE id = $1 AND merchant_id = $2`,
    [order_id, merchantId]
  );

  if (orderRes.rows.length === 0) {
    throw {
      status: 404,
      code: "NOT_FOUND_ERROR",
      message: "Order not found",
    };
  }

  const order = orderRes.rows[0];
  const paymentId = generatePaymentId();

  let vpa = null;
  let card_network = null;
  let card_last4 = null;

  if (method === "upi") {
    if (!payload.vpa || !isValidVPA(payload.vpa)) {
      throw {
        status: 400,
        code: "INVALID_VPA",
        message: "VPA format invalid",
      };
    }
    vpa = payload.vpa;
  }

  if (method === "card") {
    const card = payload.card || {};

    if (
      !isValidCardNumber(card.number) ||
      !isValidExpiry(card.expiry_month, card.expiry_year)
    ) {
      throw {
        status: 400,
        code: "INVALID_CARD",
        message: "Card validation failed",
      };
    }

    card_network = detectCardNetwork(card.number);
    card_last4 = card.number.slice(-4);
  }

  await db.query(
    `
    INSERT INTO payments (
      id, order_id, merchant_id, amount, currency,
      method, status, vpa, card_network, card_last4
    ) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9)
    `,
    [
      paymentId,
      order.id,
      merchantId,
      order.amount,
      order.currency,
      method,
      vpa,
      card_network,
      card_last4,
    ]
  );

  await paymentQueue.add("process-payment", { paymentId });

  return {
    id: paymentId,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    method,
    status: "pending",
    vpa,
    card_network,
    card_last4,
    created_at: new Date(),
  };
};

const getPaymentById = async (paymentId, merchantId) => {
  const result = await db.query(
    `
    SELECT *
    FROM payments
    WHERE id = $1 AND merchant_id = $2
    `,
    [paymentId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      status: 404,
      code: "NOT_FOUND_ERROR",
      message: "Payment not found",
    };
  }

  return result.rows[0];
};

const capturePayment = async (paymentId, merchantId, amount) => {
  const res = await db.query(
    `SELECT * FROM payments WHERE id = $1 AND merchant_id = $2`,
    [paymentId, merchantId]
  );

  if (!res.rows.length) {
    throw {
      status: 404,
      message: "Payment not found",
    };
  }

  const payment = res.rows[0];

  if (payment.status !== "success" || payment.captured) {
    throw {
      status: 400,
      message: "Payment not in capturable state",
    };
  }

  if (amount !== payment.amount) {
    throw {
      status: 400,
      message: "Capture amount mismatch",
    };
  }

  const updated = await db.query(
    `
    UPDATE payments
    SET captured = true, updated_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [paymentId]
  );

  return updated.rows[0];
};


module.exports = { createPayment, getPaymentById, capturePayment };
