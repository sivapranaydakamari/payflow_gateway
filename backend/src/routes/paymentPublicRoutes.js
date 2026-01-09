const express = require("express");
const { createPublicPayment, getPublicPayment } = require("../controllers/paymentPublicController");
const router = express.Router();

router.post("/api/v1/payments/public", createPublicPayment);
router.get("/api/v1/payments/:id/public", getPublicPayment);

module.exports = router;