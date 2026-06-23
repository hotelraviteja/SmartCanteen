import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Wifi, Battery, ShieldAlert } from "lucide-react";

export const MobileAppFrame = ({ children }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(100);

  // Update clock time for status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate slow battery drain
  useEffect(() => {
    const batteryTimer = setInterval(() => {
      setBatteryLevel((prev) => (prev > 10 ? prev - 1 : 100));
    }, 300000); // every 5 minutes
    return () => clearInterval(batteryTimer);
  }, []);

  // Scroll to top of the inner container on route change
  useEffect(() => {
    const scrollContainer = document.getElementById("mobile-viewport-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EBE8E2] dark:bg-[#030406] transition-colors duration-300 p-0 sm:p-4">
      {/* Outer Device Frame (Shown on screen width > 500px / sm) */}
      <div className="relative w-full max-w-[430px] h-screen sm:h-[90vh] sm:max-h-[920px] sm:min-h-[700px] flex flex-col bg-canvas-light dark:bg-canvas-dark sm:rounded-[48px] sm:border-[10px] sm:border-[#D6D1C4] dark:sm:border-[#232936] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] overflow-hidden transition-all duration-300">
        
        {/* Dynamic Island / Camera Cutout Notch (Only on desktop frame) */}
        <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="absolute right-3.5 w-2.5 h-2.5 bg-[#1a1a1a] rounded-full border border-neutral-900" />
        </div>

        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-11 sm:h-12 flex items-end justify-between px-6 pb-2.5 z-45 select-none bg-canvas-light/85 dark:bg-canvas-dark/85 backdrop-blur-md text-[11px] font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
          <span>{currentTime || "09:41"}</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="text-[9px] uppercase tracking-wider">5G</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold">{batteryLevel}%</span>
              <Battery className="h-4 w-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Viewport Content Area */}
        <div
          id="mobile-viewport-scroll"
          className="flex-1 w-full pt-11 sm:pt-12 pb-5 overflow-y-auto overflow-x-hidden scroll-smooth bg-canvas-light dark:bg-canvas-dark transition-colors duration-300"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center z-45 select-none bg-canvas-light/85 dark:bg-canvas-dark/85 backdrop-blur-md pointer-events-none transition-colors duration-300">
          <div className="w-32 h-1 bg-neutral-900/40 dark:bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
