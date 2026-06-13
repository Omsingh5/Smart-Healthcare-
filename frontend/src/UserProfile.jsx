import React, { useEffect, useState } from "react";
import axiosInstance from "./utils/axiosInstance";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const S = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1e3a5f",
    minHeight: "100vh",
    padding: "2rem",
    background: "#f0f7ff",
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(91,164,229,0.15)",
    borderRadius: "1.25rem",
    padding: "2rem",
  },
  label: {
    display: "block",
    fontSize: "0.7rem",
    color: "#7a9abf",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.4rem",
  },
  input: (disabled) => ({
    width: "100%",
    background: disabled ? "rgba(255,255,255,0.02)" : "#f0f7ff",
    border: `1px solid ${disabled ? "rgba(91,164,229,0.12)" : "rgba(91,164,229,0.25)"}`,
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    color: disabled ? "#7a9abf" : "#1e3a5f",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  }),
  btnPrimary: {
    background: "#2dd4bf",
    color: "#f0f7ff",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.75rem 2rem",
    fontWeight: "700",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  btnGhost: {
    background: "#f0f7ff",
    color: "#1e3a5f",
    border: "1px solid rgba(91,164,229,0.2)",
    borderRadius: "0.75rem",
    padding: "0.75rem 2rem",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};

const Field = ({ label, children }) => (
  <div>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    email: "",
    address: "",
    contact: "",
    degree: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/auth/me");
        const profileData = res.data.user;
        setUser(profileData);
        setForm({
          name: profileData.name || "",
          age: profileData.age || "",
          gender: profileData.gender || "",
          bloodGroup: profileData.bloodGroup || "",
          email: profileData.email || "",
          address: profileData.address || "",
          contact: profileData.contact || "",
          degree: profileData.degree || "",
          bio: profileData.bio || "",
        });
      } catch (err) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdate = async () => {
    if (!window.confirm("Save changes?")) return;
    if (!form.email.includes("@")) return toast.error("Invalid email");
    if (form.age && isNaN(form.age)) return toast.error("Age must be numeric");
    try {
      const updateData = {
        age: form.age,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: form.address,
        contact: form.contact,
        ...(user.specialization && { degree: form.degree, bio: form.bio }),
      };
      const res = await axiosInstance.put("/api/auth/me", updateData);
      setUser(res.data.user);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading)
    return (
      <div
        style={{
          background: "#f0f7ff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7a9abf",
          fontFamily: "'Segoe UI', system-ui",
        }}
      >
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div
        style={{
          background: "#f0f7ff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7a9abf",
          fontFamily: "'Segoe UI', system-ui",
        }}
      >
        No user data found
      </div>
    );

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Sidebar
      onLogout={() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      }}
    >
      <ToastContainer position="bottom-right" />
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
              color: "#1e3a5f",
              marginBottom: "0.25rem",
            }}
          >
            My Profile
          </h1>
          <p style={{ color: "#7a9abf", fontSize: "0.875rem" }}>
            View and manage your personal information
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          {/* Left — Avatar Card */}
          <div
            style={{
              ...S.card,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1rem",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2dd4bf, #818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                fontWeight: "900",
                color: "#f0f7ff",
              }}
            >
              {initials}
            </div>
            <div>
              <p style={{ fontWeight: "800", fontSize: "1.1rem" }}>
                {form.name}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#2dd4bf",
                  marginTop: "0.2rem",
                }}
              >
                {user.specialization
                  ? `Dr. · ${user.specialization}`
                  : "Patient"}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#7a9abf",
                  marginTop: "0.2rem",
                }}
              >
                {form.email}
              </p>
            </div>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {form.bloodGroup && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    background: "rgba(248,113,113,0.15)",
                    color: "#f87171",
                    border: "1px solid rgba(248,113,113,0.3)",
                  }}
                >
                  🩸 {form.bloodGroup}
                </span>
              )}
              {form.gender && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    background: "rgba(129,140,248,0.15)",
                    color: "#818cf8",
                    border: "1px solid rgba(129,140,248,0.3)",
                  }}
                >
                  {form.gender}
                </span>
              )}
              {form.age && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    background: "rgba(45,212,191,0.15)",
                    color: "#2dd4bf",
                    border: "1px solid rgba(45,212,191,0.3)",
                  }}
                >
                  Age {form.age}
                </span>
              )}
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background: "#f0f7ff",
                margin: "0.5rem 0",
              }}
            />

            <div style={{ width: "100%", textAlign: "left" }}>
              {form.contact && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#7a9abf",
                    marginBottom: "0.4rem",
                  }}
                >
                  📞 {form.contact}
                </p>
              )}
              {form.address && (
                <p
                  style={{ fontSize: "0.8rem", color: "#7a9abf" }}
                >
                  📍 {form.address}
                </p>
              )}
            </div>
          </div>

          {/* Right — Edit Form */}
          <div style={{ ...S.card, gridColumn: "span 2" }}>
            <div className="flex justify-between items-center mb-6">
              <h3
                style={{
                  fontWeight: "800",
                  fontSize: "1rem",
                  color: "#2dd4bf",
                }}
              >
                {editMode ? "✏️ Edit Information" : "📋 Personal Information"}
              </h3>
              {!editMode && (
                <button onClick={() => setEditMode(true)} style={S.btnPrimary}>
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  type="text"
                  value={form.name}
                  disabled
                  style={S.input(true)}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  disabled
                  style={S.input(true)}
                />
              </Field>

              <Field label="Age">
                <input
                  type="text"
                  value={form.age}
                  disabled={!editMode}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  style={S.input(!editMode)}
                />
              </Field>

              <Field label="Gender">
                <select
                  value={form.gender}
                  disabled={!editMode}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  style={{
                    ...S.input(!editMode),
                    cursor: editMode ? "pointer" : "default",
                  }}
                >
                  <option value="" style={{ background: "#f0f7ff" }}>
                    Select
                  </option>
                  <option value="Male" style={{ background: "#f0f7ff" }}>
                    Male
                  </option>
                  <option value="Female" style={{ background: "#f0f7ff" }}>
                    Female
                  </option>
                  <option value="Other" style={{ background: "#f0f7ff" }}>
                    Other
                  </option>
                </select>
              </Field>

              <Field label="Blood Group">
                <select
                  value={form.bloodGroup}
                  disabled={!editMode}
                  onChange={(e) =>
                    setForm({ ...form, bloodGroup: e.target.value })
                  }
                  style={{
                    ...S.input(!editMode),
                    cursor: editMode ? "pointer" : "default",
                  }}
                >
                  <option value="" style={{ background: "#f0f7ff" }}>
                    Select
                  </option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (g) => (
                      <option
                        key={g}
                        value={g}
                        style={{ background: "#f0f7ff" }}
                      >
                        {g}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Contact">
                <input
                  type="text"
                  value={form.contact}
                  disabled={!editMode}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  style={S.input(!editMode)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </Field>

              <div style={{ gridColumn: "span 2" }}>
                <Field label="Address">
                  <input
                    type="text"
                    value={form.address}
                    disabled={!editMode}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    style={S.input(!editMode)}
                    placeholder="Your address"
                  />
                </Field>
              </div>

              {user.specialization && (
                <>
                  <Field label="Degree">
                    <input
                      type="text"
                      value={form.degree}
                      disabled={!editMode}
                      onChange={(e) =>
                        setForm({ ...form, degree: e.target.value })
                      }
                      style={S.input(!editMode)}
                      placeholder="e.g. MBBS, MD"
                    />
                  </Field>

                  <div style={{ gridColumn: "span 2" }}>
                    <Field label="Bio">
                      <textarea
                        value={form.bio}
                        disabled={!editMode}
                        rows={3}
                        onChange={(e) =>
                          setForm({ ...form, bio: e.target.value })
                        }
                        style={{ ...S.input(!editMode), resize: "vertical" }}
                        placeholder="A short bio about yourself..."
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>

            {editMode && (
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditMode(false)} style={S.btnGhost}>
                  Cancel
                </button>
                <button onClick={handleUpdate} style={S.btnPrimary}>
                  Save Changes →
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Sidebar>
  );
};

export default UserProfile;
