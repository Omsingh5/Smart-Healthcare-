// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", // fallback for dev
  withCredentials: true, // allow sending cookies if you use them
});

// ✅ Attach JWT token on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 (unauthorized) globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      // Optional: show toast before redirect
      alert("Session expired. Redirecting to login.");

      // Force reload login page
      window.location.href = "/";  // ✅ goes to Landing page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
