import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Sidebar = ({ children, onLogout }) => {
  const location = useLocation();
  const [isDoctor, setIsDoctor] = useState(false);
  const [userName, setUserName] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axiosInstance.get("/api/auth/me");
        setIsDoctor(!!res.data.user.specialization);
        setUserName(res.data.user.name || "");
      } catch (err) {
        console.error("Failed to check role");
      }
    };
    fetchRole();
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = isDoctor
    ? [
        { path: "/doctor-dashboard", icon: "🗓️", label: "Appointments" },
        { path: "/beds-availability", icon: "🛏️", label: "Beds Availability" },
        { path: "/profile", icon: "👤", label: "Profile" },
      ]
    : [
        { path: "/patient-dashboard", icon: "🏠", label: "Dashboard" },
        { path: "/view-beds", icon: "🛏️", label: "View Beds" },
        { path: "/profile", icon: "👤", label: "Profile" },
      ];

  return (
    <div
      className="flex min-h-screen"
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: "#0a0f1e",
      }}
    >
      {/* Sidebar */}
      <div
        className={`flex flex-col justify-between border-r transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
        style={{
          background: "#0d1321",
          borderColor: "rgba(255,255,255,0.06)",
          minHeight: "100vh",
        }}
      >
        {/* Top */}
        <div>
          {/* Logo */}
          <div
            className={`flex items-center gap-2 p-5 border-b ${collapsed ? "justify-center" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0"
              style={{ background: "#2dd4bf", color: "#0a0f1e" }}
            >
              +
            </div>
            {!collapsed && (
              <span className="font-bold text-white text-sm">SmartHealth</span>
            )}
          </div>

          {/* User info */}
          {!collapsed && userName && (
            <div
              className="px-4 py-3 mx-3 mt-3 rounded-xl"
              style={{
                background: "rgba(45,212,191,0.08)",
                border: "1px solid rgba(45,212,191,0.15)",
              }}
            >
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Logged in as
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {userName}
              </p>
              <p className="text-xs" style={{ color: "#2dd4bf" }}>
                {isDoctor ? "Doctor" : "Patient"}
              </p>
            </div>
          )}

          {/* Nav Links */}
          <nav className="mt-4 px-3 flex flex-col gap-1">
            {navItems.map(({ path, icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
                style={
                  isActive(path)
                    ? {
                        background: "rgba(45,212,191,0.15)",
                        color: "#2dd4bf",
                        border: "1px solid rgba(45,212,191,0.25)",
                      }
                    : {
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive(path)) e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  if (!isActive(path))
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <span className="text-base">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="px-3 pb-5 flex flex-col gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all"
            style={{
              color: "rgba(255,255,255,0.3)",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
            }
          >
            <span>{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all ${collapsed ? "justify-center" : ""}`}
              style={{ color: "#f87171", border: "1px solid transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                e.currentTarget.style.border =
                  "1px solid rgba(248,113,113,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.border = "1px solid transparent";
              }}
            >
              <span>🚪</span>
              {!collapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto" style={{ background: "#0a0f1e" }}>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
