const db = require("../config/database");
const geminiService = require("../services/geminiService");

/**
 * Analyze skills and generate learning roadmap
 */
exports.analyzeSkills = async (req, res) => {
  try {
    const { resumeText, jobRole, jobDescription } = req.body;

    // Validate inputs
    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    if (!jobRole && !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Either job role or job description is required",
      });
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Resume text is too short",
      });
    }

    let jobSkills;
    let finalJobRole;

    if (jobDescription) {
      // Extract skills from custom job description using AI
      console.log("📝 Extracting skills from custom job description...");
      jobSkills = await geminiService.extractSkillsFromJobDescription(
        jobDescription
      );
      finalJobRole = "Custom Job Description";
    } else {
      // Fetch required skills for the predefined job role from database
      jobSkills = await getJobSkills(jobRole);

      if (!jobSkills) {
        return res.status(404).json({
          success: false,
          message: `Job role "${jobRole}" not found in database`,
        });
      }
      finalJobRole = jobRole;
    }

    // Use Gemini AI to analyze skills
    const analysis = await geminiService.analyzeSkills(
      resumeText,
      jobSkills,
      finalJobRole
    );

    // Save analysis to database
    await saveAnalysisToDatabase(req.user, resumeText, finalJobRole, analysis);

    res.json({
      success: true,
      analysis: analysis,
      jobRole: finalJobRole,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing skills: " + error.message,
    });
  }
};

/**
 * Get required skills for a job role from database
 */
async function getJobSkills(jobRole) {
  const query = `SELECT required_skills FROM job_skills WHERE LOWER(job_role) = LOWER($1)`;

  try {
    const result = await db.query(query, [jobRole]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    // Parse JSON or comma-separated skills
    try {
      const skills = JSON.parse(row.required_skills);
      return Array.isArray(skills) ? skills : [row.required_skills];
    } catch (e) {
      // If not JSON, treat as comma-separated
      const skills = row.required_skills.split(",").map((s) => s.trim());
      return skills;
    }
  } catch (err) {
    throw err;
  }
}

/**
 * Save analysis to database for history tracking
 */
async function saveAnalysisToDatabase(user, resumeText, jobRole, analysis) {
  const query = `
    INSERT INTO resume_analyses 
    (user_id, user_email, user_name, job_role, resume_text, match_percentage, matched_skills, missing_skills, learning_roadmap)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  const params = [
    user.id,
    user.email,
    user.name,
    jobRole,
    resumeText,
    analysis.match_percentage,
    JSON.stringify(analysis.matched_skills),
    JSON.stringify(analysis.missing_skills),
    JSON.stringify(analysis.learning_roadmap),
  ];

  try {
    const result = await db.query(query, params);
    const insertedId = result.rows[0].id;
    console.log(`✅ Analysis saved to history (ID: ${insertedId})`);
    return insertedId;
  } catch (err) {
    console.error("Error saving analysis:", err);
    // Don't throw - analysis was successful even if save failed
  }
}
