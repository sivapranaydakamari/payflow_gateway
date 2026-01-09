const db = require("../config/db");
const crypto = require("crypto");

const generateOrderId = () => {
  return (
    "order_" +
    crypto.randomBytes(8).toString("hex").slice(0, 16)
  );
};

const createOrder = async ({ merchantId, amount, currency, receipt, notes }) => {
  if (!Number.isInteger(amount) || amount < 100) {
    throw {
      status: 400,
      code: "BAD_REQUEST_ERROR",
      message: "amount must be at least 100",
    };
  }

  const orderId = generateOrderId();

  const result = await db.query(
    `
    INSERT INTO orders (
      id, merchant_id, amount, currency, receipt, notes, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'created')
    RETURNING *
    `,
    [
      orderId,
      merchantId,
      amount,
      currency || "INR",
      receipt || null,
      notes || {},
    ]
  );

  return result.rows[0];
};

const getOrderById = async (orderId, merchantId) => {
  const result = await db.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1 AND merchant_id = $2
    `,
    [orderId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      status: 404,
      code: "NOT_FOUND_ERROR",
      message: "Order not found",
    };
  }

  return result.rows[0];
};

const getPublicOrder = async (orderId) => {
  const result = await db.query(
    `SELECT id, amount, currency, status FROM orders WHERE id = $1`,
    [orderId]
  );

  if (result.rows.length === 0) {
    throw {
      status: 404,
      code: "NOT_FOUND_ERROR",
      message: "Order not found",
    };
  }

  return result.rows[0];
};

module.exports = { createOrder, getOrderById, getPublicOrder };