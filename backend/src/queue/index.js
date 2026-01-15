const { Queue } = require('bullmq');

const connection = {
  host: 'redis',
  port: 6379,
};

const paymentQueue = new Queue('payments', { connection });
const refundQueue  = new Queue('refunds', { connection });
const webhookQueue = new Queue('webhooks', { connection });

module.exports = {
  paymentQueue,
  refundQueue,
  webhookQueue,
};
