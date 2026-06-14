import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/api/auth/login", formData);
      const { token } = res.data;
      if (!token) {
        toast.error("No token received");
        return;
      }

      localStorage.setItem("token", token);

      const profileRes = await axiosInstance.get("/api/auth/me");
      const user = profileRes.data.user;

      setUser(user);

      navigate(
        user.specialization ? "/doctor-dashboard" : "/patient-dashboard",
      );
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Invalid credentials");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏥</div>
          <h2 className="text-3xl font-bold text-indigo-700">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to Smart Health Care
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Register links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">Don't have an account?</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/register-patient"
              className="flex-1 text-center py-2 px-4 rounded-lg border-2 border-indigo-500 text-indigo-600 font-medium hover:bg-indigo-50 transition-all text-sm"
            >
              Register as Patient
            </Link>
            <Link
              to="/register-doctor"
              className="flex-1 text-center py-2 px-4 rounded-lg border-2 border-green-500 text-green-600 font-medium hover:bg-green-50 transition-all text-sm"
            >
              Register as Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
