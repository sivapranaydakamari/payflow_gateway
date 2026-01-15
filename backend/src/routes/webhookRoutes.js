const express = require("express");
const merchantAuth = require("../middleware/merchantAuth");
const router = express.Router();
const { retryWebhook, listWebhooks } = require("../controllers/webhookController");

router.post("/api/v1/webhooks/:id/retry", merchantAuth, retryWebhook);
router.get("/api/v1/webhooks", merchantAuth, listWebhooks);

module.exports = router;
