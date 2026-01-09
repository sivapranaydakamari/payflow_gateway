const db = require("../config/db");
const PaymentService = require("../services/paymentService");

const createPublicPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "order_id is required",
        },
      });
    }

    const orderRes = await db.query(
      `SELECT id, merchant_id FROM orders WHERE id = $1`,
      [order_id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found",
        },
      });
    }

    const merchantId = orderRes.rows[0].merchant_id;

    const payment = await PaymentService.createPayment(
      merchantId,
      req.body
    );

    return res.status(201).json({
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      vpa: payment.vpa,
      card_network: payment.card_network,
      card_last4: payment.card_last4,
      created_at: payment.created_at,
    });
  } catch (err) {
    if (err.code) {
      return res.status(err.status).json({
        error: {
          code: err.code,
          description: err.message,
        },
      });
    }

    console.error("Public payment error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

const getPublicPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    const result = await db.query(
      `
      SELECT 
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        created_at,
        updated_at
      FROM payments
      WHERE id = $1
      `,
      [paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Payment not found",
        },
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Public get payment error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

module.exports = { createPublicPayment, getPublicPayment};