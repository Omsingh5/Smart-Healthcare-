import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const RegisterDoctor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/signup", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Registration successful!");
      navigate("/doctor-dashboard");
      window.location.reload(); // refresh user state
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "General Medicine",
    "Psychiatry",
    "Other",
  ];

  return (
    <div
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white px-6 py-12 relative overflow-hidden"
    >
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center text-[#0a0f1e] font-black text-lg">
            +
          </div>
          <span className="font-bold text-lg">SmartHealth</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">👨‍⚕️</div>
            <h2 className="text-2xl font-black">Doctor Registration</h2>
            <p className="text-white/40 text-sm mt-1">
              Join our medical network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. John Smith"
                className="w-full bg-white/5 border border-white/10 focus:border-teal-500 outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-colors"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                Specialization
              </label>
              <select
                className="w-full bg-[#0a0f1e] border border-white/10 focus:border-teal-500 outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                required
              >
                <option value="">Select specialization</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="doctor@hospital.com"
                className="w-full bg-white/5 border border-white/10 focus:border-teal-500 outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-colors"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm mt-2 transition-all duration-300 ${
                loading
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
              }`}
            >
              {loading ? "Registering..." : "Register as Doctor →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/30">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-teal-400 cursor-pointer hover:underline"
              >
                Sign in here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDoctor;