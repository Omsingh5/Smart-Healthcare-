import React from "react";

const DashboardCard = ({ title, value, icon, color = "#2dd4bf" }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "1.25rem",
      padding: "1.5rem",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}
  >
    {icon && (
      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
    )}
    <div style={{ fontSize: "2rem", fontWeight: "900", color }}>{value}</div>
    <div
      style={{
        fontSize: "0.75rem",
        color: "rgba(255,255,255,0.4)",
        marginTop: "0.25rem",
      }}
    >
      {title}
    </div>
  </div>
);

export default DashboardCard;
