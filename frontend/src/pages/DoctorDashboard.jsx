import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Eye, CheckCircle, XCircle, CalendarDays } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

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
    padding: "0.6rem 1rem",
    color: "white",
    fontSize: "0.875rem",
    outline: "none",
  },
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.72rem",
    fontWeight: "600",
    background: `${color}20`,
    color,
    border: `1px solid ${color}40`,
  }),
};

const statusColor = {
  pending: "#fbbf24",
  approved: "#34d399",
  cancelled: "#f87171",
  completed: "#2dd4bf",
};

const DoctorDashboard = ({ onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [otherCharges, setOtherCharges] = useState(0);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    socket.on("appointmentUpdated", (updated) => {
      setAppointments((prev) =>
        prev.map((appt) => (appt._id === updated._id ? updated : appt)),
      );
    });
    socket.on("paymentUpdated", (updated) => {
      setAppointments((prev) =>
        prev.map((appt) => (appt._id === updated._id ? updated : appt)),
      );
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get("/api/doctor/appointments");
      setAppointments(res.data.appointments);
    } catch (err) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, status) => {
    axiosInstance
      .put(`/api/doctor/appointments/${id}`, { status })
      .then((res) => {
        toast.success("Status updated");
        socket.emit("appointmentUpdated", res.data);
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status } : a)),
        );
      })
      .catch(() => toast.error("Update failed"));
  };

  const handleGenerateBill = async (appointmentId) => {
    try {
      const response = await axiosInstance.get(
        `/api/invoice/${appointmentId}`,
        { responseType: "blob" },
      );
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", `invoice-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error("Failed to generate bill");
    }
  };

  const filtered = appointments
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter(
      (a) =>
        !searchTerm ||
        a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((a) => {
      const date = new Date(a.date);
      return (
        (!startDate || date >= new Date(startDate)) &&
        (!endDate || date <= new Date(endDate))
      );
    });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    approved: appointments.filter((a) => a.status === "approved").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <Sidebar onLogout={onLogout}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={S.page}
      >
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
            Appointments
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            Manage and review patient appointments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {Object.entries(counts).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              style={{
                ...S.card,
                padding: "1rem",
                cursor: "pointer",
                border:
                  statusFilter === key
                    ? "1px solid rgba(45,212,191,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                background:
                  statusFilter === key
                    ? "rgba(45,212,191,0.08)"
                    : "rgba(255,255,255,0.04)",
                transition: "all 0.2s",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "900",
                  color: statusFilter === key ? "#2dd4bf" : "white",
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "capitalize",
                  marginTop: "0.2rem",
                }}
              >
                {key}
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...S.card, marginBottom: "1.5rem" }}>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search patient..."
              style={{ ...S.input, flex: 1, minWidth: "180px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="date"
              style={{ ...S.input, colorScheme: "dark" }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              style={{ ...S.input, colorScheme: "dark" }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Patient", "Date", "Time", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "1rem 1.25rem",
                      textAlign: "left",
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: "600",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    No appointments found
                  </td>
                </tr>
              ) : (
                paginated.map((a, i) => (
                  <tr
                    key={a._id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      background:
                        i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(45,212,191,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)")
                    }
                  >
                    <td
                      style={{
                        padding: "0.9rem 1.25rem",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      {a.patientName}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 1.25rem",
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {new Date(a.date).toDateString()}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 1.25rem",
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {a.time}
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span
                        style={S.badge(
                          statusColor[
                            a.checkedUp
                              ? "completed"
                              : a.skipped
                                ? "cancelled"
                                : a.status
                          ] || "#94a3b8",
                        )}
                      >
                        {a.checkedUp
                          ? "Checked Up"
                          : a.skipped
                            ? "Skipped"
                            : a.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPatient(a)}
                          style={{
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            color: "#818cf8",
                            borderRadius: "0.5rem",
                            padding: "0.35rem 0.6rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                          title="View"
                        >
                          👁
                        </button>
                        {a.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(a._id, "approved")
                              }
                              style={{
                                background: "rgba(52,211,153,0.15)",
                                border: "1px solid rgba(52,211,153,0.3)",
                                color: "#34d399",
                                borderRadius: "0.5rem",
                                padding: "0.35rem 0.6rem",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                              }}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(a._id, "cancelled")
                              }
                              style={{
                                background: "rgba(248,113,113,0.15)",
                                border: "1px solid rgba(248,113,113,0.3)",
                                color: "#f87171",
                                borderRadius: "0.5rem",
                                padding: "0.35rem 0.6rem",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                              }}
                              title="Cancel"
                            >
                              ✗
                            </button>
                          </>
                        )}
                        {a.status === "approved" && !a.checkedUp && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(a);
                              setOtherCharges(0);
                              setShowBillingModal(true);
                            }}
                            style={{
                              background: "rgba(45,212,191,0.15)",
                              border: "1px solid rgba(45,212,191,0.3)",
                              color: "#2dd4bf",
                              borderRadius: "0.5rem",
                              padding: "0.35rem 0.75rem",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                            title="Mark as Checked Up & Generate Bill"
                          >
                            ✅ Checked Up
                          </button>
                        )}
                        {a.checkedUp && a.paymentStatus === "unpaid" && (
                          <button
                            onClick={() => handleGenerateBill(a._id)}
                            style={{
                              background: "rgba(99,102,241,0.15)",
                              border: "1px solid rgba(99,102,241,0.3)",
                              color: "#818cf8",
                              borderRadius: "0.5rem",
                              padding: "0.35rem 0.75rem",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            📄 Bill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  background:
                    currentPage === i + 1
                      ? "#2dd4bf"
                      : "rgba(255,255,255,0.08)",
                  color:
                    currentPage === i + 1 ? "#0a0f1e" : "rgba(255,255,255,0.5)",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Patient Detail Modal */}
        {selectedPatient && (
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
                width: "380px",
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
                Patient Details
              </h3>
              {[
                ["Name", selectedPatient.patientName],
                ["Age", selectedPatient.patientAge],
                ["Contact", selectedPatient.patientContact],
                ["Status", selectedPatient.status],
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
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setSelectedPatient(null)}
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

        {/* Billing Modal */}
        {showBillingModal && selectedAppointment && (
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
                width: "400px",
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
                Finalize Billing
              </h3>
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}
                >
                  Doctor Fee
                </p>
                <p style={{ fontWeight: "800", fontSize: "1.25rem" }}>
                  ₹{selectedAppointment?.doctorFee || 500}
                </p>
              </div>
              <label
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Other Charges
              </label>
              <input
                type="number"
                style={{ ...S.input, width: "100%", marginBottom: "1rem" }}
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
              />
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(45,212,191,0.08)",
                  borderRadius: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}
                >
                  Total
                </p>
                <p
                  style={{
                    fontWeight: "800",
                    fontSize: "1.5rem",
                    color: "#2dd4bf",
                  }}
                >
                  ₹
                  {(selectedAppointment?.doctorFee || 500) +
                    Number(otherCharges)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBillingModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axiosInstance.put(
                        `/api/doctor/appointments/${selectedAppointment._id}/checked-up`,
                        { otherCharges },
                      );
                      toast.success("Bill generated");
                      setShowBillingModal(false);
                      setSelectedAppointment(null);
                      fetchAppointments();
                    } catch {
                      toast.error("Failed");
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#2dd4bf",
                    color: "#0a0f1e",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Sidebar>
  );
};

export default DoctorDashboard;
