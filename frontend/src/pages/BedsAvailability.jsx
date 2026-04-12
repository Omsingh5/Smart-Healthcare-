import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";

const S = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "white",
    minHeight: "100vh",
    padding: "2rem",
    background: "#0a0f1e",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "1.25rem",
    padding: "1.5rem",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.75rem",
    padding: "0.7rem 1rem",
    color: "white",
    fontSize: "0.875rem",
    outline: "none",
    width: "140px",
  },
  label: {
    display: "block",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.4rem",
  },
  btnPrimary: {
    background: "#2dd4bf",
    color: "#0a0f1e",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.7rem 1.25rem",
    fontWeight: "700",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  btnGreen: {
    background: "rgba(52,211,153,0.15)",
    color: "#34d399",
    border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: "0.75rem",
    padding: "0.7rem 1.25rem",
    fontWeight: "700",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};

const BedsAvailability = () => {
  const [rooms, setRooms] = useState([]);
  const [roomInput, setRoomInput] = useState("");
  const [bedInput, setBedInput] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showFormIndex, setShowFormIndex] = useState(null);
  const [formData, setFormData] = useState({ name: "", age: "", problem: "" });
  const [viewPatient, setViewPatient] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await axiosInstance.get("/api/rooms");
      if (res.data.success)
        setRooms(res.data.rooms.sort((a, b) => a.number - b.number));
    } catch {
      toast.error("Failed to load rooms");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomCreate = async () => {
    const count = parseInt(roomInput);
    if (count > 0) {
      try {
        await axiosInstance.post("/api/rooms", { roomCount: count });
        toast.success("Rooms created");
        setRoomInput("");
        await fetchRooms();
      } catch {
        toast.error("Failed to create rooms");
      }
    } else {
      toast.error("Enter a valid number");
    }
  };

  const handleBedsCreate = async () => {
    const count = parseInt(bedInput);
    if (selectedRoom && count > 0) {
      try {
        await axiosInstance.put(`/api/rooms/${selectedRoom}/beds`, {
          bedCount: count,
        });
        setBedInput("");
        fetchRooms();
      } catch {
        toast.error("Failed to add beds");
      }
    }
  };

  const confirmOccupancy = async (roomId, index) => {
    try {
      await axiosInstance.put(`/api/rooms/${roomId}/beds/${index}`, {
        ...formData,
        occupied: true,
        occupiedAt: new Date().toISOString(),
      });
      toast.success("Bed marked as occupied");
      setShowFormIndex(null);
      fetchRooms();
    } catch {
      toast.error("Failed to update bed");
    }
  };

  const selectedRoomObj = rooms.find((r) => r._id === selectedRoom);
  const availableCount =
    selectedRoomObj?.beds.filter((b) => !b.occupied).length || 0;
  const occupiedCount =
    selectedRoomObj?.beds.filter((b) => b.occupied).length || 0;

  return (
    <Sidebar>
      <div style={S.page}>
        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "900",
              color: "white",
              marginBottom: "0.25rem",
            }}
          >
            Beds Availability
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            Manage hospital rooms and bed occupancy
          </p>
        </div>

        {/* Create Rooms */}
        <div style={{ ...S.card, marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontWeight: "700",
              fontSize: "0.875rem",
              color: "#2dd4bf",
              marginBottom: "1rem",
            }}
          >
            ➕ Create Rooms
          </h3>
          <div className="flex items-end gap-3">
            <div>
              <label style={S.label}>Number of Rooms</label>
              <input
                type="number"
                style={S.input}
                placeholder="e.g. 5"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
            </div>
            <button onClick={handleRoomCreate} style={S.btnPrimary}>
              Create Rooms
            </button>
          </div>
        </div>

        {/* Room Selector */}
        {rooms.length > 0 && (
          <div style={{ ...S.card, marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "1rem",
              }}
            >
              SELECT ROOM
            </h3>
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => {
                    setSelectedRoom(room._id);
                    setShowFormIndex(null);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      selectedRoom === room._id
                        ? "#2dd4bf"
                        : "rgba(255,255,255,0.06)",
                    color:
                      selectedRoom === room._id
                        ? "#0a0f1e"
                        : "rgba(255,255,255,0.7)",
                    border:
                      selectedRoom === room._id
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Room {room.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Beds Section */}
        {selectedRoom && (
          <div style={S.card}>
            {/* Room header with stats */}
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 style={{ fontWeight: "800", fontSize: "1.1rem" }}>
                  Room {selectedRoomObj?.number}
                </h3>
                <div className="flex gap-3 mt-1">
                  <span style={{ fontSize: "0.75rem", color: "#34d399" }}>
                    🟢 {availableCount} available
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#f87171" }}>
                    🔴 {occupiedCount} occupied
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <label style={S.label}>Add Beds</label>
                  <input
                    type="number"
                    style={{ ...S.input, width: "100px" }}
                    placeholder="Count"
                    value={bedInput}
                    onChange={(e) => setBedInput(e.target.value)}
                  />
                </div>
                <button onClick={handleBedsCreate} style={S.btnGreen}>
                  Add Beds
                </button>
              </div>
            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {selectedRoomObj?.beds.map((bed, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <button
                    onClick={() =>
                      bed.occupied
                        ? setViewPatient(bed)
                        : setShowFormIndex(showFormIndex === idx ? null : idx)
                    }
                    style={{
                      width: "100%",
                      padding: "1rem 0.5rem",
                      borderRadius: "1rem",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: bed.occupied
                        ? "rgba(248,113,113,0.15)"
                        : "rgba(52,211,153,0.15)",
                      color: bed.occupied ? "#f87171" : "#34d399",
                      outline: bed.occupied
                        ? "1px solid rgba(248,113,113,0.3)"
                        : "1px solid rgba(52,211,153,0.3)",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem" }}>🛏️</div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Bed {bed.number}
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        marginTop: "0.15rem",
                        opacity: 0.8,
                      }}
                    >
                      {bed.occupied ? "Occupied" : "Free"}
                    </div>
                  </button>

                  {bed.occupied && (
                    <button
                      onClick={async () => {
                        await axiosInstance.put(
                          `/api/rooms/${selectedRoom}/beds/${idx}`,
                          { occupied: false },
                        );
                        fetchRooms();
                      }}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(0,0,0,0.5)",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                      title="Reset"
                    >
                      ↺
                    </button>
                  )}

                  {/* Occupancy Form */}
                  {showFormIndex === idx && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        width: "220px",
                        background: "#0d1321",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "1rem",
                        padding: "1rem",
                        zIndex: 20,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          color: "#2dd4bf",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Patient Info
                      </p>
                      {[
                        ["name", "Patient Name", "text"],
                        ["age", "Age", "number"],
                        ["problem", "Treatment", "text"],
                      ].map(([field, ph, type]) => (
                        <input
                          key={field}
                          type={type}
                          placeholder={ph}
                          style={{
                            display: "block",
                            width: "100%",
                            marginBottom: "0.5rem",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            color: "white",
                            fontSize: "0.8rem",
                            outline: "none",
                          }}
                          value={formData[field]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field]: e.target.value,
                            })
                          }
                        />
                      ))}
                      <button
                        onClick={() => confirmOccupancy(selectedRoom, idx)}
                        style={{
                          ...S.btnPrimary,
                          width: "100%",
                          padding: "0.6rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Patient Modal */}
        {viewPatient && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                background: "#0d1321",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "1.5rem",
                padding: "2rem",
                width: "360px",
                color: "white",
              }}
            >
              <h3
                style={{
                  fontWeight: "800",
                  fontSize: "1.1rem",
                  marginBottom: "1.25rem",
                  color: "#2dd4bf",
                }}
              >
                🛏️ Patient Info
              </h3>
              {[
                ["Name", viewPatient.name],
                ["Age", viewPatient.age],
                ["Treatment", viewPatient.problem],
                ["Admitted", new Date(viewPatient.occupiedAt).toLocaleString()],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                    {v}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setViewPatient(null)}
                style={{
                  marginTop: "1.5rem",
                  width: "100%",
                  padding: "0.75rem",
                  background: "#2dd4bf",
                  color: "#0a0f1e",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default BedsAvailability;
