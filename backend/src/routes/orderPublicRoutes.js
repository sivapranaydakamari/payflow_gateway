const express = require("express");
const router = express.Router();
const { getPublicOrder } = require("../controllers/orderPublicController");

router.get("/api/v1/orders/:id/public", getPublicOrder);

module.exports = router;
