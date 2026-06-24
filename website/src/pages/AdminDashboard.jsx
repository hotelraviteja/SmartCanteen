import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabaseClient";
import { ThemeToggle } from "../components/ThemeToggle";
import { Toast } from "../components/Toast";
import { 
  LogOut, Shield, ShieldCheck, Clock, Store, 
  Check, X, Search, Loader2, Calendar, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminDashboard = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("canteens")
        .select(`
          id,
          name,
          status,
          created_at,
          owner_id,
          profiles:owner_id (
            full_name,
            phone
          )
        `);
      if (error) throw error;
      setCanteens(data || []);
    } catch (err) {
      console.error("Error fetching canteens:", err);
      setToast({
        type: "error",
        message: err.message || "Failed to load canteens from database."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (canteenId, canteenName) => {
    try {
      const { error } = await supabase
        .from("canteens")
        .update({ status: "approved" })
        .eq("id", canteenId);

      if (error) throw error;

      // Update state locally
      setCanteens(prev => 
        prev.map(c => c.id === canteenId ? { ...c, status: "approved" } : c)
      );

      setToast({
        type: "success",
        message: `Successfully approved canteen "${canteenName}"!`
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to approve canteen."
      });
    }
  };

  const handleReject = async (canteenId, canteenName) => {
    try {
      const { error } = await supabase
        .from("canteens")
        .update({ status: "rejected" })
        .eq("id", canteenId);

      if (error) throw error;

      // Update state locally
      setCanteens(prev => 
        prev.map(c => c.id === canteenId ? { ...c, status: "rejected" } : c)
      );

      setToast({
        type: "success",
        message: `Rejected canteen request "${canteenName}".`
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to reject canteen."
      });
    }
  };

  // Dynamic Statistics
  const totalCount = canteens.length;
  const pendingCount = canteens.filter(c => c.status === "pending").length;
  const approvedCount = canteens.filter(c => c.status === "approved").length;
  const rejectedCount = canteens.filter(c => c.status === "rejected").length;

  // Filter canteens based on search query and active tab selection
  const filteredCanteens = canteens.filter((canteen) => {
    const matchesSearch = 
      canteen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (canteen.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || canteen.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300 pb-16">
      {/* Toast Alert Popups */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-panel-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/20">
            <Shield className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h1 className="font-heading text-lg font-extrabold tracking-tight leading-none">CampusBite Admin</h1>
            <span className="hidden sm:inline text-[9px] font-extrabold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mt-1">
              verification control tower
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full uppercase tracking-wider">
            System Overseer
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-6">
        
        {/* Welcome Admin Profile Header */}
        <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="h-13 w-13 rounded-2xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
              <ShieldCheck className="h-6.5 w-6.5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
                Security clearance verified
              </span>
              <h2 className="font-heading text-lg md:text-xl font-extrabold tracking-tight mt-0.5">
                Welcome, Administrative Dashboard
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Verify and moderate campus canteens to list them in student ordering catalogues.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchCanteens(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-panel-dark/80 hover:bg-neutral-100/60 dark:hover:bg-neutral-850/80 transition-all cursor-pointer text-neutral-600 dark:text-neutral-350"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 text-brand ${refreshing ? "animate-spin" : ""}`} />
            Refresh Records
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 text-left flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Total Registers</span>
              <p className="text-2xl font-extrabold tracking-tight mt-0.5">{totalCount}</p>
            </div>
          </div>

          <div className="glass-panel p-5 text-left flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Pending Audit</span>
              <p className="text-2xl font-extrabold tracking-tight mt-0.5">{pendingCount}</p>
            </div>
          </div>

          <div className="glass-panel p-5 text-left flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Approved Canteens</span>
              <p className="text-2xl font-extrabold tracking-tight mt-0.5">{approvedCount}</p>
            </div>
          </div>

          <div className="glass-panel p-5 text-left flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <X className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Rejected Requests</span>
              <p className="text-2xl font-extrabold tracking-tight mt-0.5">{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Requests Management Panel */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 dark:border-border-dark pb-5">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by canteen or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-panel-dark/50 backdrop-blur-md outline-none text-neutral-800 dark:text-neutral-100 text-xs font-semibold focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: "all", label: "All Records", count: totalCount },
                { id: "pending", label: "Pending", count: pendingCount },
                { id: "approved", label: "Approved", count: approvedCount },
                { id: "rejected", label: "Rejected", count: rejectedCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-brand text-white border-brand shadow-sm scale-105"
                      : "bg-white dark:bg-panel-dark text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-450">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span className="text-xs font-bold uppercase tracking-wider">Syncing database registers...</span>
              </div>
            ) : filteredCanteens.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-border-dark text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                    <th className="py-4 px-4">Canteen Details</th>
                    <th className="py-4 px-4">Owner Profile</th>
                    <th className="py-4 px-4">Contact Phone</th>
                    <th className="py-4 px-4">Created Date</th>
                    <th className="py-4 px-4">Verification State</th>
                    <th className="py-4 px-4 text-center">Action Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-border-dark text-sm">
                  {filteredCanteens.map((canteen) => (
                    <tr key={canteen.id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-850/10 transition-colors">
                      {/* Canteen ID & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-lg">
                            🏪
                          </div>
                          <div>
                            <p className="font-bold text-neutral-850 dark:text-neutral-100">{canteen.name}</p>
                            <span className="text-[10px] font-mono text-neutral-450 block truncate max-w-[150px]">
                              ID: {canteen.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">
                            {canteen.profiles?.full_name?.charAt(0) || "O"}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {canteen.profiles?.full_name || "N/A"}
                            </p>
                            <span className="text-[10px] text-neutral-450 block">Registered Owner</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="py-4 px-4 font-mono text-neutral-600 dark:text-neutral-350">
                        {canteen.profiles?.phone || "No Phone"}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-neutral-600 dark:text-neutral-350">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          {new Date(canteen.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      </td>

                      {/* Verification State Badges */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                          canteen.status === "approved"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : canteen.status === "rejected"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                        }`}>
                          {canteen.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canteen.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(canteen.id, canteen.name)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all cursor-pointer border border-emerald-500/25"
                              title="Approve and List Canteen"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {canteen.status !== "rejected" && (
                            <button
                              onClick={() => handleReject(canteen.id, canteen.name)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer border border-rose-500/25"
                              title="Reject Verification Request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {canteen.status === "approved" && (
                            <span className="text-[11px] font-semibold text-neutral-450">Active Catalog</span>
                          )}
                          {canteen.status === "rejected" && (
                            <span className="text-[11px] font-semibold text-neutral-450">Blacklisted</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 space-y-3">
                <span className="text-4xl">📭</span>
                <h4 className="font-heading text-sm font-bold text-neutral-700 dark:text-neutral-350">No canteens matched your filters</h4>
                <p className="text-xs text-neutral-450 max-w-xs mx-auto leading-relaxed">
                  Adjust your status tab or search queries to find other registered canteens.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
