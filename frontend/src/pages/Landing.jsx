import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);

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
    <div
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      className="min-h-screen flex bg-[#0a0f1e] text-white"
    >
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-blue-900/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center text-[#0a0f1e] font-black text-lg">
              +
            </div>
            <span className="font-bold text-lg">SmartHealth</span>
          </div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            Welcome
            <br />
            back to
            <br />
            <span className="text-teal-400">your portal</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Access your appointments, patient records, and health information
            securely.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: "🗓️", text: "Instant appointment booking" },
            { icon: "🔒", text: "Secure & private records" },
            { icon: "💊", text: "Complete health tracking" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 text-sm text-white/50"
            >
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center text-[#0a0f1e] font-black text-lg">
              +
            </div>
            <span className="font-bold text-lg">SmartHealth</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Sign in</h1>
          <p className="text-white/40 text-sm mb-10">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-teal-500 outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-colors"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-teal-500 outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-colors"
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
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                loading
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
              }`}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Register Section */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            {!showRegisterOptions ? (
              <p className="text-xs text-white/30">
                Don't have an account?{" "}
                <span
                  onClick={() => setShowRegisterOptions(true)}
                  className="text-teal-400 cursor-pointer hover:underline"
                >
                  Register here
                </span>
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/40 mb-3">Register as:</p>
                <button
                  onClick={() => navigate("/register-patient")}
                  className="w-full py-3 rounded-xl border border-teal-500/50 text-teal-400 text-sm font-semibold hover:bg-teal-500/10 transition-all"
                >
                  🧑‍⚕️ Register as Patient
                </button>
                <button
                  onClick={() => navigate("/register-doctor")}
                  className="w-full py-3 rounded-xl border border-blue-500/50 text-blue-400 text-sm font-semibold hover:bg-blue-500/10 transition-all"
                >
                  👨‍⚕️ Register as Doctor
                </button>
                <p
                  onClick={() => setShowRegisterOptions(false)}
                  className="text-xs text-white/20 cursor-pointer hover:text-white/40 mt-2"
                >
                  ← Back to login
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
