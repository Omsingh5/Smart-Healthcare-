import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import logoImg from "../assets/logo.png";

// ============================================================
// LOGO SLOT: import logoImg from "../assets/logo.png";
// Then replace <LogoMark /> below with:
// <img src={logoImg} alt="Smart Health Care" style={{ height: 40, width: "auto" }} />
// ============================================================

const COLORS = {
  primary: "#5ba4e5", primaryDark: "#3b82c4",
  accent: "#4fc3b0", accentDark: "#38a89d",
  bg: "#f0f7ff", cardBg: "#ffffff",
  text: "#1e3a5f", muted: "#7a9abf", border: "#d0e4f7",
  softGreen: "#e8faf7",
};

const inputStyle = {
  width: "100%", background: "#f6f9fd",
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 12, padding: "0.75rem 1rem",
  fontSize: "0.9rem", color: COLORS.text, outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: "0.78rem", fontWeight: 600,
  color: COLORS.muted, textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 6,
};

const RegisterDoctor = ({ setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "" });
  const [loading, setLoading] = useState(false);

  const specializations = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Dermatology", "General Medicine", "Psychiatry", "ENT",
    "Ophthalmology", "Gynecology", "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/signup", form);
      const token = res.data.token;
      localStorage.setItem("token", token);
      toast.success("Registration successful! Welcome, Doctor.");
      // Fetch user and set without reload
      const profileRes = await axiosInstance.get("/api/auth/me");
      const user = profileRes.data.user;
      if (setUser) setUser(user);
      navigate("/doctor-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        padding: "1.1rem 2rem", display: "flex", alignItems: "center",
        background: "white", borderBottom: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 8px rgba(91,164,229,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* LOGO */}
          <img src={logoImg} alt="Smart Health Care" style={{ height: 40, width: 40, objectFit: "contain", borderRadius: 8 }} />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: COLORS.text }}>Smart Health Care</span>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{
          width: "100%", maxWidth: 460,
          background: COLORS.cardBg, borderRadius: 24,
          padding: "2.5rem",
          boxShadow: "0 8px 40px rgba(79,195,176,0.12)",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 1rem",
              background: "linear-gradient(135deg,#4fc3b0,#38a89d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", boxShadow: "0 6px 16px rgba(79,195,176,0.3)",
            }}>👨‍⚕️</div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: COLORS.text, marginBottom: 4 }}>
              Doctor Registration
            </h1>
            <p style={{ color: COLORS.muted, fontSize: "0.875rem" }}>
              Join our trusted medical network
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="Dr. John Smith" style={inputStyle}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            </div>

            <div>
              <label style={labelStyle}>Specialization</label>
              <select
                style={{ ...inputStyle, background: "#f6f9fd" }}
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
                onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              >
                <option value="">Select your specialization</option>
                {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="doctor@hospital.com" style={inputStyle}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="••••••••" style={inputStyle}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                required minLength={6}
                onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#c7dff7" : "linear-gradient(135deg,#4fc3b0,#5ba4e5)",
                color: "white", border: "none", borderRadius: 12,
                padding: "0.9rem", fontWeight: 700, fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(79,195,176,0.35)",
                marginTop: 4,
              }}
            >
              {loading ? "Creating account..." : "Register as Doctor →"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              onClick={() => navigate("/")}
              style={{ background: "none", border: "none", color: COLORS.muted, fontSize: "0.85rem", cursor: "pointer" }}
            >
              ← Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDoctor;
