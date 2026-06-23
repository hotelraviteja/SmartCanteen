import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { OTPInput } from "../../components/OTPInput";
import { PasswordStrength } from "../../components/PasswordStrength";
import { Toast } from "../../components/Toast";
import { authService } from "../../services/authService";
import { validateEmail } from "../../utils/validators";
import { Mail, CheckCircle, KeyRound, Loader2, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const {
    register: emailFormRegister,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm();

  const {
    register: passwordFormRegister,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPasswordVal = watchPassword("password", "");

  const onEmailSubmit = async (data) => {
    setLoading(true);
    setToast(null);
    try {
      await authService.requestOTP(data.email);
      setEmail(data.email);
      setStep(2);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to initiate recovery. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToOtp = () => {
    setStep(3);
    setTimer(60);
    setCanResend(false);
  };

  const onOtpVerify = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) {
      setOtpError(true);
      setToast({ type: "error", message: "Please fill all 6 digits." });
      return;
    }

    setLoading(true);
    setOtpError(false);
    setToast(null);
    try {
      await authService.verifyOTP(email, otp);
      setStep(4);
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

  const resendCode = async () => {
    if (!canResend) return;
    setLoading(true);
    setToast(null);
    try {
      await authService.requestOTP(email);
      setTimer(60);
      setCanResend(false);
      setOtp("");
      setToast({ type: "success", message: "A new 6-digit OTP code has been dispatched!" });
    } catch (err) {
      setToast({ type: "error", message: "Failed to resend code. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    setToast(null);
    try {
      await authService.resetPassword(email, data.password);
      setStep(5);
      
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to update password. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    const steps = ["Email", "Confirm", "Verify", "Password", "Success"];
    return (
      <div className="w-full flex items-center justify-between mb-8 px-1">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${
                    isActive
                      ? "border-brand bg-brand text-white shadow-md shadow-brand/10 scale-105"
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-panel-dark text-neutral-400"
                  }`}
                >
                  {isCompleted ? "✓" : stepNum}
                </div>
                <span
                  className={`text-[9px] font-extrabold mt-1.5 uppercase tracking-wider transition-colors duration-300 ${
                    isActive
                      ? "text-brand"
                      : isCompleted
                      ? "text-emerald-500"
                      : "text-neutral-400 dark:text-neutral-600"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 bg-neutral-150 dark:bg-neutral-850 relative -top-3">
                  <div
                    className={`h-full bg-brand transition-all duration-500`}
                    style={{
                      width: step > stepNum ? "100%" : isActive ? "50%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <AuthLayout
      title="Recover Account"
      subtitle="Follow the checkpoints to securely reset your credentials."
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

      {renderProgress()}

      <div className="mt-2">
        {step === 1 && (
          <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-5 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
                College Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  {...emailFormRegister("email", {
                    required: "College email is required",
                    validate: validateEmail,
                  })}
                  className={`premium-input ${emailErrors.email ? "border-error focus:ring-error/15" : ""}`}
                />
              </div>
              {emailErrors.email && (
                <p className="text-error text-xs font-semibold mt-1">{emailErrors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Link to="/auth/login" className="premium-button-secondary flex-1">
                <ArrowLeft className="h-4 w-4" /> Cancel
              </Link>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className="premium-button flex-[2]"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="text-center space-y-6">
            <div className="mx-auto h-14 w-14 bg-orange-100 dark:bg-brand/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-brand" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-250">
                Check Your Canteen Mailbox
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                We have dispatched a verification code to: <br />
                <strong className="text-neutral-700 dark:text-neutral-350">{email}</strong>
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="premium-button-secondary flex-1">
                Back
              </button>
              <button onClick={handleProceedToOtp} className="premium-button flex-[2]">
                Enter Code
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={onOtpVerify} className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-250">
                OTP Verification
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Verify the 6-digit code sent to your email.
              </p>
            </div>

            <OTPInput value={otp} onChange={setOtp} isError={otpError} />

            <div className="flex justify-between items-center text-xs font-semibold px-1">
              {timer > 0 ? (
                <span className="text-neutral-400">
                  Resend code in <strong className="text-neutral-600 dark:text-neutral-305">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-brand hover:text-brand-hover flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                  Resend Code
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className="premium-button-secondary flex-1">
                Back
              </button>
              <button type="submit" className="premium-button flex-[2]" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5 text-left">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-255">
                Set New Password
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-450">
                Pick a strong, unique password for your digital wallet.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...passwordFormRegister("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "At least 8 characters required" },
                  })}
                  className={`premium-input ${passwordErrors.password ? "border-error focus:ring-error/15" : ""}`}
                />
              </div>
              {passwordErrors.password && (
                <p className="text-error text-xs font-semibold mt-1">{passwordErrors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...passwordFormRegister("confirmPassword", {
                    required: "Confirm your password",
                    validate: (val) => val === newPasswordVal || "Passwords do not match",
                  })}
                  className={`premium-input ${passwordErrors.confirmPassword ? "border-error focus:ring-error/15" : ""}`}
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-error text-xs font-semibold mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <PasswordStrength password={newPasswordVal} />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className="premium-button w-full animate-fade-in"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Password"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </form>
        )}

        {step === 5 && (
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-emerald-105 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                Password Reset Complete!
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Your credentials have been securely updated. Opening sign in page...
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-850 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "linear" }}
                  className="h-full bg-brand"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
