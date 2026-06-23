import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { PasswordStrength } from "../../components/PasswordStrength";
import { Toast } from "../../components/Toast";
import { DEPARTMENTS, ACADEMIC_YEARS } from "../../utils/constants";
import { validateEmail, PHONE_REGEX, STUDENT_ID_REGEX } from "../../utils/validators";
import { User, IdCard, Phone, Mail, Lock, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
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
      fullName: "",
      studentId: "",
      department: DEPARTMENTS[0],
      academicYear: ACADEMIC_YEARS[0],
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordVal = watch("password", "");

  const onSubmit = async (data) => {
    setLoading(true);
    setToast(null);
    try {
      await registerUser({
        fullName: data.fullName,
        studentId: data.studentId,
        department: data.department,
        academicYear: data.academicYear,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
      });

      setIsSuccess(true);
      
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Failed to create account. Please check your inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-canvas-light dark:bg-canvas-dark px-4">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="max-w-md w-full text-center p-8 rounded-3xl border border-border-light dark:border-border-dark bg-white dark:bg-panel-dark shadow-2xl backdrop-blur-md"
        >
          <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-500 animate-bounce" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">
            Registration Complete!
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
            Your CampusBite student account has been created. A verification link has been sent to your college inbox.
          </p>
          <div className="space-y-3">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
              Redirecting to sign in...
            </div>
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-850 rounded-full overflow-hidden">
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
      title="Create Student Account"
      subtitle="Register now to grab digital tokens, check live menu items, and bypass canteen queues."
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        
        {/* Full Name & Student ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Rohan Sharma"
                {...register("fullName", { required: "Name is required" })}
                className={`premium-input ${errors.fullName ? "border-error focus:ring-error/15" : ""}`}
              />
            </div>
            {errors.fullName && <p className="text-error text-xs font-semibold mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
              Student ID / Roll No.
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                <IdCard className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="CS-2023-92"
                {...register("studentId", { 
                  required: "Student ID is required",
                  pattern: { value: STUDENT_ID_REGEX, message: "Invalid format" }
                })}
                className={`premium-input ${errors.studentId ? "border-error focus:ring-error/15" : ""}`}
              />
            </div>
            {errors.studentId && <p className="text-error text-xs font-semibold mt-1">{errors.studentId.message}</p>}
          </div>
        </div>

        {/* Department & Academic Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-widest">
              Department
            </label>
            <select
              {...register("department", { required: "Department is required" })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-panel-dark/50 text-neutral-800 dark:text-neutral-100 transition-all text-xs font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="dark:bg-[#0F1116]">{dept}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-widest">
              Academic Year
            </label>
            <select
              {...register("academicYear", { required: "Year is required" })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-panel-dark/50 text-neutral-800 dark:text-neutral-100 transition-all text-xs font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 cursor-pointer"
            >
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year} className="dark:bg-[#0F1116]">{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Email & Mobile Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {...register("email", { 
                  required: "College email is required",
                  validate: validateEmail
                })}
                className={`premium-input ${errors.email ? "border-error focus:ring-error/15" : ""}`}
              />
            </div>
            {errors.email && <p className="text-error text-xs font-semibold mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                {...register("mobile", { 
                  required: "Mobile is required",
                  pattern: { value: PHONE_REGEX, message: "Invalid mobile format" }
                })}
                className={`premium-input ${errors.mobile ? "border-error focus:ring-error/15" : ""}`}
              />
            </div>
            {errors.mobile && <p className="text-error text-xs font-semibold mt-1">{errors.mobile.message}</p>}
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" }
                })}
                className={`premium-input ${errors.password ? "border-error focus:ring-error/15" : ""}`}
              />
            </div>
            {errors.password && <p className="text-error text-xs font-semibold mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword", { 
                  required: "Confirm your password",
                  validate: (val) => val === passwordVal || "Passwords do not match"
                })}
                className={`premium-input ${errors.confirmPassword ? "border-error focus:ring-error/15" : ""}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-error text-xs font-semibold mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Password strength details */}
        <PasswordStrength password={passwordVal} />

        {/* Terms agreement checkbox */}
        <div className="space-y-1 pt-1">
          <div className="flex items-start">
            <input
              id="acceptTerms"
              type="checkbox"
              {...register("acceptTerms", { required: "You must accept terms & conditions" })}
              className="h-4.5 w-4.5 rounded border-neutral-200 text-brand focus:ring-brand mt-0.5 cursor-pointer"
            />
            <label htmlFor="acceptTerms" className="ml-2.5 text-xs text-neutral-500 dark:text-neutral-450 cursor-pointer select-none">
              I agree to the CampusBite{" "}
              <a href="#terms" className="text-brand hover:underline font-extrabold focus:outline-none">Terms</a>
              {" "}and{" "}
              <a href="#privacy" className="text-brand hover:underline font-extrabold focus:outline-none">Privacy Policy</a>
            </label>
          </div>
          {errors.acceptTerms && <p className="text-error text-xs font-semibold">{errors.acceptTerms.message}</p>}
        </div>

        {/* Create Account Button */}
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
              Generating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        {/* Link to login */}
        <p className="text-center text-xs font-bold text-neutral-450 dark:text-neutral-500 pt-1">
          Already registered?{" "}
          <Link to="/auth/login" className="text-brand hover:text-brand-hover focus:outline-none font-extrabold">
            Sign In Instead
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
