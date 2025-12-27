const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

// Load environment variables FIRST
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Then load passport after env vars are loaded
const passport = require("./config/passport");

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");
const progressRoutes = require("./routes/progress");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "https://ai-skill-gap-analyzer.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Render
app.set("trust proxy", 1);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "skillgap-analyzer-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
