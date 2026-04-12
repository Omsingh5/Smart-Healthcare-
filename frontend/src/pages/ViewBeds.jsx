import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

const ViewBeds = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await axiosInstance.get("/api/rooms/public");
      if (res.data.success) setRooms(res.data.rooms);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const totalBeds = rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const availableBeds = rooms.reduce(
    (acc, r) => acc + r.beds.filter((b) => !b.occupied).length,
    0,
  );
  const occupiedBeds = totalBeds - availableBeds;

  return (
    <Sidebar>
      <div
        style={{
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          background: "#0a0f1e",
          minHeight: "100vh",
          padding: "2rem",
          color: "white",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "900",
              marginBottom: "0.25rem",
            }}
          >
            Bed Availability
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            Real-time hospital bed status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Beds", value: totalBeds, color: "#818cf8" },
            { label: "Available", value: availableBeds, color: "#34d399" },
            { label: "Occupied", value: occupiedBeds, color: "#f87171" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1.25rem",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: "900", color }}>
                {loading ? "—" : value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "0.2rem",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-5 mb-6">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#34d399",
              }}
            />
            <span
              style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}
            >
              Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#f87171",
              }}
            />
            <span
              style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}
            >
              Occupied
            </span>
          </div>
        </div>

        {/* Rooms */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              padding: "3rem",
            }}
          >
            Loading...
          </div>
        ) : rooms.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1.25rem",
              padding: "3rem",
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            No rooms available
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {rooms.map((room) => {
              const avail = room.beds.filter((b) => !b.occupied).length;
              const total = room.beds.length;
              return (
                <div
                  key={room._id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 style={{ fontWeight: "800", fontSize: "0.95rem" }}>
                      Room {room.number}
                    </h3>
                    <div className="flex gap-3">
                      <span style={{ fontSize: "0.75rem", color: "#34d399" }}>
                        🟢 {avail} free
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#f87171" }}>
                        🔴 {total - avail} occupied
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: "4px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "999px",
                      marginBottom: "1rem",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${total > 0 ? ((total - avail) / total) * 100 : 0}%`,
                        background:
                          "linear-gradient(to right, #34d399, #f87171)",
                        borderRadius: "999px",
                        transition: "width 0.5s",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {room.beds.map((bed, index) => (
                      <div
                        key={index}
                        style={{
                          borderRadius: "0.75rem",
                          padding: "0.6rem 0.25rem",
                          textAlign: "center",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          background: bed.occupied
                            ? "rgba(248,113,113,0.15)"
                            : "rgba(52,211,153,0.15)",
                          color: bed.occupied ? "#f87171" : "#34d399",
                          border: `1px solid ${bed.occupied ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)"}`,
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: "1rem" }}>🛏</div>
                        <div>{bed.number}</div>
                        <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                          {bed.occupied ? "Taken" : "Free"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default ViewBeds;
