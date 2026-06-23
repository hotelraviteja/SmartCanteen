import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout";
import { PasswordStrength } from "../../components/PasswordStrength";
import { Toast } from "../../components/Toast";
import { authService } from "../../services/authService";
import { KeyRound, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "mock-reset-token";
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password", "");

  const onSubmit = async (data) => {
    setLoading(true);
    setToast(null);
    try {
      // Pass the token to verify it on server
      await authService.resetPassword("user@college.edu", data.password);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update password. Link might be expired.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center p-8 rounded-3xl border border-neutral-205 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-2xl backdrop-blur-md"
        >
          <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-500 animate-bounce" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2">
            Password Reset Complete
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
            Your login password has been changed successfully. Redirecting you to the sign in page...
          </p>
          <div className="space-y-3">
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "linear" }}
                className="h-full bg-brand"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle={`Reset password for request token: ${token.substring(0, 12)}...`}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
        {/* Password field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-455 pointer-events-none">
              <KeyRound className="h-4.5 w-4.5" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters required" },
              })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md outline-none text-neutral-800 dark:text-neutral-100 transition-all text-sm font-medium ${
                errors.password
                  ? "border-error focus:ring-2 focus:ring-error/25"
                  : "border-neutral-200 dark:border-neutral-800 focus:border-brand focus:ring-2 focus:ring-brand/25"
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-error text-xs font-semibold">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-455 pointer-events-none">
              <KeyRound className="h-4.5 w-4.5" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (val) => val === passwordVal || "Passwords do not match",
              })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md outline-none text-neutral-800 dark:text-neutral-100 transition-all text-sm font-medium ${
                errors.confirmPassword
                  ? "border-error focus:ring-2 focus:ring-error/25"
                  : "border-neutral-200 dark:border-neutral-800 focus:border-brand focus:ring-2 focus:ring-brand/25"
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-error text-xs font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Strength meter */}
        <PasswordStrength password={passwordVal} />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-hover hover:shadow-lg transition-all focus:outline-none cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Updating...
            </>
          ) : (
            <>
              Update Password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </AuthLayout>
  );
};
