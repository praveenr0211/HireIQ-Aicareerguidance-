import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://aiskillgapanalyzer.onrender.com/api";
const AUTH_BASE_URL =
  process.env.REACT_APP_AUTH_URL ||
  "https://aiskillgapanalyzer.onrender.com/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const response = await axios.get(`${AUTH_BASE_URL}/user`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Upload resume file
 */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Analyze skills
 */
export const analyzeSkills = async (
  resumeText,
  jobRole = null,
  jobDescription = null
) => {
  const response = await api.post("/analyze", {
    resumeText,
    jobRole,
    jobDescription,
  });

  return response.data;
};

/**
 * Get user's analysis history
 */
export const getHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/history`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get specific analysis by ID
 */
export const getAnalysisById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/history/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Delete analysis by ID
 */
export const deleteAnalysis = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/history/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Compare multiple analyses
 */
export const compareAnalyses = async (analysisIds) => {
  const response = await axios.post(
    `${API_BASE_URL}/history/compare`,
    { ids: analysisIds },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Get user's skill progress
 */
export const getProgress = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Update skill progress
 */
export const updateProgress = async (skillName, status, notes = "") => {
  const response = await axios.post(
    `${API_BASE_URL}/progress/update`,
    { skill_name: skillName, status, notes },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Get user achievements
 */
export const getAchievements = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress/achievements`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get progress statistics
 */
export const getProgressStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress/stats`, {
    withCredentials: true,
  });
  return response.data;
};

export default api;
