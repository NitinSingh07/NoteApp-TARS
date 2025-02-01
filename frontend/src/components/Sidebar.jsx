import React from "react";
import { FaHome, FaStar } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// Add 'export default' to the Sidebar component
export default function Sidebar({ activeTab, onTabChange }) {
  //   const navigate = useNavigate();
  return (
    <div className="w-64 mt-20 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 pt-16">
      <div className="p-4 space-y-2">
        <button
          onClick={() => onTabChange("home")}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === "home"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaHome className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </button>

        <button
          onClick={() => onTabChange("favorites")}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === "favorites"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaStar className="w-5 h-5" />
          <span className="font-medium">Favorites</span>
        </button>
      </div>
    </div>
  );
}
