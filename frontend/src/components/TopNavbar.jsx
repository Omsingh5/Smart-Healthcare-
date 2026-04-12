// frontend/src/components/TopNavbar.jsx
import React from "react";

const TopNavbar = () => {
  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">Smart Healthcare</h1>
      <div className="text-sm text-gray-600">Welcome, Doctor</div>
    </header>
  );
};

export default TopNavbar;
