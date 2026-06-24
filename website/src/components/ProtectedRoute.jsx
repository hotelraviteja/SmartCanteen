import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, isLocked, isSessionExpired, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-brand dark:border-neutral-800 dark:border-t-brand"></div>
          <p className="font-heading text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-450">
            Initializing CampusBite...
          </p>
        </div>
      </div>
    );
  }

  // Intercept special security statuses
  if (isLocked) {
    return <Navigate to="/auth/locked" replace />;
  }

  if (isSessionExpired) {
    return <Navigate to="/auth/session-expired" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Role validation checks
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
