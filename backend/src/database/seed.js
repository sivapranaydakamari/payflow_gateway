const db = require("../config/db");

const seedTestMerchant = async () => {
  const email = "test@example.com";

  const existing = await db.query(
    "SELECT id FROM merchants WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    console.log("Test merchant already exists");
    return;
  }

  await db.query(
    `
    INSERT INTO merchants (
      id, name, email, api_key, api_secret
    ) VALUES ($1, $2, $3, $4, $5)
    `,
    [
      "550e8400-e29b-41d4-a716-446655440000",
      "Test Merchant",
      "test@example.com",
      "key_test_abc123",
      "secret_test_xyz789",
    ]
  );

  console.log("Test merchant seeded");
};

module.exports = { seedTestMerchant };
