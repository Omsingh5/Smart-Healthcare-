import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import logoImg from "../assets/logo.png";

const COLORS = {
  primary: "#5ba4e5",
  accent: "#4fc3b0",
  text: "#1e3a5f",
  muted: "#7a9abf",
  sidebar: "#ffffff",
  sidebarBorder: "#d0e4f7",
  activeBackground: "#e8f2fc",
  activeBorder: "#5ba4e5",
  activeText: "#3b82c4",
  hoverBg: "#f0f7ff",
  bg: "#f0f7ff",
};

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
        { path: "/profile", icon: "👤", label: "My Profile" },
      ]
    : [
        { path: "/patient-dashboard", icon: "🏠", label: "Dashboard" },
        { path: "/view-beds", icon: "🛏️", label: "View Beds" },
        { path: "/profile", icon: "👤", label: "My Profile" },
      ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: COLORS.bg,
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? 64 : 240,
          minHeight: "100vh",
          background: COLORS.sidebar,
          borderRight: `1px solid ${COLORS.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.25s ease",
          flexShrink: 0,
          boxShadow: "2px 0 12px rgba(91,164,229,0.07)",
        }}
      >
        {/* Top */}
        <div>
          {/* Logo Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              padding: collapsed ? "1.2rem 0" : "1.2rem 1.2rem",
              justifyContent: "center",
              borderBottom: `1px solid ${COLORS.sidebarBorder}`,
            }}
          >
            {/* LOGO */}
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
            {!collapsed && (
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
            )}
          </div>

          {/* User info chip */}
          {!collapsed && userName && (
            <div
              style={{
                margin: "12px 12px 0",
                padding: "0.65rem 0.9rem",
                background: "linear-gradient(135deg,#e8f2fc,#e8faf7)",
                borderRadius: 12,
                border: `1px solid ${COLORS.sidebarBorder}`,
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  color: COLORS.muted,
                  marginBottom: 2,
                }}
              >
                Logged in as
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: COLORS.text,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: isDoctor ? COLORS.accent : COLORS.primary,
                  marginTop: 1,
                }}
              >
                {isDoctor ? "🩺 Doctor" : "🧑 Patient"}
              </p>
            </div>
          )}

          {/* Nav */}
          <nav
            style={{
              marginTop: 12,
              padding: "0 8px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {navItems.map(({ path, icon, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  padding: "0.65rem 0.85rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 12,
                  textDecoration: "none",
                  background: isActive(path)
                    ? COLORS.activeBackground
                    : "transparent",
                  color: isActive(path) ? COLORS.activeText : COLORS.muted,
                  fontWeight: isActive(path) ? 700 : 500,
                  fontSize: "0.875rem",
                  border: isActive(path)
                    ? `1px solid ${COLORS.activeBorder}40`
                    : "1px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(path)) {
                    e.currentTarget.style.background = COLORS.hoverBg;
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(path)) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = COLORS.muted;
                  }
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div
          style={{
            padding: "0 8px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              padding: "0.65rem 0.85rem",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 12,
              background: "none",
              border: "1px solid transparent",
              cursor: "pointer",
              color: COLORS.muted,
              fontSize: "0.875rem",
              width: "100%",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.hoverBg;
              e.currentTarget.style.color = COLORS.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = COLORS.muted;
            }}
          >
            <span>{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 10,
                padding: "0.65rem 0.85rem",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 12,
                background: "none",
                border: "1px solid transparent",
                cursor: "pointer",
                color: "#e05252",
                fontSize: "0.875rem",
                fontWeight: 600,
                width: "100%",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fde8e8";
                e.currentTarget.style.border = "1px solid #f5c6c6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
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
      <div style={{ flex: 1, overflow: "auto", background: COLORS.bg }}>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
