const db = require("../config/database");

/**
 * Get all analyses for a user
 */
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT id, job_role, match_percentage, created_at
      FROM resume_analyses
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      history: result.rows,
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving history",
    });
  }
};

/**
 * Get specific analysis by ID
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = req.params.id;

    const query = `
      SELECT *
      FROM resume_analyses
      WHERE id = $1 AND user_id = $2
    `;

    const result = await db.query(query, [analysisId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const row = result.rows[0];
    // Parse JSON fields
    const analysis = {
      ...row,
      matched_skills: JSON.parse(row.matched_skills),
      missing_skills: JSON.parse(row.missing_skills),
      learning_roadmap: JSON.parse(row.learning_roadmap),
    };

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving analysis",
    });
  }
};

/**
 * Delete an analysis
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = req.params.id;

    const query = `DELETE FROM resume_analyses WHERE id = $1 AND user_id = $2`;

    const result = await db.query(query, [analysisId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting analysis",
    });
  }
};

/**
 * Get comparison data for multiple analyses
 */
exports.compareAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!ids || ids.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 2 analysis IDs to compare",
      });
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    const query = `
      SELECT *
      FROM resume_analyses
      WHERE id IN (${placeholders}) AND user_id = $${ids.length + 1}
      ORDER BY created_at ASC
    `;

    const result = await db.query(query, [...ids, userId]);

    if (result.rows.length < 2) {
      return res.status(404).json({
        success: false,
        message: "Not enough analyses found for comparison",
      });
    }

    // Parse JSON fields
    const analyses = result.rows.map((row) => ({
      ...row,
      matched_skills: JSON.parse(row.matched_skills),
      missing_skills: JSON.parse(row.missing_skills),
      learning_roadmap: JSON.parse(row.learning_roadmap),
    }));

    res.json({
      success: true,
      comparison: {
        analysis1: analyses[0],
        analysis2: analyses[1],
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error comparing analyses",
    });
  }
};
