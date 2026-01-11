import axios from "axios";

// IMPORTANT:
// - Configure REACT_APP_API_URL in your frontend environment.
// - Example: REACT_APP_API_URL=http://localhost:5000/api
// - In production, set it to your deployed backend base URL (must include /api).
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kv_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
