import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout";
import { Toast } from "../../components/Toast";
import { authService } from "../../services/authService";
import { MailOpen, ExternalLink, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your-student-email@college.edu";
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleOpenEmailApp = () => {
    // Open a generic mail composer or Gmail tab
    setToast({
      type: "success",
      message: "Redirecting to your mail service provider...",
    });
    setTimeout(() => {
      window.open("https://mail.google.com", "_blank");
    }, 800);
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setToast(null);
    try {
      await authService.verifyEmail(email);
      setToast({
        type: "success",
        message: `A fresh verification link has been dispatched to ${email}`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: "Failed to dispatch email. Please check your network connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We need to authenticate your college affiliation before activation."
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
        {/* Email Verification Illustration */}
        <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-100 dark:bg-brand/10 rounded-full animate-ping opacity-75" />
          <div className="relative h-16 w-16 bg-orange-100 dark:bg-brand/20 rounded-full flex items-center justify-center">
            <MailOpen className="h-8 w-8 text-brand" />
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-200">
            Verification Link Sent
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
            We have sent a verification link to: <br />
            <strong className="text-neutral-700 dark:text-neutral-350 select-all font-semibold">{email}</strong>
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Open Email Client */}
          <motion.button
            onClick={handleOpenEmailApp}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-hover hover:shadow-lg transition-all cursor-pointer"
          >
            Open Email App
            <ExternalLink className="h-4 w-4" />
          </motion.button>

          {/* Resend Link */}
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-550" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-neutral-550" />
            )}
            Resend Verification Link
          </button>
        </div>

        <div className="pt-2">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-brand transition-colors focus:outline-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
