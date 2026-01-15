const express = require("express");
const merchantAuth = require("../middleware/merchantAuth");
const idempotency = require("../middleware/idempotency");
const { createPayment, getPayment, listPayments, capturePayment } = require("../controllers/paymentController");
const router = express.Router();

router.post("/api/v1/payments", merchantAuth, idempotency, createPayment);
router.get("/api/v1/payments", merchantAuth, listPayments);
router.get("/api/v1/payments/:id", merchantAuth, getPayment);
router.post("/api/v1/payments/:id/capture", merchantAuth, capturePayment);


module.exports = router;
