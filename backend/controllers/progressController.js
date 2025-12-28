const db = require("../config/database");

/**
 * Get user's skill progress
 */
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM skill_progress
      WHERE user_id = $1
      ORDER BY started_at DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      skills: result.rows,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving progress",
    });
  }
};

/**
 * Add or update skill progress
 */
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { skill_name, status, notes } = req.body;

    if (!skill_name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const completed_at =
      status === "completed" ? new Date().toISOString() : null;

    const query = `
      INSERT INTO skill_progress (user_id, user_email, skill_name, status, notes, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT(user_id, skill_name) 
      DO UPDATE SET status = $4, notes = $5, completed_at = $6
    `;

    await db.query(query, [
      userId,
      userEmail,
      skill_name,
      status,
      notes,
      completed_at,
    ]);

    // Check for achievements
    await checkAndAwardAchievements(userId, userEmail);

    res.json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
    });
  }
};

/**
 * Get user's achievements
 */
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM achievements
      WHERE user_id = $1
      ORDER BY earned_at DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      achievements: result.rows,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving achievements",
    });
  }
};

/**
 * Get progress statistics
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalResult = await db.query(
      `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = $1`,
      [userId]
    );
    const completedResult = await db.query(
      `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    const inProgressResult = await db.query(
      `SELECT COUNT(*) as count FROM skill_progress WHERE user_id = $1 AND status = 'in-progress'`,
      [userId]
    );
    const recentResult = await db.query(
      `SELECT skill_name, completed_at 
       FROM skill_progress 
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      totalSkills: parseInt(totalResult.rows[0].count),
      completedSkills: parseInt(completedResult.rows[0].count),
      inProgressSkills: parseInt(inProgressResult.rows[0].count),
      recentlyCompleted: recentResult.rows,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving stats",
    });
  }
};

/**
 * Check and award achievements based on progress
 */
async function checkAndAwardAchievements(userId, userEmail) {
  try {
    const query = `
      SELECT COUNT(*) as completed_count
      FROM skill_progress
      WHERE user_id = $1 AND status = 'completed'
    `;

    const result = await db.query(query, [userId]);
    const completedCount = parseInt(result.rows[0].completed_count);
    const badges = [];

    // Define achievement milestones
    if (completedCount >= 1)
      badges.push({ type: "first_skill", name: "First Step" });
    if (completedCount >= 5)
      badges.push({ type: "skill_explorer", name: "Skill Explorer" });
    if (completedCount >= 10)
      badges.push({ type: "skill_master", name: "Skill Master" });
    if (completedCount >= 20)
      badges.push({ type: "skill_legend", name: "Skill Legend" });

    // Award new badges
    for (const badge of badges) {
      const insertQuery = `
        INSERT INTO achievements (user_id, user_email, badge_type, badge_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, badge_type) DO NOTHING
      `;

      try {
        await db.query(insertQuery, [
          userId,
          userEmail,
          badge.type,
          badge.name,
        ]);
        console.log(`🏆 Badge awarded: ${badge.name} to user ${userId}`);
      } catch (err) {
        console.error("Error awarding badge:", err);
      }
    }
  } catch (err) {
    console.error("Error checking achievements:", err);
  }
}
