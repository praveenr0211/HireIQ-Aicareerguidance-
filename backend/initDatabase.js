const pool = require("./config/database");

/**
 * Initialize database schema and seed data
 */
async function initDatabase() {
  console.log("🔧 Initializing database...");

  try {
    // Create job_skills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_skills (
        id SERIAL PRIMARY KEY,
        job_role TEXT NOT NULL UNIQUE,
        required_skills TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table created successfully");

    // Seed data
    await seedData();

    console.log("🎉 Database initialization complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating table:", err);
    process.exit(1);
  }
}

/**
 * Seed job roles and required skills
 */
async function seedData() {
  const jobRoles = [
    {
      job_role: "Frontend Developer",
      required_skills: JSON.stringify([
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "TypeScript",
        "Redux",
        "Webpack",
        "Git",
        "Responsive Design",
        "RESTful APIs",
        "Testing (Jest/React Testing Library)",
        "CSS Preprocessors (SASS/LESS)",
        "npm/yarn",
      ]),
    },
    {
      job_role: "Backend Developer",
      required_skills: JSON.stringify([
        "Node.js",
        "Express.js",
        "Python",
        "Django/Flask",
        "SQL",
        "PostgreSQL",
        "MongoDB",
        "RESTful APIs",
        "GraphQL",
        "Authentication (JWT/OAuth)",
        "Docker",
        "Redis",
        "Git",
        "Microservices",
        "API Security",
      ]),
    },
    {
      job_role: "Data Analyst",
      required_skills: JSON.stringify([
        "Python",
        "SQL",
        "Excel",
        "Tableau",
        "Power BI",
        "Statistics",
        "Data Visualization",
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Seaborn",
        "Data Cleaning",
        "ETL Processes",
        "Business Intelligence",
        "R",
      ]),
    },
    {
      job_role: "AI Engineer",
      required_skills: JSON.stringify([
        "Python",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "scikit-learn",
        "NLP",
        "Computer Vision",
        "Neural Networks",
        "Pandas",
        "NumPy",
        "Model Deployment",
        "MLOps",
        "Docker",
        "Cloud Platforms (AWS/GCP/Azure)",
        "SQL",
      ]),
    },
    {
      job_role: "Full Stack Developer",
      required_skills: JSON.stringify([
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "PostgreSQL",
        "HTML",
        "CSS",
        "Git",
        "RESTful APIs",
        "Docker",
        "CI/CD",
        "AWS/Cloud",
        "Testing",
        "Agile/Scrum",
      ]),
    },
    {
      job_role: "DevOps Engineer",
      required_skills: JSON.stringify([
        "Linux",
        "Docker",
        "Kubernetes",
        "Jenkins",
        "CI/CD",
        "AWS/GCP/Azure",
        "Terraform",
        "Ansible",
        "Git",
        "Bash/Shell Scripting",
        "Python",
        "Monitoring (Prometheus/Grafana)",
        "Nginx",
        "Infrastructure as Code",
        "Networking",
      ]),
    },
    {
      job_role: "Mobile Developer",
      required_skills: JSON.stringify([
        "React Native",
        "Flutter",
        "Dart",
        "JavaScript",
        "TypeScript",
        "iOS Development",
        "Android Development",
        "Swift",
        "Kotlin",
        "RESTful APIs",
        "Git",
        "Mobile UI/UX",
        "App Store Deployment",
        "Firebase",
      ]),
    },
    {
      job_role: "Data Scientist",
      required_skills: JSON.stringify([
        "Python",
        "R",
        "Machine Learning",
        "Statistics",
        "Deep Learning",
        "SQL",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "TensorFlow",
        "PyTorch",
        "Data Visualization",
        "Jupyter",
        "Feature Engineering",
        "Model Evaluation",
        "Big Data",
      ]),
    },
  ];

  try {
    for (const role of jobRoles) {
      await pool.query(
        "INSERT INTO job_skills (job_role, required_skills) VALUES ($1, $2) ON CONFLICT (job_role) DO NOTHING",
        [role.job_role, role.required_skills]
      );
      console.log(`✅ Inserted: ${role.job_role}`);
    }

    console.log(`\n🎉 Database initialized with ${jobRoles.length} job roles`);
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    throw err;
  }
}

// Run initialization
initDatabase();
