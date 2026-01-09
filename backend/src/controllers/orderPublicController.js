const db = require("../config/db");

async function getPublicOrder(req, res) {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT id, amount, currency, status FROM orders WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found",
        },
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        description: "Failed to fetch order",
      },
    });
  }
}

module.exports = { getPublicOrder };
