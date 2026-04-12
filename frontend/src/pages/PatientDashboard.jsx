import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  CalendarHeart,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    color: "white",
    fontSize: "0.875rem",
    outline: "none",
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
    padding: "0.75rem 1.5rem",
    fontWeight: "700",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.06)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.75rem",
    padding: "0.5rem 1rem",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "600",
    background: `${color}20`,
    color: color,
    border: `1px solid ${color}40`,
  }),
};

const PatientDashboard = ({ onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor_id: "",
    date: "",
    time: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [aRes, dRes] = await Promise.all([
        axiosInstance.get("/api/patient/appointments"),
        axiosInstance.get("/api/auth/doctors"),
      ]);
      setAppointments(aRes.data.appointments || []);
      setDoctors(dRes.data.doctors || []);
    } catch (err) {
      toast.error("Data load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on("appointmentUpdated", fetchData);
    return () => socket.off("appointmentUpdated");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctor_id || !form.date || !form.time || !form.notes)
      return toast.error("All fields required");
    try {
      await axiosInstance.post("/appointments", form);
      toast.success("Appointment booked");
      setForm({ doctor_id: "", date: "", time: "", notes: "" });
      fetchData();
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  const handlePayment = async (appointment) => {
    try {
      const res = await axiosInstance.post("/api/payment/create-order", {
        appointmentId: appointment._id,
      });
      const { key, order } = res.data;
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Smart Healthcare",
        description: "Appointment Bill",
        order_id: order.id,
        handler: async function (response) {
          toast.success("Payment successful!");
          await axiosInstance.put(
            `/api/patient/payment-success/${appointment._id}`,
            { paymentId: response.razorpay_payment_id },
          );
          fetchData();
        },
        prefill: { name: appointment.patientName },
        theme: { color: "#2dd4bf" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment failed to start");
    }
  };

  const now = new Date();
  const upcoming = appointments.filter((a) => {
    if (a.status === "pending") return true;
    if (a.status === "approved") {
      const updated = a.updatedAt ? new Date(a.updatedAt) : new Date(a.date);
      return now - updated <= 20 * 60 * 1000;
    }
    return false;
  });
  const history = appointments.filter((a) => !upcoming.includes(a));

  const statusBadge = (a) => {
    if (a.checkedUp)
      return <span style={S.badge("#2dd4bf")}>✓ Checked Up</span>;
    if (a.status === "approved")
      return <span style={S.badge("#34d399")}>✓ Approved</span>;
    if (a.status === "pending")
      return <span style={S.badge("#fbbf24")}>⏳ Pending</span>;
    if (a.status === "cancelled")
      return <span style={S.badge("#f87171")}>✗ Cancelled</span>;
    return <span style={S.badge("#94a3b8")}>{a.status}</span>;
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
            Patient Portal
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            Manage your appointments and health records
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Appointments",
              value: appointments.length,
              color: "#2dd4bf",
              icon: "📋",
            },
            {
              label: "Upcoming",
              value: upcoming.length,
              color: "#34d399",
              icon: "🗓️",
            },
            {
              label: "Completed",
              value: history.filter((a) => a.checkedUp).length,
              color: "#818cf8",
              icon: "✅",
            },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ ...S.card }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                {icon}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color }}>
                {value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "0.25rem",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Book Appointment */}
        <div style={{ ...S.card, marginBottom: "2rem" }}>
          <h3
            style={{
              fontWeight: "800",
              fontSize: "1rem",
              marginBottom: "1.25rem",
              color: "#2dd4bf",
            }}
          >
            📅 Book Appointment
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label style={S.label}>Doctor</label>
                <select
                  style={{ ...S.input, cursor: "pointer" }}
                  value={form.doctor_id}
                  onChange={(e) =>
                    setForm({ ...form, doctor_id: e.target.value })
                  }
                >
                  <option value="" style={{ background: "#0a0f1e" }}>
                    Select Doctor
                  </option>
                  {doctors.map((doc) => (
                    <option
                      key={doc._id}
                      value={doc._id}
                      style={{ background: "#0a0f1e" }}
                    >
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Date</label>
                <input
                  type="date"
                  style={{ ...S.input, colorScheme: "dark" }}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label style={S.label}>Time</label>
                <input
                  type="time"
                  style={{ ...S.input, colorScheme: "dark" }}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-4">
              <label style={S.label}>Describe your problem</label>
              <textarea
                rows={3}
                style={{ ...S.input, resize: "vertical" }}
                placeholder="Describe your symptoms or reason for visit..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button type="submit" style={S.btnPrimary}>
              Book Appointment →
            </button>
          </form>
        </div>

        {/* Upcoming */}
        <div className="mb-8">
          <h3
            style={{
              fontWeight: "800",
              fontSize: "1rem",
              marginBottom: "1rem",
              color: "white",
            }}
          >
            🗓️ Upcoming Appointments
          </h3>
          {loading ? (
            <div
              style={{
                ...S.card,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Loading...
            </div>
          ) : upcoming.length === 0 ? (
            <div
              style={{
                ...S.card,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                padding: "2.5rem",
              }}
            >
              No upcoming appointments
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((a) => (
                <div
                  key={a._id}
                  style={S.card}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p style={{ fontWeight: "700", marginBottom: "0.25rem" }}>
                      {a.doctorName || a.doctor_id?.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {new Date(a.date).toLocaleDateString()} at {a.time}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.5)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {a.notes}
                    </p>
                  </div>
                  {statusBadge(a)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h3
            style={{
              fontWeight: "800",
              fontSize: "1rem",
              marginBottom: "1rem",
              color: "white",
            }}
          >
            📋 Appointment History
          </h3>
          {history.length === 0 ? (
            <div
              style={{
                ...S.card,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                padding: "2.5rem",
              }}
            >
              No past appointments
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((a) => (
                <div key={a._id} style={S.card}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p style={{ fontWeight: "700", marginBottom: "0.25rem" }}>
                        {a.doctorName || a.doctor_id?.name}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {new Date(a.date).toLocaleDateString()} at {a.time}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.5)",
                          marginTop: "0.25rem",
                        }}
                      >
                        {a.notes}
                      </p>
                      {a.checkedUp && (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            padding: "0.75rem",
                            background: "rgba(45,212,191,0.06)",
                            border: "1px solid rgba(45,212,191,0.15)",
                            borderRadius: "0.75rem",
                          }}
                        >
                          <p style={{ fontSize: "0.8rem", color: "#2dd4bf" }}>
                            Total: ₹{a.totalAmount} · Payment: {a.paymentStatus}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <a
                              href={`/api/invoice/${a._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button style={S.btnSecondary}>📄 Invoice</button>
                            </a>
                            {a.paymentStatus === "unpaid" && (
                              <button
                                onClick={() => handlePayment(a)}
                                style={{
                                  ...S.btnPrimary,
                                  padding: "0.4rem 1rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                💳 Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {statusBadge(a)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Sidebar>
  );
};

export default PatientDashboard;
