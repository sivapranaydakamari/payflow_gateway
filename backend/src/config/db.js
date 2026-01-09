const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  const schemaPath = path.join(__dirname, "../database/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(schema);
  console.log("Database schema initialized");
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB,
};
