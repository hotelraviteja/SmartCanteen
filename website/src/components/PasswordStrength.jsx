import React from "react";
import { checkPasswordStrength } from "../utils/validators";
import { Check, X } from "lucide-react";

export const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const { score, label, colorClass, requirements } = checkPasswordStrength(password);

  const checklistItems = [
    { label: "8+ characters", met: requirements.length },
    { label: "Uppercase (A-Z)", met: requirements.uppercase },
    { label: "Lowercase (a-z)", met: requirements.lowercase },
    { label: "Number (0-9)", met: requirements.number },
    { label: "Special char", met: requirements.special },
  ];

  const widthPercentage = (score / 4) * 100;

  return (
    <div className="mt-3.5 space-y-3 text-left animate-fade-in">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span className="text-neutral-450 dark:text-neutral-500">Security Strength</span>
        <span
          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold text-white tracking-widest ${
            password ? colorClass : "bg-neutral-200 text-neutral-500"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Modern thin progress bar */}
      <div className="h-1 w-full bg-neutral-150 dark:bg-neutral-850 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${Math.min(widthPercentage, 100)}%` }}
        />
      </div>

      {/* Requirement tags list */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {checklistItems.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
              item.met
                ? "bg-emerald-50/70 border-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-extrabold"
                : "bg-neutral-100/50 border-neutral-200/50 text-neutral-400 dark:bg-panel-dark dark:border-border-dark dark:text-neutral-650"
            }`}
          >
            {item.met ? (
              <Check className="h-3 w-3 stroke-[3.5] text-emerald-555" />
            ) : (
              <X className="h-3 w-3 stroke-[3] opacity-60" />
            )}
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};
