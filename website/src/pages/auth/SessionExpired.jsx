import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { Hourglass, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export const SessionExpired = () => {
  const { clearSessionExpiry } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    clearSessionExpiry();
    navigate("/auth/login", { replace: true });
  };

  return (
    <AuthLayout
      title="Session Timed Out"
      subtitle="For your protection, inactive digital wallets are signed out."
    >
      <div className="text-center space-y-6 py-4">
        {/* Hourglass Container */}
        <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-100 dark:bg-amber-950/20 rounded-full animate-pulse" />
          <div className="relative h-16 w-16 bg-amber-100 dark:bg-amber-950/30 rounded-full flex items-center justify-center border border-amber-250 dark:border-amber-900/50">
            <Hourglass className="h-8 w-8 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-250">
            Session Expired
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Your connection session has ended due to inactivity. Your canteens, orders, and tokens are secure—please log in again.
          </p>
        </div>

        <div className="pt-2">
          <motion.button
            onClick={handleSignIn}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            className="premium-button w-full"
          >
            <LogIn className="h-4 w-4" />
            Sign In Again
          </motion.button>
        </div>
      </div>
    </AuthLayout>
  );
};
