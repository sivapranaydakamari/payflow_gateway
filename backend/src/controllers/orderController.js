const OrderService = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const merchant = req.merchant;
    const { amount, currency, receipt, notes } = req.body;

    const order = await OrderService.createOrder({
      merchantId: merchant.id,
      amount,
      currency,
      receipt,
      notes,
    });

    return res.status(201).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at,
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

    console.error("Create order error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const merchant = req.merchant;
    const orderId = req.params.id;

    const order = await OrderService.getOrderById(
      orderId,
      merchant.id
    );

    return res.status(200).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
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

    console.error("Get order error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

const getPublicOrder = async (req, res) => {
  try {
    const order = await OrderService.getPublicOrder(req.params.id);
    res.status(200).json(order);
  } catch (err) {
    res.status(err.status || 500).json({
      error: {
        code: err.code || "INTERNAL_SERVER_ERROR",
        description: err.message || "Something went wrong",
      },
    });
  }
};


module.exports = { createOrder, getOrder, getPublicOrder };
