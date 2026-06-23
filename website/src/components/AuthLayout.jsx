import React, { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { APP_NAME, TAGLINE } from "../utils/constants";
import { Utensils, Clock, QrCode, Ticket, Users, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export const AuthLayout = ({ children, title = "Welcome Back", subtitle = "Sign in to manage your canteen orders" }) => {
  // Real-time Clock for dynamic visual element
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="min-h-screen w-full flex bg-canvas-light dark:bg-canvas-dark font-sans transition-colors duration-300">
      
      {/* Left Column: Visual Dashboard Mockup (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-[52%] relative bg-gradient-to-br from-orange-600 via-brand to-rose-600 dark:from-[#0B0D13] dark:via-[#0F1116] dark:to-[#0B0D13] overflow-hidden items-center justify-center p-12 border-r border-neutral-100 dark:border-neutral-900">
        
        {/* Glow Effects in Dark Mode */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none dark:block hidden" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand/10 dark:bg-brand/5 blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        
        <div className="relative z-10 w-full max-w-lg flex flex-col justify-between h-full">
          {/* Header Branding with real time badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white dark:bg-brand flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-none">
                <Utensils className="h-5 text-brand dark:text-white" />
              </div>
              <span className="font-heading text-xl font-extrabold text-white dark:text-neutral-100 tracking-tight">
                {APP_NAME}
              </span>
            </div>

            {/* Live Campus Time Stamp */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 dark:bg-panel-dark/60 border border-white/15 dark:border-border-dark text-[11px] font-mono font-bold text-orange-100 dark:text-neutral-300 backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 inline-block rounded-full bg-emerald-500 mr-2 animate-ping" />
              CAMPUS LIVE • {formattedTime}
            </div>
          </div>

          {/* Core App Display & Redesigned Animations */}
          <div className="my-auto py-8 space-y-8">
            <div className="space-y-3.5 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold text-orange-100 dark:text-brand bg-white/10 dark:bg-brand/10 border border-white/10 dark:border-brand/20 backdrop-blur-sm uppercase tracking-wider">
                ✨ Smart Digital Token Hub
              </span>
              <h1 className="font-heading text-4xl xl:text-5xl font-extrabold text-white dark:text-neutral-100 leading-[1.12] tracking-tight">
                {TAGLINE}
              </h1>
              <p className="text-orange-100 dark:text-neutral-450 text-sm font-medium max-w-md">
                Purchase digital canteen tokens, browse queues, and skip counter lines in seconds.
              </p>
            </div>

            {/* Visual Redesigned Cards */}
            <div className="relative pt-4 text-left">
              
              {/* Interactive Pass Receipt Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-[340px] rounded-3xl border border-white/20 dark:border-border-dark bg-white/15 dark:bg-panel-dark backdrop-blur-xl p-5 shadow-2xl dark:shadow-none space-y-4 relative overflow-hidden"
              >
                {/* Laser scan line overlay effect */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent dark:via-brand/80 opacity-60 pointer-events-none animate-bounce" style={{ animationDuration: "5s" }} />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/10 dark:bg-brand/15 rounded-xl">
                      <Ticket className="h-4 w-4 text-orange-100 dark:text-brand" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white dark:text-neutral-100">Canteen Pass</h4>
                      <p className="text-[10px] text-orange-200/75 dark:text-neutral-500">Token ID: #CB-3891</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Ready
                  </span>
                </div>

                <div className="border-t border-b border-white/10 dark:border-border-dark py-3.5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-white/80 dark:text-neutral-400">
                    <span>1x Special Veg Biryani</span>
                    <span className="text-white dark:text-neutral-200">₹140.00</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-orange-200/75 dark:text-neutral-500">
                    <span>Pick up Counter</span>
                    <span className="font-bold text-white dark:text-neutral-300">Counter 2 (Veg Counter)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-orange-200/75 block uppercase font-bold tracking-wider">Pass Verification</span>
                    <span className="text-xs font-bold text-white dark:text-neutral-200">Show to counter executive</span>
                  </div>
                  <div className="p-2 bg-white rounded-2xl shadow-md dark:bg-neutral-800">
                    <QrCode className="h-9 w-9 text-neutral-900 dark:text-neutral-100" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Queue Traffic load status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="absolute top-1/3 -right-8 xl:-right-12 w-60 rounded-2xl border border-white/20 dark:border-border-dark bg-white/20 dark:bg-panel-dark/80 backdrop-blur-xl p-4 shadow-xl flex items-center gap-3 animate-float-slow"
              >
                <div className="p-2.5 bg-white/10 dark:bg-brand/10 rounded-xl text-white dark:text-brand">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="text-left space-y-0.5">
                  <p className="text-xs font-bold text-white dark:text-neutral-200">Canteen Queue Load</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-white/20 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full w-[25%] bg-emerald-400 dark:bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-300 dark:text-emerald-400">Quiet (2m wait)</span>
                  </div>
                </div>
              </motion.div>

              {/* Mockup 3: Quick recommendation box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -top-12 right-12 p-3.5 rounded-2xl border border-white/20 dark:border-border-dark bg-white/20 dark:bg-panel-dark/80 backdrop-blur-xl shadow-lg flex items-center gap-2.5 text-white animate-float"
              >
                <span className="text-2xl p-1 bg-white/15 rounded-lg">🥪</span>
                <div className="text-left space-y-0.5">
                  <p className="text-[11px] font-bold text-white dark:text-neutral-200">Sandwich Counter</p>
                  <span className="text-[9px] text-emerald-300 dark:text-emerald-400 font-extrabold tracking-wide uppercase flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Quickest Wait (1m)
                  </span>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Footer branding details */}
          <div className="flex justify-between items-center text-xs text-orange-100/60 dark:text-neutral-500 font-medium">
            <span>© {new Date().getFullYear()} CampusBite Inc.</span>
            <span>Security Audited SSL</span>
          </div>

        </div>
      </div>

      {/* Right Column: Authentication Form Card Section */}
      <div className="w-full lg:w-[48%] flex flex-col justify-between p-6 md:p-12 relative bg-canvas-light dark:bg-canvas-dark">
        
        {/* Header containing theme switch */}
        <div className="flex justify-between items-center w-full">
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm">
              <Utensils className="h-4.5 w-4.5" />
            </div>
            <span className="font-heading text-lg font-bold text-neutral-850 dark:text-neutral-200">
              {APP_NAME}
            </span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Form panel container */}
        <div className="my-auto w-full max-w-[440px] mx-auto py-8">
          <div className="space-y-2 text-center lg:text-left mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
          
          <div className="glass-panel-heavy p-6 md:p-8">
            {children}
          </div>
        </div>

        {/* Bottom links */}
        <div className="text-center text-xs text-neutral-450 dark:text-neutral-550 space-x-4">
          <a href="#terms" className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none">Terms</a>
          <span>•</span>
          <a href="#privacy" className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none">Privacy</a>
          <span>•</span>
          <a href="#support" className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none">Help Center</a>
        </div>
      </div>
      
    </div>
  );
};
