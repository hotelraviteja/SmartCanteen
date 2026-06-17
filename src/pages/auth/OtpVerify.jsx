import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout";
import { OTPInput } from "../../components/OTPInput";
import { Toast } from "../../components/Toast";
import { authService } from "../../services/authService";
import { ShieldAlert, RefreshCw, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const OtpVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "student@college.edu";
  
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) {
      setOtpError(true);
      setToast({ type: "error", message: "Please fill out all 6 digits." });
      return;
    }

    setLoading(true);
    setOtpError(false);
    setToast(null);
    try {
      await authService.verifyOTP(email, otp);
      setToast({ type: "success", message: "Verification successful! Redirecting..." });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setOtpError(true);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Invalid OTP code. Hint: Use 123456.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    setToast(null);
    try {
      await authService.requestOTP(email);
      setTimer(60);
      setCanResend(false);
      setOtp("");
      setToast({ type: "success", message: "A fresh 6-digit OTP code has been sent." });
    } catch (err) {
      setToast({ type: "error", message: "Failed to dispatch code." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Enter Verification Code"
      subtitle={`Verify your identity to proceed.`}
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

      <form onSubmit={handleVerify} className="space-y-6 text-center">
        <div className="mx-auto h-14 w-14 bg-orange-100 dark:bg-brand/10 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-brand" />
        </div>

        <p className="text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed max-w-xs mx-auto">
          We have sent a code to <span className="font-semibold text-neutral-700 dark:text-neutral-300">{email}</span>. Enter it below.
        </p>

        {/* 6 Digit Input boxes */}
        <OTPInput value={otp} onChange={setOtp} isError={otpError} />

        {/* Resend Actions */}
        <div className="flex justify-between items-center text-xs font-semibold px-1">
          {timer > 0 ? (
            <span className="text-neutral-400">
              Resend code in <strong className="text-neutral-600 dark:text-neutral-300">{timer}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-brand hover:text-brand-hover flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Resend OTP Code
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            to="/auth/login"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-neutral-600 dark:text-neutral-350 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Link>
          <button
            type="submit"
            className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-hover hover:shadow-lg transition-all cursor-pointer"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
