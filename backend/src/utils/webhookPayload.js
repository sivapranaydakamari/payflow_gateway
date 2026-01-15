module.exports.buildPaymentPayload = (event, payment) => ({
  event,
  timestamp: Math.floor(Date.now() / 1000),
  data: {
    payment: {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      vpa: payment.vpa,
      created_at: payment.created_at,
    },
  },
});
