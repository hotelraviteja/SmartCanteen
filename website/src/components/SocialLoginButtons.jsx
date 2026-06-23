import React from "react";
import { motion } from "framer-motion";

export const SocialLoginButtons = ({ onSelect }) => {
  return (
    <div className="w-full">
      <motion.button
        onClick={() => onSelect?.("Google")}
        whileHover={{ scale: 1.005, y: -0.5 }}
        whileTap={{ scale: 0.995 }}
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white/60 dark:bg-panel-dark/50 hover:bg-neutral-50 dark:hover:bg-neutral-850/60 text-neutral-700 dark:text-neutral-300 transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-brand/15 text-sm font-bold shadow-sm"
        title="Continue with Google"
        aria-label="Continue with Google"
      >
        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.307 2.68 1.347 6.58l3.92 3.185z"
          />
          <path
            fill="#4285F4"
            d="M16.04 15.345c-1.077.733-2.5 1.182-4.04 1.182a4.905 4.905 0 0 1-4.734-3.385l-3.92 3.186C5.307 20.23 8.354 24 12 24c2.99 0 5.642-1.09 7.927-2.982l-3.887-5.673z"
          />
          <path
            fill="#FBBC05"
            d="M24 12c0-.859-.077-1.69-.218-2.495H12v4.99h6.733a5.753 5.753 0 0 1-2.495 3.773l3.887 5.673C22.39 21.055 24 16.909 24 12z"
          />
          <path
            fill="#34A853"
            d="M5.266 14.235A7.054 7.054 0 0 1 4.91 12c0-.79.136-1.545.356-2.235L1.347 6.58A11.962 11.962 0 0 0 0 12c0 1.927.455 3.755 1.253 5.382l4.013-3.147z"
          />
        </svg>
        <span>Continue with Google</span>
      </motion.button>
    </div>
  );
};
