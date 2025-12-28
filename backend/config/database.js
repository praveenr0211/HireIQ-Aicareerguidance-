const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error connecting to database:", err);
  } else {
    console.log("✅ Connected to PostgreSQL database");
  }
});

module.exports = pool;
