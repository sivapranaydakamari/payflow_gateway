const db = require("../config/db");
const PaymentService = require("../services/paymentService");

const createPayment = async (req, res) => {
  try {
    const payment = await PaymentService.createPayment(
      req.merchant.id,
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

    console.error("Payment error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await PaymentService.getPaymentById(
      req.params.id,
      req.merchant.id
    );

    return res.status(200).json({
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      vpa: payment.vpa,
      card_network: payment.card_network,
      card_last4: payment.card_last4,
      status: payment.status,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
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

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

async function listPayments(req, res) {
  const merchantId = req.merchant.id;

  try {
    const result = await db.query(
      `
      SELECT id, order_id, amount, method, status, created_at
      FROM payments
      WHERE merchant_id = $1
      ORDER BY created_at DESC
      `,
      [merchantId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("List payments failed:", err);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        description: "Failed to fetch payments",
      },
    });
  }
}

module.exports = { createPayment, getPayment, listPayments };