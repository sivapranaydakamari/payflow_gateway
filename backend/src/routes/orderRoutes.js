const express = require("express");
const merchantAuth = require("../middleware/merchantAuth");
const { createOrder, getOrder } = require("../controllers/orderController");
const router = express.Router();

router.post("/api/v1/orders", merchantAuth, createOrder);
router.get("/api/v1/orders/:id", merchantAuth, getOrder);

module.exports = router;
