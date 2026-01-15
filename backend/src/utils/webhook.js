const crypto = require("crypto");

function buildWebhookPayload(event, data) {
  return {
    event,
    timestamp: Math.floor(Date.now() / 1000),
    data,
  };
}


function generateSignature(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

module.exports = {  buildWebhookPayload, generateSignature,};
