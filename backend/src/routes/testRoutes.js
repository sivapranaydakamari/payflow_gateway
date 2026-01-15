const express = require("express");
const router = express.Router();
const { getTestMerchant, getJobStatus } = require("../controllers/testController");

router.get("/api/v1/test/merchant", getTestMerchant);
router.get("/api/v1/test/jobs/status", getJobStatus);

module.exports = router;
