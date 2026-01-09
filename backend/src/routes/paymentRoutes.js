const express = require("express");
const merchantAuth = require("../middleware/merchantAuth");
const { createPayment, getPayment, listPayments } = require("../controllers/paymentController");
const router = express.Router();

router.post("/api/v1/payments", merchantAuth, createPayment);
router.get("/api/v1/payments", merchantAuth, listPayments);
router.get("/api/v1/payments/:id", merchantAuth, getPayment);


module.exports = router;
