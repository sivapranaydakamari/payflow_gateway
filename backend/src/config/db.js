const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const runSqlFile = async (fileName) => {
  const filePath = path.join(__dirname, "../database", fileName);
  const sql = fs.readFileSync(filePath, "utf-8");
  await pool.query(sql);
};

const initDB = async () => {
  await runSqlFile("schema.sql");
  await runSqlFile("002_deliverable2.sql");
  await runSqlFile("003_refunds.sql");
  await runSqlFile("004_idempotency.sql");
  console.log("Database schema & migrations initialized");
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB,
};
