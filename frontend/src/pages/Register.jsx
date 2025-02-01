import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        {
          email,
          password,
        }
      );

      // Store email in localStorage and pass to register function
      localStorage.setItem("userEmail", email);
      await register(response.data.token, email);

      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      if (errorMessage.includes("Email already registered")) {
        setEmail(""); // Clear email field on duplicate
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden animate-gradient-xy">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        {/* Meteors */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`meteor-${i}`}
            className="absolute h-0.5 w-0.5 bg-white rounded-full animate-meteor"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute bg-white/[0.08] rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full mx-4 perspective-1000">
        <div
          className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-card-hover border border-white/10 
          transition-all duration-500 hover:scale-[1.02] animate-tilt group"
        >
          {/* Add shine effect */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent 
            animate-shine opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>

          <div className="relative">
            <div className="mb-8 text-center">
              <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 mb-2">
                Create Account
              </h2>
              <p className="text-gray-400/80 text-lg">Join us today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl 
                    focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                    transition-all duration-300 text-white placeholder-gray-400
                    hover:bg-black/30 shadow-input"
                    placeholder="Enter your email"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none
                  opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl 
                    focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                    transition-all duration-300 text-white placeholder-gray-400
                    hover:bg-black/30 shadow-input"
                    placeholder="Create a password"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none
                  opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 
                bg-[length:200%_200%] animate-shine text-white rounded-xl
                transform transition-all duration-300 hover:scale-[1.02] 
                hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                shine-effect"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="relative">
                      <span className="animate-pulse">Creating Account</span>
                      <span className="animate-pulse delay-100">.</span>
                      <span className="animate-pulse delay-200">.</span>
                      <span className="animate-pulse delay-300">.</span>
                    </span>
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 relative">
                <span className="bg-black/20 px-4 relative z-10">
                  Already have an account?
                </span>
                <span className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-400/50 to-transparent top-1/2 -z-1"></span>
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 text-purple-400 hover:text-purple-300 font-medium 
                transition-all duration-300 border-b-2 border-transparent
                hover:border-purple-300 shine-effect"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
