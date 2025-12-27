import React, { useState } from "react";
import "./ResultDashboard.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { updateProgress } from "../services/api";

const ResultDashboard = ({ analysis, jobRole, onReset }) => {
  const { match_percentage, matched_skills, missing_skills, learning_roadmap } =
    analysis;
  const [trackingSkills, setTrackingSkills] = useState(false);

  // Calculate color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 75) return "#4caf50";
    if (percentage >= 50) return "#ff9800";
    return "#f44336";
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(102, 126, 234);
    doc.text("Skills Analysis Report", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Job Role: ${jobRole}`, pageWidth / 2, yPosition, {
      align: "center",
    });
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPosition + 6,
      { align: "center" }
    );

    yPosition += 20;

    // Match Score Section
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text("Skill Match Score", 14, yPosition);

    yPosition += 10;
    doc.setFontSize(36);
    doc.setTextColor(...hexToRgb(getMatchColor(match_percentage)));
    doc.text(`${match_percentage}%`, pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const matchDesc =
      match_percentage >= 75
        ? "Excellent match! You have most required skills."
        : match_percentage >= 50
        ? "Good start! Some skills need development."
        : "Focus on building key skills for this role.";
    doc.text(matchDesc, pageWidth / 2, yPosition, { align: "center" });

    yPosition += 15;

    // Matched Skills Section
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`✓ Skills You Have (${matched_skills.length})`, 14, yPosition);

    yPosition += 8;
    if (matched_skills.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [["Matched Skills"]],
        body: matched_skills.map((skill) => [skill]),
        theme: "striped",
        headStyles: { fillColor: [76, 175, 80] },
        margin: { left: 14, right: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("No matching skills found", 14, yPosition);
      yPosition += 10;
    }

    // Check if new page needed
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Missing Skills Section
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`✕ Skills to Learn (${missing_skills.length})`, 14, yPosition);

    yPosition += 8;
    if (missing_skills.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [["Skills to Develop"]],
        body: missing_skills.map((skill) => [skill]),
        theme: "striped",
        headStyles: { fillColor: [244, 67, 54] },
        margin: { left: 14, right: 14 },
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Great! You have all required skills!", 14, yPosition);
      yPosition += 10;
    }

    // Learning Roadmap Section
    if (learning_roadmap && learning_roadmap.length > 0) {
      // Check if new page needed
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text("🗺 Personalized Learning Roadmap", 14, yPosition);

      yPosition += 8;

      // Create roadmap data with courses and projects
      const roadmapData = learning_roadmap.flatMap((item, index) => {
        const rows = [];

        // Main skill row
        rows.push([
          {
            content: `${index + 1}. ${item.skill}`,
            colSpan: 3,
            styles: { fontStyle: "bold", fillColor: [240, 242, 255] },
          },
        ]);

        // Timeline row
        rows.push([{ content: `⏱️ Timeline: ${item.timeline}`, colSpan: 3 }]);

        // Courses
        if (item.resources && item.resources.length > 0) {
          rows.push([
            {
              content: "📚 Recommended Courses:",
              colSpan: 3,
              styles: { fontStyle: "bold" },
            },
          ]);

          item.resources.forEach((resource) => {
            rows.push([
              resource.platform,
              resource.title,
              `${resource.rating}\n${resource.cost}`,
            ]);
          });
        }

        // Projects
        if (item.projects && item.projects.length > 0) {
          rows.push([
            {
              content: "💡 Practice Projects:",
              colSpan: 3,
              styles: { fontStyle: "bold" },
            },
          ]);

          item.projects.forEach((project) => {
            rows.push([{ content: `• ${project}`, colSpan: 3 }]);
          });
        }

        // Spacer
        rows.push([{ content: "", colSpan: 3, styles: { minCellHeight: 5 } }]);

        return rows;
      });

      autoTable(doc, {
        startY: yPosition,
        body: roadmapData,
        theme: "grid",
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 95 },
          2: { cellWidth: 40 },
        },
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages} | Generated by AI Skill-Gap Analyzer`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Save PDF
    doc.save(
      `skill-analysis-${jobRole
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.pdf`
    );
  };

  // Track missing skills function
  const handleTrackSkills = async () => {
    if (!missing_skills || missing_skills.length === 0) {
      alert("No missing skills to track!");
      return;
    }

    try {
      setTrackingSkills(true);
      let successCount = 0;

      for (const skill of missing_skills) {
        try {
          await updateProgress(
            skill,
            "in-progress",
            `Added from ${jobRole} analysis`
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to track skill: ${skill}`, error);
        }
      }

      alert(
        `Successfully added ${successCount} skills to your progress tracker!`
      );
    } catch (error) {
      console.error("Error tracking skills:", error);
      alert("Failed to track skills. Please try again.");
    } finally {
      setTrackingSkills(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* Header */}
        <div className="dashboard-header">
          <h1>📊 Skills Analysis Report</h1>
          <p className="job-role-badge">{jobRole}</p>
        </div>

        {/* Match Percentage */}
        <div className="match-section">
          <h2>Skill Match Score</h2>
          <div className="circular-progress">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={getMatchColor(match_percentage)}
                strokeWidth="20"
                strokeDasharray={`${2 * Math.PI * 85}`}
                strokeDashoffset={`${
                  2 * Math.PI * 85 * (1 - match_percentage / 100)
                }`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="progress-circle"
              />
            </svg>
            <div
              className="percentage-text"
              style={{ color: getMatchColor(match_percentage) }}
            >
              {match_percentage}%
            </div>
          </div>
          <p className="match-description">
            {match_percentage >= 75 &&
              "Excellent match! You have most required skills."}
            {match_percentage >= 50 &&
              match_percentage < 75 &&
              "Good start! Some skills need development."}
            {match_percentage < 50 &&
              "Focus on building key skills for this role."}
          </p>
        </div>

        {/* Matched Skills */}
        <div className="skills-section">
          <h2>✅ Skills You Have ({matched_skills.length})</h2>
          <div className="skills-grid">
            {matched_skills.map((skill, index) => (
              <div key={index} className="skill-tag skill-matched">
                {skill}
              </div>
            ))}
          </div>
          {matched_skills.length === 0 && (
            <p className="empty-message">No matching skills found</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="skills-section">
          <h2>📚 Skills to Learn ({missing_skills.length})</h2>
          <div className="skills-grid">
            {missing_skills.map((skill, index) => (
              <div key={index} className="skill-tag skill-missing">
                {skill}
              </div>
            ))}
          </div>
          {missing_skills.length === 0 && (
            <p className="empty-message">
              Great! You have all required skills!
            </p>
          )}
        </div>

        {/* Learning Roadmap */}
        {learning_roadmap && learning_roadmap.length > 0 && (
          <div className="roadmap-section">
            <h2>🗺️ Personalized Learning Roadmap</h2>
            <div className="roadmap-list">
              {learning_roadmap.map((item, index) => (
                <div key={index} className="roadmap-item">
                  <div className="roadmap-number">{index + 1}</div>
                  <div className="roadmap-content">
                    <h3>{item.skill}</h3>
                    <p className="roadmap-timeline">
                      <strong>⏱️ Timeline:</strong> {item.timeline}
                    </p>

                    {/* Course Resources */}
                    {item.resources && item.resources.length > 0 && (
                      <div className="course-resources">
                        <h4>📚 Recommended Courses:</h4>
                        <div className="course-cards">
                          {item.resources.map((resource, rIndex) => (
                            <div key={rIndex} className="course-card">
                              <div
                                className={`platform-badge platform-${resource.platform
                                  .toLowerCase()
                                  .replace(/\s+/g, "")}`}
                              >
                                {resource.platform}
                              </div>
                              <h5 className="course-title">{resource.title}</h5>
                              <div className="course-meta">
                                <span className="course-rating">
                                  ⭐ {resource.rating}
                                </span>
                                <span
                                  className={`course-cost ${
                                    resource.cost.toLowerCase() === "free"
                                      ? "free-badge"
                                      : ""
                                  }`}
                                >
                                  {resource.cost.toLowerCase() === "free"
                                    ? "🎁 FREE"
                                    : `💰 ${resource.cost}`}
                                </span>
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="course-link"
                              >
                                View Course →
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Ideas */}
                    {item.projects && item.projects.length > 0 && (
                      <div className="project-ideas">
                        <h4>💡 Practice Projects:</h4>
                        <ul>
                          {item.projects.map((project, pIndex) => (
                            <li key={pIndex}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="dashboard-actions">
          {missing_skills && missing_skills.length > 0 && (
            <button
              onClick={handleTrackSkills}
              className="track-skills-btn"
              disabled={trackingSkills}
            >
              {trackingSkills ? "⏳ Tracking..." : "📌 Track Missing Skills"}
            </button>
          )}
          <button onClick={exportToPDF} className="export-btn">
            📄 Export as PDF
          </button>
          <button onClick={onReset} className="reset-btn">
            ↻ Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
