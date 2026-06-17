import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { VerifyEmail } from "../pages/auth/VerifyEmail";
import { OtpVerify } from "../pages/auth/OtpVerify";
import { Locked } from "../pages/auth/Locked";
import { SessionExpired } from "../pages/auth/SessionExpired";
import { Dashboard } from "../pages/Dashboard";
import { motion, AnimatePresence } from "framer-motion";

// Framer Motion Animation Settings for form switching
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

export const AuthRoutes = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Entry redirection */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/login" replace />
          } 
        />

        {/* Public auth pages wrapped in transition containers */}
        <Route path="/auth/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/auth/register" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/auth/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
        <Route path="/auth/reset-password" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />
        <Route path="/auth/verify-email" element={<AnimatedPage><VerifyEmail /></AnimatedPage>} />
        <Route path="/auth/verify-otp" element={<AnimatedPage><OtpVerify /></AnimatedPage>} />
        
        {/* Security pages */}
        <Route path="/auth/locked" element={<AnimatedPage><Locked /></AnimatedPage>} />
        <Route path="/auth/session-expired" element={<AnimatedPage><SessionExpired /></AnimatedPage>} />

        {/* Guarded dashboard application */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AnimatedPage>
                <Dashboard />
              </AnimatedPage>
            </ProtectedRoute>
          }
        />

        {/* Fallback to sign-in */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
};
