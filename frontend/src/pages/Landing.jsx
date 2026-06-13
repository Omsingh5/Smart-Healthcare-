import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

// ============================================================
// LOGO SLOT: Place your logo.png in src/assets/ and it will
// automatically appear here. Replace the placeholder below.
// ============================================================
import logoImg from "../assets/logo.png";

const COLORS = {
  primary: "#5ba4e5",
  primaryDark: "#3b82c4",
  accent: "#4fc3b0",
  accentDark: "#38a89d",
  bg: "#f0f7ff",
  cardBg: "#ffffff",
  text: "#1e3a5f",
  muted: "#7a9abf",
  border: "#d0e4f7",
  softBlue: "#e8f2fc",
  softGreen: "#e8faf7",
  softPurple: "#f0eafa",
  softPink: "#fde8f0",
};

const LogoMark = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    }}
  >
    <img
      src={logoImg}
      alt="Smart Health Care"
      style={{
        width: 200,
        height: 100,
        objectFit: "contain",
        borderRadius: 8,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontWeight: 800,
        fontSize: "1.1rem",
        color: COLORS.text,
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      Smart Health Care
    </span>
  </div>
);

// ============================================================
// ENHANCED: SVG Heartbeat & Floating Elements Animation
// ============================================================
const HeaderAnimation = () => (
  <div
    className="header-animation-wrapper"
    style={{
      display: "flex",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      height: "60px",
      overflow: "hidden", // Keeps floating elements contained
    }}
  >
    <style>
      {`
        @media (max-width: 768px) {
          .header-animation-wrapper {
            display: none !important;
          }
        }
        
        /* 1. The Glowing ECG Line */
        .ecg-line-enhanced {
          fill: none;
          stroke: ${COLORS.accent};
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0px 0px 5px ${COLORS.accent});
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: dashLoop 3.5s linear infinite;
        }
        
        @keyframes dashLoop {
          0% { stroke-dashoffset: 400; opacity: 0; }
          10% { opacity: 1; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          90% { stroke-dashoffset: -400; opacity: 0; }
          100% { stroke-dashoffset: -400; opacity: 0; }
        }

        /* 2. Realistic Beating Heart */
        .beating-heart {
          fill: #ff4d6d;
          filter: drop-shadow(0px 3px 6px rgba(255, 77, 109, 0.4));
          animation: heartThump 1.2s infinite;
          transform-origin: center;
        }
        
        /* Double-beat rhythm */
        @keyframes heartThump {
          0% { transform: scale(1); }
          15% { transform: scale(1.25); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        /* 3. Background Pulse Ring */
        .heart-ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #ff4d6d;
          border-radius: 50%;
          animation: rippleOut 1.2s infinite;
          z-index: 0;
        }
        
        @keyframes rippleOut {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        /* 4. Floating Medical Crosses */
        .float-cross {
          position: absolute;
          fill: ${COLORS.primary};
          opacity: 0;
          animation: floatUp 4s infinite ease-in-out;
        }
        
        .fc-1 { left: 25%; animation-delay: 0s; width: 12px; }
        .fc-2 { left: 75%; animation-delay: 1.5s; width: 16px; }
        .fc-3 { left: 45%; animation-delay: 2.5s; width: 10px; }

        @keyframes floatUp {
          0% { transform: translateY(15px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-25px) rotate(90deg); opacity: 0; }
        }
      `}
    </style>

    {/* Floating Background Icons */}
    <svg viewBox="0 0 24 24" className="float-cross fc-1">
      <path d="M19 10h-5V5c0-1.1-.9-2-2-2h-0c-1.1 0-2 .9-2 2v5H5c-1.1 0-2 .9-2 2v0c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h0c1.1 0 2-.9 2-2v-5h5c1.1 0 2-.9 2-2v0C21 10.9 20.1 10 19 10z" />
    </svg>
    <svg viewBox="0 0 24 24" className="float-cross fc-2">
      <path d="M19 10h-5V5c0-1.1-.9-2-2-2h-0c-1.1 0-2 .9-2 2v5H5c-1.1 0-2 .9-2 2v0c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h0c1.1 0 2-.9 2-2v-5h5c1.1 0 2-.9 2-2v0C21 10.9 20.1 10 19 10z" />
    </svg>
    <svg viewBox="0 0 24 24" className="float-cross fc-3">
      <path d="M19 10h-5V5c0-1.1-.9-2-2-2h-0c-1.1 0-2 .9-2 2v5H5c-1.1 0-2 .9-2 2v0c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h0c1.1 0 2-.9 2-2v-5h5c1.1 0 2-.9 2-2v0C21 10.9 20.1 10 19 10z" />
    </svg>

    {/* Main ECG Line */}
    <svg
      width="220"
      height="40"
      viewBox="0 0 220 40"
      style={{ position: "absolute", zIndex: 1 }}
    >
      <path
        className="ecg-line-enhanced"
        d="M 0 20 L 70 20 L 80 5 L 95 35 L 110 10 L 120 25 L 135 15 L 145 20 L 220 20"
      />
    </svg>

    {/* Center Ripple & Heart */}
    <div className="heart-ripple"></div>
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      style={{ position: "relative", zIndex: 2 }}
    >
      <path
        className="beating-heart"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  </div>
);

const inputStyle = {
  width: "100%",
  background: "#f6f9fd",
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  color: COLORS.text,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const btnPrimary = {
  width: "100%",
  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "0.85rem 1rem",
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(91,164,229,0.35)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

// VIEW: "signin" | "register-choose" | "register-doctor" | "register-patient"
const Landing = ({ setUser }) => {
  const navigate = useNavigate();
  const [view, setView] = useState("signin");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/login", loginData);
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
        toast.error("Invalid email or password");
      } else {
        toast.error("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top nav */}
      <header
        style={{
          padding: "1.1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "white",
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 8px rgba(91,164,229,0.07)",
        }}
      >
        <LogoMark />

        {/* ========================================= */}
        {/* INJECTED ANIMATION HERE                   */}
        {/* ========================================= */}
        <HeaderAnimation />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setView("signin")}
            style={{
              background:
                view === "signin"
                  ? `linear-gradient(135deg,${COLORS.primary},${COLORS.accent})`
                  : "transparent",
              color: view === "signin" ? "white" : COLORS.primary,
              border: `1.5px solid ${COLORS.primary}`,
              borderRadius: 10,
              padding: "0.45rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setView("register-choose")}
            style={{
              background: view.startsWith("register")
                ? `linear-gradient(135deg,${COLORS.accent},${COLORS.primary})`
                : "transparent",
              color: view.startsWith("register") ? "white" : COLORS.accent,
              border: `1.5px solid ${COLORS.accent}`,
              borderRadius: 10,
              padding: "0.45rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>
      </header>

      {/* Main split layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          minHeight: "calc(100vh - 150px)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 48,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 960,
          }}
        >
          {/* Left hero panel */}
          <div
            style={{ flex: 1, display: "none", minWidth: 320 }}
            className="hero-panel"
          >
            <div
              style={{
                background: `linear-gradient(145deg, #dceefb 0%, #d0f5f0 100%)`,
                borderRadius: 24,
                padding: "2.5rem",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</div>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 900,
                  color: COLORS.text,
                  lineHeight: 1.25,
                  marginBottom: "0.75rem",
                }}
              >
                Your health,
                <br />
                <span style={{ color: COLORS.primary }}>our priority.</span>
              </h2>
              <p
                style={{
                  color: COLORS.muted,
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  marginBottom: "2rem",
                }}
              >
                Connect with doctors, book appointments, and manage your health
                records — all in one place.
              </p>
              {[
                {
                  icon: "🗓️",
                  text: "Easy appointment booking",
                  color: COLORS.softBlue,
                },
                {
                  icon: "🔒",
                  text: "Secure patient records",
                  color: COLORS.softGreen,
                },
                {
                  icon: "💊",
                  text: "Complete health tracking",
                  color: COLORS.softPurple,
                },
                {
                  icon: "🩺",
                  text: "Expert medical team",
                  color: COLORS.softPink,
                },
              ].map(({ icon, text, color }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: color,
                    borderRadius: 12,
                    padding: "0.7rem 1rem",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                  <span
                    style={{
                      color: COLORS.text,
                      fontSize: "0.88rem",
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right form panel */}
          <div
            style={{
              flex: 1,
              maxWidth: 420,
              width: "100%",
              background: COLORS.cardBg,
              borderRadius: 24,
              padding: "2.5rem",
              boxShadow: "0 8px 40px rgba(91,164,229,0.12)",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {/* ======== SIGN IN VIEW ======== */}
            {view === "signin" && (
              <>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                    👋
                  </div>
                  <h1
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: COLORS.text,
                      marginBottom: 4,
                    }}
                  >
                    Welcome back
                  </h1>
                  <p style={{ color: COLORS.muted, fontSize: "0.875rem" }}>
                    Sign in to Smart Health Care
                  </p>
                </div>

                <form
                  onSubmit={handleLogin}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: COLORS.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      style={inputStyle}
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: COLORS.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      style={inputStyle}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...btnPrimary,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                      marginTop: 4,
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </form>

                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1.25rem",
                    background: COLORS.softBlue,
                    borderRadius: 14,
                    textAlign: "center",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <p
                    style={{
                      color: COLORS.muted,
                      fontSize: "0.82rem",
                      marginBottom: 10,
                    }}
                  >
                    Don't have an account?
                  </p>
                  <button
                    onClick={() => setView("register-choose")}
                    style={{
                      background: `linear-gradient(135deg,${COLORS.accent},${COLORS.primary})`,
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      padding: "0.6rem 1.5rem",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(79,195,176,0.3)",
                    }}
                  >
                    Create an Account
                  </button>
                </div>
              </>
            )}

            {/* ======== REGISTER CHOOSE VIEW ======== */}
            {view === "register-choose" && (
              <>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                    🆕
                  </div>
                  <h1
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: COLORS.text,
                      marginBottom: 4,
                    }}
                  >
                    Create Account
                  </h1>
                  <p style={{ color: COLORS.muted, fontSize: "0.875rem" }}>
                    How would you like to register?
                  </p>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <button
                    onClick={() => navigate("/register-patient")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      background: COLORS.softBlue,
                      border: `2px solid ${COLORS.primary}`,
                      borderRadius: 16,
                      padding: "1.2rem 1.5rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(91,164,229,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `linear-gradient(135deg,${COLORS.primary},${COLORS.accent})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    >
                      🧑‍⚕️
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: COLORS.text,
                          fontSize: "1rem",
                        }}
                      >
                        Register as Patient
                      </div>
                      <div
                        style={{
                          color: COLORS.muted,
                          fontSize: "0.8rem",
                          marginTop: 2,
                        }}
                      >
                        Book appointments & track health
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        color: COLORS.primary,
                        fontSize: "1.2rem",
                      }}
                    >
                      →
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/register-doctor")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      background: COLORS.softGreen,
                      border: `2px solid ${COLORS.accent}`,
                      borderRadius: 16,
                      padding: "1.2rem 1.5rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(79,195,176,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `linear-gradient(135deg,${COLORS.accent},${COLORS.accentDark})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    >
                      👨‍⚕️
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: COLORS.text,
                          fontSize: "1rem",
                        }}
                      >
                        Register as Doctor
                      </div>
                      <div
                        style={{
                          color: COLORS.muted,
                          fontSize: "0.8rem",
                          marginTop: 2,
                        }}
                      >
                        Join our medical network
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        color: COLORS.accent,
                        fontSize: "1.2rem",
                      }}
                    >
                      →
                    </div>
                  </button>
                </div>

                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                  <button
                    onClick={() => setView("signin")}
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.muted,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    ← Already have an account? Sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          color: COLORS.muted,
          fontSize: "0.78rem",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        © 2026 Smart Health Care · Secure · Private · Trusted
      </footer>
    </div>
  );
};

export default Landing;
