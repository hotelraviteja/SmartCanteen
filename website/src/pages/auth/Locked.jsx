import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { Toast } from "../../components/Toast";
import { ShieldX, KeyRound, Unlock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Locked = () => {
  const { unlockAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleUnlock = () => {
    setLoading(true);
    setToast(null);
    setTimeout(() => {
      unlockAccount();
      setToast({
        type: "success",
        message: "Account successfully unlocked! Redirecting to login...",
      });
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    }, 1000);
  };

  const handleRecover = () => {
    navigate("/auth/forgot-password");
  };

  return (
    <AuthLayout
      title="Access Suspended"
      subtitle="Security parameters activated. Please verify credentials."
    >
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="text-center space-y-6 py-4">
        {/* Warning Indicator */}
        <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-100 dark:bg-rose-950/20 rounded-full animate-pulse" />
          <div className="relative h-16 w-16 bg-rose-100 dark:bg-rose-950/30 rounded-full flex items-center justify-center border border-rose-250 dark:border-rose-900/50">
            <ShieldX className="h-8 w-8 text-rose-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-250">
            Account Locked
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
            This account has been locked due to 5 consecutive invalid login attempts. If this is your account, please unlock or reset password.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <motion.button
            onClick={handleUnlock}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm hover:shadow-lg hover:shadow-rose-600/25 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            Unlock Account (Demo Helper)
          </motion.button>

          <button onClick={handleRecover} className="premium-button-secondary w-full">
            <KeyRound className="h-4 w-4 text-neutral-500" />
            Recover via Password Reset
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
