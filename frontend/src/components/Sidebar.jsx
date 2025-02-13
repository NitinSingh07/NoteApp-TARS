import React from "react";
import { FaHome, FaStar, FaChevronLeft } from "react-icons/fa";

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <div className="w-64 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-md border-r border-gray-200/50 fixed left-0 top-16 transition-all duration-300 shadow-soft">
      <div className="flex flex-col h-full bg-gradient-dots bg-[size:20px_20px]">
        <div className="flex-1 px-3 py-6 space-y-1">
          {/* Menu Items */}
          <button
            onClick={() => onTabChange("home")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${activeTab === "home"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <div className="relative z-10 flex items-center">
              <FaHome className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === "home" ? "text-blue-600" : "text-gray-400"
              }`} />
              <span className="ml-3 font-medium">Home</span>
            </div>
            {activeTab === "home" && (
              <>
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            )}
          </button>

          <button
            onClick={() => onTabChange("favorites")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
              ${
                activeTab === "favorites"
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <FaStar
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === "favorites" ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <span className="font-medium">Favorites</span>
            {activeTab === "favorites" && (
              <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-b from-transparent to-gray-50/50">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-600">© 2024 TARS Notes</p>
            <p className="text-xs text-gray-400 mt-1">All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
