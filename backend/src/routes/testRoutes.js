const express = require("express");
const router = express.Router();

const { getTestMerchant } = require("../controllers/testController");

router.get("/api/v1/test/merchant", getTestMerchant);

module.exports = router;
