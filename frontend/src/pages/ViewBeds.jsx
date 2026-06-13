import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const COLORS = {
  primary: "#5ba4e5", accent: "#4fc3b0",
  text: "#1e3a5f", muted: "#7a9abf",
  bg: "#f0f7ff", cardBg: "#ffffff", border: "#d0e4f7",
  green: "#34d399", red: "#f87171", purple: "#818cf8",
};

const S = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: COLORS.bg, minHeight: "100vh",
    padding: "2rem", color: COLORS.text,
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "1.25rem", padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(91,164,229,0.07)",
  },
};

const ViewBeds = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Fetch all registered doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get("/api/auth/doctors");
        setDoctors(res.data.doctors || []);
      } catch (err) {
        toast.error("Failed to load doctors list");
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch beds for the selected doctor using the per-doctor backend route
  const fetchDoctorBeds = async (doctorId) => {
    setLoading(true);
    setRooms([]);
    try {
      const res = await axiosInstance.get(`/api/rooms/doctor/${doctorId}`);
      if (res.data.success) {
        setRooms(res.data.rooms || []);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error("Failed to fetch doctor beds:", err);
      setRooms([]);
      toast.error("Could not load bed data for this doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorBeds(doctor._id);
  };

  const totalBeds = rooms.reduce((acc, r) => acc + (r.beds?.length || 0), 0);
  const availableBeds = rooms.reduce(
    (acc, r) => acc + (r.beds?.filter((b) => !b.occupied).length || 0), 0
  );
  const occupiedBeds = totalBeds - availableBeds;

  return (
    <Sidebar>
      <div style={S.page}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.25rem", color: COLORS.text }}>
            🛏️ Bed Availability
          </h1>
          <p style={{ color: COLORS.muted, fontSize: "0.875rem" }}>
            Select a doctor to check their ward's real-time bed status
          </p>
        </div>

        {/* Step 1 — Select Doctor */}
        <div style={{ ...S.card, marginBottom: "1.5rem" }}>
          <h3 style={{
            fontWeight: 700, fontSize: "0.75rem", color: COLORS.primary,
            marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Step 1 — Choose a Doctor
          </h3>

          {doctorsLoading ? (
            <div style={{ color: COLORS.muted, fontSize: "0.875rem", padding: "1rem 0" }}>
              ⏳ Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div style={{
              padding: "1.5rem", background: "#f6f9fd", borderRadius: 12,
              color: COLORS.muted, fontSize: "0.875rem", textAlign: "center",
            }}>
              No doctors registered yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?._id === doc._id;
                return (
                  <button
                    key={doc._id}
                    onClick={() => handleSelectDoctor(doc)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "0.65rem 1.1rem", borderRadius: 14,
                      border: isSelected ? `2px solid ${COLORS.primary}` : `1.5px solid ${COLORS.border}`,
                      background: isSelected
                        ? "linear-gradient(135deg,#e8f2fc,#e8faf7)"
                        : "#f6f9fd",
                      color: COLORS.text, cursor: "pointer",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.875rem", transition: "all 0.15s",
                      boxShadow: isSelected ? "0 4px 12px rgba(91,164,229,0.18)" : "none",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: isSelected
                        ? "linear-gradient(135deg,#5ba4e5,#4fc3b0)"
                        : "rgba(91,164,229,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 900,
                      color: isSelected ? "white" : COLORS.primary,
                    }}>
                      {doc.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>
                        Dr. {doc.name}
                      </div>
                      {doc.specialization && (
                        <div style={{ fontSize: "0.72rem", color: COLORS.muted, marginTop: 2 }}>
                          {doc.specialization}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span style={{ color: COLORS.primary, fontSize: "1rem", marginLeft: 4 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty state before doctor selected */}
        {!selectedDoctor && !doctorsLoading && (
          <div style={{
            ...S.card, textAlign: "center", padding: "3.5rem",
            border: `2px dashed ${COLORS.border}`, background: "#f6f9fd",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏥</div>
            <p style={{ color: COLORS.muted, fontSize: "0.925rem", fontWeight: 500 }}>
              Select a doctor above to see their bed availability
            </p>
          </div>
        )}

        {/* Step 2 — Show beds for selected doctor */}
        {selectedDoctor && (
          <>
            {/* Doctor banner */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "linear-gradient(135deg,#e8f2fc,#e8faf7)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: "1rem 1.5rem", marginBottom: "1.5rem",
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "linear-gradient(135deg,#5ba4e5,#4fc3b0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.3rem", fontWeight: 900, color: "white",
                boxShadow: "0 4px 12px rgba(91,164,229,0.25)",
              }}>
                {selectedDoctor.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "1.05rem", color: COLORS.text }}>
                  Dr. {selectedDoctor.name}
                </p>
                <p style={{ fontSize: "0.8rem", color: COLORS.muted }}>
                  {selectedDoctor.specialization || "Doctor"} · Live ward bed status
                </p>
              </div>
              <button
                onClick={() => { setSelectedDoctor(null); setRooms([]); }}
                style={{
                  marginLeft: "auto", background: "white", border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer",
                  fontSize: "0.8rem", color: COLORS.muted, fontWeight: 600,
                }}
              >
                ← Change
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: "1.5rem" }}>
              {[
                { label: "Total Beds", value: totalBeds, color: COLORS.purple },
                { label: "Available", value: availableBeds, color: COLORS.green },
                { label: "Occupied", value: occupiedBeds, color: COLORS.red },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ ...S.card, padding: "1.25rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color }}>
                    {loading ? "—" : value}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginTop: "0.2rem" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginBottom: "1.25rem" }}>
              {[[COLORS.green, "🟢 Available"], [COLORS.red, "🔴 Occupied"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "0.8rem", color: COLORS.muted }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Rooms & Beds */}
            {loading ? (
              <div style={{ ...S.card, textAlign: "center", color: COLORS.muted, padding: "3rem" }}>
                ⏳ Loading bed data for Dr. {selectedDoctor.name}...
              </div>
            ) : rooms.length === 0 ? (
              <div style={{
                ...S.card, textAlign: "center", padding: "3rem",
                border: `2px dashed ${COLORS.border}`, background: "#f6f9fd",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏥</div>
                <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>
                  Dr. {selectedDoctor.name} hasn't set up any rooms or beds yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {rooms.map((room) => {
                  const avail = room.beds?.filter((b) => !b.occupied).length || 0;
                  const total = room.beds?.length || 0;
                  return (
                    <div key={room._id} style={S.card}>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: "1rem",
                      }}>
                        <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: COLORS.text }}>
                          Room {room.number}
                        </h3>
                        <div style={{ display: "flex", gap: 14 }}>
                          <span style={{ fontSize: "0.78rem", color: COLORS.green, fontWeight: 600 }}>
                            🟢 {avail} free
                          </span>
                          <span style={{ fontSize: "0.78rem", color: COLORS.red, fontWeight: 600 }}>
                            🔴 {total - avail} occupied
                          </span>
                        </div>
                      </div>

                      {/* Occupancy bar */}
                      <div style={{
                        height: 5, background: "rgba(91,164,229,0.1)",
                        borderRadius: 999, marginBottom: "1rem", overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", borderRadius: 999, transition: "width 0.5s",
                          width: `${total > 0 ? ((total - avail) / total) * 100 : 0}%`,
                          background: total - avail === 0
                            ? COLORS.green
                            : avail === 0
                            ? COLORS.red
                            : "linear-gradient(to right, #34d399, #f87171)",
                        }} />
                      </div>

                      {/* Bed grid */}
                      {total === 0 ? (
                        <p style={{ color: COLORS.muted, fontSize: "0.8rem" }}>No beds in this room yet.</p>
                      ) : (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                          gap: 10,
                        }}>
                          {room.beds.map((bed, index) => (
                            <div
                              key={index}
                              style={{
                                borderRadius: 12, padding: "0.65rem 0.25rem",
                                textAlign: "center", fontSize: "0.72rem", fontWeight: 700,
                                background: bed.occupied
                                  ? "rgba(248,113,113,0.1)"
                                  : "rgba(52,211,153,0.1)",
                                color: bed.occupied ? COLORS.red : COLORS.green,
                                border: `1px solid ${bed.occupied
                                  ? "rgba(248,113,113,0.25)"
                                  : "rgba(52,211,153,0.25)"}`,
                                cursor: "default",
                              }}
                              title={bed.occupied
                                ? `Occupied${bed.name ? ` — ${bed.name}` : ""}`
                                : "Available"}
                            >
                              <div style={{ fontSize: "1.2rem" }}>🛏</div>
                              <div style={{ marginTop: 3 }}>Bed {bed.number}</div>
                              <div style={{ fontSize: "0.62rem", opacity: 0.85, marginTop: 2 }}>
                                {bed.occupied ? "Taken" : "Free"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default ViewBeds;
