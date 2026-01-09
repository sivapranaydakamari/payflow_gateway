const db = require("../config/db");

const getTestMerchant = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, email, api_key
      FROM merchants
      WHERE email = $1
      `,
      ["test@example.com"]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Test merchant not found",
        },
      });
    }

    const merchant = result.rows[0];

    return res.status(200).json({
      id: merchant.id,
      email: merchant.email,
      api_key: merchant.api_key,
      seeded: true,
    });
  } catch (err) {
    console.error("Test merchant API error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};

module.exports = { getTestMerchant };
