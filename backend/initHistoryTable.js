const pool = require("./config/database");

/**
 * Initialize resume_analyses table for history tracking
 */
async function initHistoryTable() {
  console.log("🔧 Creating resume_analyses table...");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resume_analyses (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT,
        job_role TEXT NOT NULL,
        resume_text TEXT NOT NULL,
        match_percentage INTEGER NOT NULL,
        matched_skills TEXT NOT NULL,
        missing_skills TEXT NOT NULL,
        learning_roadmap TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ resume_analyses table created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating resume_analyses table:", err);
    process.exit(1);
  }
}

// Run initialization
initHistoryTable();
