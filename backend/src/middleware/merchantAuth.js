const db = require("../config/db");

const merchantAuth = async (req, res, next) => {
  try {
    const apiKey = req.header("X-Api-Key");
    const apiSecret = req.header("X-Api-Secret");

    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials",
        },
      });
    }

    const result = await db.query(
      `
      SELECT id, name, email, api_key, api_secret, is_active
      FROM merchants
      WHERE api_key = $1
      `,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials",
        },
      });
    }

    const merchant = result.rows[0];

    if (merchant.api_secret !== apiSecret) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials",
        },
      });
    }

    if (!merchant.is_active) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Merchant is inactive",
        },
      });
    }

    req.merchant = {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Authentication failed",
      },
    });
  }
};

module.exports = merchantAuth;
