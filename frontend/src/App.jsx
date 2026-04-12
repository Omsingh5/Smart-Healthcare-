import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import axiosInstance from "./utils/axiosInstance";
import BedsAvailability from "./pages/BedsAvailability";
import ViewBeds from "./pages/ViewBeds";

// Pages
import Landing from "./pages/Landing";
import RegisterDoctor from "./pages/RegisterDoctor";
import RegisterPatient from "./pages/RegisterPatient";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import UserProfile from "./UserProfile";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axiosInstance.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user); // Make sure it's res.data.user, not res.data
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading)
    return (
      <div
        style={{
          background: "#0a0f1e",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Segoe UI', system-ui",
        }}
      >
        Loading...
      </div>
    );

  return (
    <Router>
      <Routes>
        {/* If not logged in */}
        {!user ? (
          <>
            <Route path="/" element={<Landing setUser={setUser} />} />
            <Route
              path="/register-doctor"
              element={<RegisterDoctor setUser={setUser} />}
            />
            <Route
              path="/register-patient"
              element={<RegisterPatient setUser={setUser} />}
            />
            <Route path="/login" element={<Landing setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : user.specialization ? (
          // If user is doctor
          <>
            <Route
              path="/doctor-dashboard"
              element={<DoctorDashboard onLogout={handleLogout} />}
            />
            <Route path="/beds-availability" element={<BedsAvailability />} />

            <Route
              path="/profile"
              element={<UserProfile token={localStorage.getItem("token")} />}
            />
            <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
          </>
        ) : (
          // If user is patient
          <>
            <Route
              path="/patient-dashboard"
              element={<PatientDashboard onLogout={handleLogout} />}
            />

            <Route path="/view-beds" element={<ViewBeds />} />

            <Route
              path="/profile"
              element={<UserProfile token={localStorage.getItem("token")} />}
            />
            <Route path="*" element={<Navigate to="/patient-dashboard" />} />
          </>
        )}
      </Routes>

      <ToastContainer position="bottom-right" />
    </Router>
  );
};

export default App;
