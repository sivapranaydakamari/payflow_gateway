require("dotenv").config();
const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await db.initDB();

    if (process.env.ENABLE_DEV_SEED === "true") {
      const { seedTestMerchant } = require("./database/seed");
      await seedTestMerchant();
      console.log("Dev seed ensured");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Gateway API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
