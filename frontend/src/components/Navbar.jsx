import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Get email from localStorage if not available in user object
  const userEmail = user?.email || localStorage.getItem("userEmail");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-md">
      <Link
        to="/"
        className="text-xl font-bold hover:text-blue-200 transition-colors"
      >
        NoteKeeper
      </Link>

      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
              <span className="hidden md:inline">{userEmail || "User"}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                <div className="px-4 py-2 text-gray-600 border-b border-gray-100 break-all">
                  {userEmail || "No email available"}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
