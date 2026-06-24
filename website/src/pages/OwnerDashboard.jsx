import React from "react";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";
import { 
  LogOut, Store, Smartphone, AlertTriangle, ArrowRight,
  ShieldAlert, Settings, HelpCircle, CheckCircle2
} from "lucide-react";

export const OwnerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300 pb-16">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-panel-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/20">
            <Store className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h1 className="font-heading text-lg font-extrabold tracking-tight leading-none">CampusBite Owner</h1>
            <span className="hidden sm:inline text-[9px] font-extrabold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mt-1">
              canteen command center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full uppercase tracking-wider">
            Canteen Owner
          </span>
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-12 text-center">
        <div className="glass-panel-heavy p-8 md:p-12 space-y-8 max-w-2xl mx-auto bg-gradient-to-b from-brand/5 to-transparent dark:from-neutral-900/30">
          
          {/* Brand Header */}
          <div className="mx-auto h-20 w-20 bg-brand/10 border border-brand/20 rounded-3xl flex items-center justify-center text-3xl">
            🏪
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">
              Mobile Application Recommended
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
              Manage Your Canteen on the Go!
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
              Hello, <strong>{user?.name || "Canteen Partner"}</strong>. To provide real-time order notifications and counter ticket claims, all kitchen operations are managed in the SmartCanteen mobile application.
            </p>
          </div>

          {/* Details / Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto pt-2">
            <div className="glass-panel p-4 flex gap-3.5 items-center">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-neutral-400">Order Updates</h4>
                <p className="text-xs font-bold text-neutral-750 dark:text-neutral-200 mt-0.5">Real-time alerts & claims</p>
              </div>
            </div>
            <div className="glass-panel p-4 flex gap-3.5 items-center">
              <span className="text-2xl">🍔</span>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-neutral-400">Menu Catalog</h4>
                <p className="text-xs font-bold text-neutral-750 dark:text-neutral-200 mt-0.5">Add dishes with emojis</p>
              </div>
            </div>
          </div>

          {/* Warning Info */}
          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl flex items-start gap-3.5 text-left max-w-lg mx-auto">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400">Account status check</h5>
              <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Your canteen (<strong>{user?.canteenName || "My Canteen"}</strong>) status is verified by system administrators. Please launch the mobile app and log in under the **Canteen Owner** tab.
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-850 pt-6">
            <button
              onClick={logout}
              className="premium-button mx-auto max-w-xs"
            >
              Sign Out
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
