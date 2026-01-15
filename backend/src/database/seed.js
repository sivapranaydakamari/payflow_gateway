const db = require("../config/db");

const seedTestMerchant = async () => {
  const email = "test@example.com";
  const webhookSecret = "whsec_test_abc123";

  const existing = await db.query(
    "SELECT id, webhook_secret FROM merchants WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    await db.query(
      `
    UPDATE merchants
    SET webhook_secret = COALESCE(webhook_secret, $1),
        webhook_url = COALESCE(webhook_url, $2)
    WHERE email = $3
    `,
      [
        webhookSecret,
        process.env.TEST_WEBHOOK_URL || null,
        email,
      ]
    );

    console.log("Test merchant exists — ensured webhook config");
    return;
  }


  await db.query(
    `
    INSERT INTO merchants (
      id, name, email, api_key, api_secret, webhook_secret
    ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      "550e8400-e29b-41d4-a716-446655440000",
      "Test Merchant",
      email,
      "key_test_abc123",
      "secret_test_xyz789",
      webhookSecret,
    ]
  );

  console.log("Test merchant seeded");
};

module.exports = { seedTestMerchant };
