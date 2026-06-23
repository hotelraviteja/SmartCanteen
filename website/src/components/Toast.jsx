import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Toast = ({ message, type = "success", onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-900/50",
      text: "text-emerald-800 dark:text-emerald-300",
      iconColor: "text-emerald-500",
      icon: CheckCircle2,
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-200 dark:border-rose-900/50",
      text: "text-rose-800 dark:text-rose-300",
      iconColor: "text-rose-500",
      icon: XCircle,
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-900/50",
      text: "text-amber-800 dark:text-amber-300",
      iconColor: "text-amber-500",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-sky-50 dark:bg-sky-950/30",
      border: "border-sky-200 dark:border-sky-900/50",
      text: "text-sky-800 dark:text-sky-300",
      iconColor: "text-sky-500",
      icon: Info,
    },
  };

  const config = typeConfig[type] || typeConfig.success;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border ${config.bg} ${config.border} ${config.text} shadow-lg shadow-neutral-200/40 dark:shadow-none min-w-[320px] max-w-[420px] backdrop-blur-md`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 text-sm font-medium pr-2">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-0.5 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 opacity-70" />
      </button>
    </motion.div>
  );
};
