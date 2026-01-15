const express = require("express");
const merchantAuth = require("../middleware/merchantAuth");
const idempotency = require("../middleware/idempotency");
const { createRefund, getRefund, listRefunds } = require("../controllers/refundController");
const router = express.Router();

router.post("/api/v1/payments/:paymentId/refunds", merchantAuth, idempotency, createRefund);
router.get("/api/v1/refunds/:id", merchantAuth, getRefund);
router.get("/api/v1/refunds", merchantAuth, listRefunds);

module.exports = router;
