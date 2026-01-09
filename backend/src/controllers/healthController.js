const db = require("../config/db");

const healthCheck = async (req, res) => {
  let dbStatus = "connected";

  try {
    await db.query("SELECT 1");
  } catch (err) {
    dbStatus = "disconnected";
  }

  return res.status(200).json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck };
