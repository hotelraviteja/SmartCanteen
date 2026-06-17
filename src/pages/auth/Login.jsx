import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { SocialLoginButtons } from "../../components/SocialLoginButtons";
import { Toast } from "../../components/Toast";
import { validateEmail } from "../../utils/validators";
import { STORAGE_KEYS } from "../../utils/constants";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Login = () => {
  const { login, loginWithGoogle, isSessionExpired, clearSessionExpiry } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isSessionExpired) {
      setToast({
        type: "warning",
        message: "Your session has expired. Please log in again.",
      });
      clearSessionExpiry();
    }
  }, [isSessionExpired]);

  const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL) || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: rememberedEmail,
      password: "",
      rememberMe: !!rememberedEmail,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setToast(null);
    try {
      await login(data.email, data.password, data.rememberMe);
      
      setToast({
        type: "success",
        message: "Successfully authenticated! Opening dashboard...",
      });
      
      setTimeout(() => {
        const origin = location.state?.from?.pathname || "/dashboard";
        navigate(origin, { replace: true });
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Invalid credentials. Hint: avoid 'wrong' in password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSelect = async (provider) => {
    if (provider === "Google") {
      setLoading(true);
      setToast(null);
      try {
        await loginWithGoogle();
      } catch (error) {
        setToast({
          type: "error",
          message: error.message || "Failed to authenticate with Google.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      setToast({
        type: "info",
        message: `Connecting to ${provider} OAuth...`,
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue ordering food, tracking tokens, and managing campus meals."
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
        {/* Email Field */}
        <div className="space-y-1 text-left">
          <label
            htmlFor="email"
            className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest"
          >
            College Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              type="email"
              placeholder="student@college.edu"
              {...register("email", {
                required: "College email is required",
                validate: validateEmail,
              })}
              className={`premium-input ${
                errors.email ? "border-error focus:ring-error/15" : ""
              }`}
              disabled={loading}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
          {errors.email && (
            <p className="text-error text-xs font-semibold mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1 text-left">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-widest"
            >
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-bold text-brand hover:text-brand-hover focus:outline-none"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className={`premium-input ${
                errors.password ? "border-error focus:ring-error/15" : ""
              }`}
              disabled={loading}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-error text-xs font-semibold mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center text-left py-0.5">
          <input
            id="rememberMe"
            type="checkbox"
            {...register("rememberMe")}
            className="h-4.5 w-4.5 rounded border-neutral-200 text-brand focus:ring-brand cursor-pointer"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2.5 text-xs font-bold text-neutral-500 dark:text-neutral-450 cursor-pointer select-none"
          >
            Remember me on this device
          </label>
        </div>

        {/* Sign In Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className="premium-button w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              Verifying credentials...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-neutral-100 dark:border-neutral-850"></div>
          <span className="flex-shrink mx-4 text-[9px] font-extrabold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
            Or continue with
          </span>
          <div className="flex-grow border-t border-neutral-100 dark:border-neutral-850"></div>
        </div>

        {/* Social buttons */}
        <SocialLoginButtons onSelect={handleSocialSelect} />

        {/* Sign Up Link */}
        <p className="text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 pt-2">
          New student?{" "}
          <Link
            to="/auth/register"
            className="text-brand hover:text-brand-hover focus:outline-none font-extrabold"
          >
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
