import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Updated import statement

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedEmail = localStorage.getItem("userEmail");
    return storedEmail ? { email: storedEmail } : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (token && storedEmail) {
      setUser({ email: storedEmail });
      setIsAuthenticated(true);
    }
  }, [token]);

  const login = (newToken, email) => {
    try {
      if (!newToken || !email) {
        throw new Error('Token and email are required for login');
      }

      // Verify token is valid JWT
      const decoded = jwtDecode(newToken);
      console.log('Decoded token data:', decoded);

      // Store user data
      localStorage.setItem("token", newToken);
      localStorage.setItem("userEmail", email);
      
      // Update state
      setToken(newToken);
      setUser({ email: email });
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Login error:', error);
      // Clean up any partial state
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (newToken, email) => {
    if (!email) {
      throw new Error('Email is required for registration');
    }
    localStorage.setItem("token", newToken);
    localStorage.setItem("userEmail", email);
    setToken(newToken);
    setUser({ email: email });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
