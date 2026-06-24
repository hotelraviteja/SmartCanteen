import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";
import { Toast } from "../components/Toast";
import { supabase } from "../services/supabaseClient";
import { FOOD_CATEGORIES, MOCK_TRANSACTIONS, MOCK_NOTIFICATIONS } from "../utils/constants";
import { Loader2 } from "lucide-react";
import { 
  LogOut, User, Wallet, QrCode, Ticket, ArrowRight, 
  Terminal, ShieldX, Hourglass, ServerOff, Plus, Minus, ShoppingBag, 
  Trash2, Star, Clock, CheckCircle, Bell, X, Printer, History, 
  Search, ArrowUpRight, ArrowDownLeft, ChevronRight, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    user, logout, simulateSessionExpired, 
    simulateAccountLocked, apiClient 
  } = useAuth();

  // Toast Alerts State
  const [toast, setToast] = useState(null);

  // Dynamic canteens and items from database
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  
  // Loading states
  const [loadingCanteens, setLoadingCanteens] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Persistent user balance in localStorage
  const [balance, setBalance] = useState(() => {
    if (!user) return 450;
    const key = `campusbite_balance_${user.id}`;
    const stored = localStorage.getItem(key);
    return stored ? parseFloat(stored) : 450;
  });

  // Sync balance to localStorage
  useEffect(() => {
    if (user) {
      const key = `campusbite_balance_${user.id}`;
      localStorage.setItem(key, balance.toString());
    }
  }, [balance, user]);

  // Persistent transactions list
  const [transactions, setTransactions] = useState(() => {
    if (!user) return MOCK_TRANSACTIONS;
    const key = `campusbite_transactions_${user.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : MOCK_TRANSACTIONS;
  });

  useEffect(() => {
    if (user) {
      const key = `campusbite_transactions_${user.id}`;
      localStorage.setItem(key, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Search & Filter States
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Cart State (itemId -> quantity)
  const [cart, setCart] = useState({});

  // Active digital tokens list
  const [tokens, setTokens] = useState([]);

  // Selected Token for Receipt Modal Stepper Detail view
  const [selectedToken, setSelectedToken] = useState(null);

  // Offline Outage Simulator State
  const [offlineMode, setOfflineMode] = useState(false);

  // Fetch approved canteens from database
  useEffect(() => {
    const fetchCanteens = async () => {
      setLoadingCanteens(true);
      try {
        const { data, error } = await supabase
          .from("canteens")
          .select("*")
          .eq("status", "approved");
        
        if (error) throw error;
        setCanteens(data || []);
        if (data && data.length > 0) {
          setSelectedCanteen(data[0]);
        }
      } catch (err) {
        console.error("Error fetching canteens:", err);
        setToast({ type: "error", message: "Failed to load approved canteens." });
      } finally {
        setLoadingCanteens(false);
      }
    };

    if (user) {
      fetchCanteens();
    }
  }, [user]);

  // Fetch menu items when selected canteen changes
  useEffect(() => {
    const fetchMenu = async () => {
      if (!selectedCanteen) {
        setMenuItems([]);
        return;
      }
      setLoadingMenu(true);
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("canteen_id", selectedCanteen.id);
        
        if (error) throw error;
        setMenuItems(data || []);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setToast({ type: "error", message: "Failed to load menu items." });
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
    setCart({}); // Reset cart when canteen changes
  }, [selectedCanteen]);

  // Fetch orders from database
  const fetchStudentOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("student_id", user.id)
        .neq("status", "collected")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedTokens = (data || []).map(order => {
        const itemsList = order.items || [];
        const itemSummary = itemsList.map(i => `${i.quantity}x ${i.name}`).join(", ");
        const totalCount = itemsList.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        
        let statusLabel = "Preparing";
        if (order.status === "ready") statusLabel = "Ready";
        if (order.status === "collected") statusLabel = "Collected";

        const hasJuice = itemsList.some(i => i.category && i.category.toLowerCase().includes("juice"));
        const counterLabel = hasJuice ? "Counter 3 (Juice Hub)" : "Counter 1 (Main Canteen)";

        return {
          id: order.id,
          item: itemSummary || "Canteen Food Order",
          count: totalCount,
          counter: counterLabel,
          status: statusLabel,
          price: order.total_amount,
          items: itemsList
        };
      });

      setTokens(mappedTokens);
    } catch (err) {
      console.error("Error fetching student orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Setup active student orders listener and realtime sync
  useEffect(() => {
    if (!user) return;

    fetchStudentOrders();

    const ordersChannel = supabase
      .channel(`student-orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `student_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime order update event:", payload);
          fetchStudentOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [user]);

  // Filter catalogue list based on Category, Veg-Only toggle, and Search queries
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesVeg = !isVegOnly || item.is_veg;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.desc_text || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesVeg && matchesSearch;
  });

  // Cart operations
  const handleAddToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveOneFromCart = (itemId) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[itemId] <= 1) {
        delete copy[itemId];
      } else {
        copy[itemId] -= 1;
      }
      return copy;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const getCartTotals = () => {
    let subtotal = 0;
    let itemCount = 0;

    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menuItems.find(food => food.id === itemId);
      if (item) {
        subtotal += item.price * qty;
        itemCount += qty;
      }
    });

    const handlingCharge = subtotal > 0 ? 15 : 0;
    const gst = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + handlingCharge + gst;

    return { subtotal, itemCount, handlingCharge, gst, grandTotal };
  };

  const { subtotal, itemCount, handlingCharge, gst, grandTotal } = getCartTotals();

  // Network offline triggers
  const handleOfflineToggle = () => {
    const nextVal = !offlineMode;
    setOfflineMode(nextVal);
    apiClient.setNetworkFailure(nextVal);
    setToast({
      type: nextVal ? "warning" : "success",
      message: nextVal 
        ? "Outage simulator OFFLINE. Server responses are now blocked." 
        : "Outage simulator ONLINE. Connection restored."
    });
  };

  const handleSimulateTimeout = () => {
    setToast({ type: "info", message: "Simulating Session Timeout..." });
    setTimeout(() => {
      simulateSessionExpired();
    }, 800);
  };

  const handleSimulateLockout = () => {
    setToast({ type: "info", message: "Simulating Account Lockout..." });
    setTimeout(() => {
      simulateAccountLocked();
    }, 800);
  };

  // Add money credits to wallet
  const handleAddMoney = () => {
    if (offlineMode) {
      setToast({ type: "error", message: "Deposit failed. Canteen bank gateway is offline." });
      return;
    }
    setBalance(prev => prev + 100);
    
    // Add transaction log
    const newTxn = {
      id: "TXN-" + Math.floor(10000 + Math.random() * 90000),
      type: "credit",
      amount: 100,
      title: "Deposit (UPI Top-Up)",
      date: "Just now",
      status: "Success"
    };
    setTransactions(prev => [newTxn, ...prev]);
    setToast({ type: "success", message: "₹100 credited to your Canteen Wallet!" });
  };

  // Claim order token in DB
  const handleClaimToken = async (tokenID, e) => {
    e?.stopPropagation(); // Prevent opening modal
    if (offlineMode) {
      setToast({ type: "error", message: "Action failed. Canteen sync server is offline." });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "collected" })
        .eq("id", tokenID);

      if (error) throw error;

      setToast({ type: "success", message: `Token ${tokenID} claimed and order picked up!` });
      fetchStudentOrders();
      if (selectedToken?.id === tokenID) {
        setSelectedToken(null);
      }
    } catch (err) {
      console.error("Error claiming token:", err);
      setToast({ type: "error", message: "Failed to claim order token." });
    }
  };

  // Checkout and checkout payments inserting into Supabase orders table
  const handleCheckout = async () => {
    if (offlineMode) {
      setToast({ type: "error", message: "Payment failed. Bank server offline." });
      return;
    }

    if (itemCount === 0) return;

    if (balance < grandTotal) {
      setToast({
        type: "error",
        message: `Insufficient balance! Total: ₹${grandTotal}, Wallet: ₹${balance}.`,
      });
      return;
    }

    if (!selectedCanteen) {
      setToast({ type: "error", message: "Please select a canteen first." });
      return;
    }

    try {
      const orderId = "CB-" + Math.floor(10000 + Math.random() * 90000);

      const orderItems = Object.entries(cart).map(([itemId, qty]) => {
        const item = menuItems.find(food => food.id === itemId);
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          category: item.category
        };
      });

      const { error } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          student_id: user.id,
          canteen_id: selectedCanteen.id,
          status: "preparing",
          total_amount: grandTotal,
          items: orderItems
        });

      if (error) throw error;

      setBalance(prev => prev - grandTotal);

      // Create transaction debits
      const newTxns = orderItems.map(item => ({
        id: "TXN-" + Math.floor(10000 + Math.random() * 90000),
        type: "debit",
        amount: item.price * item.quantity,
        title: item.name,
        date: "Just now",
        status: "Success"
      }));

      setTransactions(prev => [...newTxns, ...prev]);
      setCart({});
      
      // Add alert notification
      const newNotif = {
        id: "notif-" + Math.floor(Math.random() * 1000),
        title: "Tokens Generated",
        body: `Successfully generated active canteen pick-up token ${orderId}.`,
        time: "1s ago",
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);

      setToast({
        type: "success",
        message: "Order placed! Digital pick-up pass generated.",
      });

      fetchStudentOrders();
    } catch (err) {
      console.error("Checkout database error:", err);
      setToast({ type: "error", message: err.message || "Failed to place order." });
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300 pb-16">
      
      {/* Toast Alert popups */}
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
            <Ticket className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <h1 className="font-heading text-lg font-extrabold tracking-tight leading-none">CampusBite</h1>
            <span className="hidden sm:inline text-[9px] font-extrabold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mt-1">
              digital canteen portal
            </span>
          </div>
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsLedgerOpen(false); // Close other drawer
              }}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-panel-dark/80 hover:bg-neutral-100 dark:hover:bg-neutral-850/80 transition-all text-neutral-600 dark:text-neutral-300 relative cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-brand text-[10px] font-extrabold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-panel-dark">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-panel-dark border border-border-light dark:border-border-dark rounded-2xl shadow-xl z-50 p-4 space-y-3.5 text-left"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-border-dark">
                    <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider">
                      Canteen System Alerts
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[9px] font-extrabold text-brand hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${
                            n.unread 
                              ? "bg-brand/5 border-brand/10 dark:bg-brand/10 dark:border-brand/10" 
                              : "bg-white/40 border-neutral-100 dark:bg-panel-dark dark:border-border-dark"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">{n.title}</span>
                            <span className="text-[9px] text-neutral-400 font-medium">{n.time}</span>
                          </div>
                          <p className="text-neutral-500 dark:text-neutral-450 mt-1 leading-normal text-[11px]">{n.body}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-neutral-450 py-4">No system notifications</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          <button
            onClick={() => navigate("/e2e-dashboard")}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-350 border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-panel-dark/80 hover:bg-neutral-100 dark:hover:bg-neutral-850/80 transition-all cursor-pointer"
          >
            <Terminal className="h-4 w-4 text-brand" />
            <span className="hidden md:inline">E2E Console</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Profile, Active Passes, Menu Search/Catalog (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* User profile & Wallet header card */}
          <div className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div className="flex items-center gap-4">
              <div className="h-13 w-13 rounded-2xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
                <User className="h-6.5 w-6.5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
                  Academic Affiliation Verified
                </span>
                <h2 className="font-heading text-lg md:text-xl font-extrabold tracking-tight mt-0.5">
                  Welcome, {user?.name || "STUDENT USER"}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {user?.department} ({user?.studentId})
                </p>
              </div>
            </div>

            {/* Wallet Panel with Ledger link */}
            <div className="flex items-center gap-4 p-3.5 bg-brand/5 dark:bg-brand/10 border border-brand/10 dark:border-brand/25 rounded-2xl w-full md:w-auto">
              <div className="p-3 bg-brand rounded-xl text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="flex justify-between items-center gap-6">
                  <span className="text-[9px] text-brand font-bold uppercase tracking-wider block">Wallet Balance</span>
                  <button
                    onClick={() => {
                      setIsLedgerOpen(true);
                      setIsNotifOpen(false);
                    }}
                    className="text-[9px] font-extrabold text-neutral-500 dark:text-neutral-400 hover:text-brand flex items-center gap-0.5 cursor-pointer underline"
                  >
                    <History className="h-3 w-3" /> Passbook
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-extrabold tracking-tight">₹{balance}</span>
                  <button 
                    onClick={handleAddMoney}
                    className="p-1 hover:bg-brand/10 rounded-lg text-brand transition-colors cursor-pointer"
                    title="Add Cash"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Canteen Selector */}
          <div className="space-y-3 text-left">
            <h3 className="font-heading text-xs font-extrabold tracking-widest uppercase text-neutral-450 dark:text-neutral-500 px-1">
              Select Canteen
            </h3>
            {loadingCanteens ? (
              <div className="flex items-center gap-2.5 p-4 glass-panel justify-center border-neutral-200 dark:border-border-dark">
                <Loader2 className="h-4.5 w-4.5 animate-spin text-brand" />
                <span className="text-xs font-bold text-neutral-500">Loading approved canteens...</span>
              </div>
            ) : canteens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {canteens.map((canteen) => (
                  <button
                    key={canteen.id}
                    onClick={() => setSelectedCanteen(canteen)}
                    className={`glass-panel p-4 text-left border transition-all duration-200 cursor-pointer ${
                      selectedCanteen?.id === canteen.id
                        ? "border-brand bg-brand/5 dark:bg-brand/10 shadow-sm"
                        : "border-neutral-250 hover:border-brand/40 dark:border-border-dark dark:hover:border-brand/20"
                    }`}
                  >
                    <span className="text-xl">🏪</span>
                    <h4 className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-2 truncate">
                      {canteen.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                      Status: Approved
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-6 text-center text-xs font-bold text-neutral-500 border-neutral-200 dark:border-border-dark">
                No approved canteens found. Administrators must approve canteen registration requests.
              </div>
            )}
          </div>

          {/* Active Tokens list */}
          {tokens.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading text-xs font-extrabold tracking-widest uppercase text-neutral-450 dark:text-neutral-500 text-left px-1">
                Your Digital Tokens (Click cards to track status)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tokens.map((token) => (
                  <motion.div
                    key={token.id}
                    layoutId={token.id}
                    onClick={() => setSelectedToken(token)}
                    className="glass-panel p-4 text-left border-neutral-200 dark:border-border-dark flex flex-col justify-between space-y-4 hover:border-brand/35 dark:hover:border-brand/20 hover:shadow-md cursor-pointer transition-all duration-200"
                    title="Click to track live preparation details"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider">Token Pass</span>
                        <h4 className="text-xs font-extrabold text-brand tracking-tight mt-0.5">{token.id}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                        token.status === "Ready" 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-brand/10 text-brand border-brand/20"
                      }`}>
                        {token.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-neutral-100/50 dark:bg-panel-dark/50 p-2.5 rounded-xl border border-neutral-200/30 dark:border-border-dark/50">
                      <span className="text-xl">🍲</span>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{token.item}</p>
                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold">
                          Qty: {token.count} • Collect: <strong className="text-neutral-600 dark:text-neutral-300">{token.counter.split(" ")[0]}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-brand hover:underline flex items-center gap-0.5">
                        Track live status <ChevronRight className="h-3 w-3" />
                      </span>
                      <button
                        onClick={(e) => handleClaimToken(token.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-extrabold rounded-lg hover:bg-neutral-850 dark:hover:bg-white transition-all cursor-pointer shadow-sm"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        Claim Order
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Canteen Search, Categories, & Catalog grid */}
          <div className="space-y-4 pt-2 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-1">
              <h3 className="font-heading text-lg font-extrabold tracking-tight">
                Canteen Menu Catalogue
              </h3>
              
              {/* Veg-Only neon switch toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Vegetarian Only</span>
                <button
                  onClick={() => setIsVegOnly(!isVegOnly)}
                  className={`h-5 w-9.5 rounded-full p-[2px] transition-colors duration-250 cursor-pointer border ${
                    isVegOnly 
                      ? "bg-emerald-500 border-emerald-500 veg-glow" 
                      : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-750"
                  }`}
                  role="switch"
                  aria-checked={isVegOnly}
                >
                  <div className={`h-3.5 w-3.5 rounded-full bg-white transition-transform duration-250 ${
                    isVegOnly ? "translate-x-4.5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>

            {/* Search and Category Filter section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Category tabs (horizontal scroll) */}
              <div className="md:col-span-8 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {FOOD_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border flex-shrink-0 ${
                      activeCategory === category
                        ? "bg-brand text-white border-brand shadow-sm shadow-brand/10 scale-105"
                        : "bg-white dark:bg-panel-dark text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Search box input */}
              <div className="md:col-span-4 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search catalogue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-panel-dark/50 backdrop-blur-md outline-none text-neutral-800 dark:text-neutral-100 text-xs font-medium focus:border-brand dark:focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Catalogue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingMenu ? (
                <div className="col-span-2 glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <h4 className="font-heading text-sm font-bold text-neutral-700 dark:text-neutral-300">Loading menu items...</h4>
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const cartQty = cart[item.id] || 0;

                  return (
                    <div
                      key={item.id}
                      className="glass-panel p-4.5 flex gap-4 text-left hover:scale-[1.005] hover:shadow-md hover:border-brand/20 dark:hover:border-brand/10 transition-all duration-200"
                    >
                      <div className="h-20 w-20 rounded-2xl bg-neutral-100 dark:bg-panel-dark border border-neutral-200/50 dark:border-border-dark flex-shrink-0 flex items-center justify-center text-4xl relative">
                        {item.img}
                        <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 shadow-sm border border-neutral-150 dark:border-neutral-750 font-bold scale-90">
                          {item.category.slice(0, -1)}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            {/* Swiggy veg/nonveg square border badge */}
                            <div className={`h-4.5 w-4.5 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                              item.is_veg 
                                ? "border-emerald-500 text-emerald-500" 
                                : "border-rose-500 text-rose-500"
                            }`}>
                              <span className={`h-2 w-2 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-rose-500"}`} />
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-450 font-bold bg-neutral-100/55 dark:bg-panel-dark/80 px-2 py-0.5 rounded-md border border-neutral-150/40 dark:border-border-dark">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{item.prep_time}</span>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="text-sm font-extrabold tracking-tight">{item.name}</h4>
                            <p className="text-[11px] text-neutral-455 dark:text-neutral-500 leading-normal line-clamp-2">
                              {item.desc_text}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-0.5">
                          <span className="text-base font-extrabold text-brand">₹{item.price}</span>
                          
                          {cartQty > 0 ? (
                            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl border border-brand/30 bg-brand/5 dark:bg-brand/10 text-brand text-xs font-extrabold">
                              <button 
                                onClick={() => handleRemoveOneFromCart(item.id)}
                                className="p-0.5 hover:bg-brand/10 rounded-md transition-colors cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5 stroke-[3]" />
                              </button>
                              <span className="w-4 text-center">{cartQty}</span>
                              <button 
                                onClick={() => handleAddToCart(item.id)}
                                className="p-0.5 hover:bg-brand/10 rounded-md transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item.id)}
                              className="px-4 py-1.5 border border-brand/30 bg-brand/5 dark:bg-brand/10 text-brand text-xs font-extrabold rounded-xl hover:bg-brand hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5 stroke-[3]" />
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-3">
                  <span className="text-4xl">🔍</span>
                  <h4 className="font-heading text-sm font-bold text-neutral-700 dark:text-neutral-300">No items match your search</h4>
                  <p className="text-xs text-neutral-450 max-w-xs leading-relaxed">
                    Try adjusting your filters or search query to explore other food options.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Swiggy Cart Panel & Outage Controller (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Swiggy Shopping Cart Panel */}
          <div className="glass-panel p-5 text-left flex flex-col justify-between border-neutral-200 dark:border-border-dark space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-border-dark">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-brand" />
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider">
                  Canteen Cart
                </h3>
              </div>
              {itemCount > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[10px] font-bold text-neutral-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {itemCount > 0 ? (
                Object.entries(cart).map(([itemId, qty]) => {
                  const item = menuItems.find(food => food.id === itemId);
                  if (!item) return null;
                  
                  return (
                    <div key={itemId} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2.5 max-w-[60%]">
                        <div className={`h-3.5 w-3.5 border rounded flex-shrink-0 flex items-center justify-center ${
                          item.is_veg ? "border-emerald-500" : "border-rose-500"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-rose-500"}`} />
                        </div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 border border-brand/20 bg-brand/5 dark:bg-brand/10 text-brand text-[10px] font-extrabold rounded-lg px-1.5 py-0.5">
                          <button onClick={() => handleRemoveOneFromCart(itemId)} className="cursor-pointer">
                            <Minus className="h-3.5 w-3.5 stroke-[3]" />
                          </button>
                          <span>{qty}</span>
                          <button onClick={() => handleAddToCart(itemId)} className="cursor-pointer">
                            <Plus className="h-3.5 w-3.5 stroke-[3]" />
                          </button>
                        </div>
                        <span className="font-extrabold text-neutral-800 dark:text-neutral-100 min-w-[45px] text-right">
                          ₹{item.price * qty}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="text-3xl animate-bounce" style={{ animationDuration: "3s" }}>🛒</div>
                  <p className="text-xs text-neutral-450 font-bold">Your cart is empty</p>
                  <p className="text-[10px] text-neutral-400 max-w-[180px] mx-auto leading-relaxed">
                    Add delicious canteen dishes from the menu to buy tokens.
                  </p>
                </div>
              )}
            </div>

            {/* Cart Billing breakdown */}
            {itemCount > 0 && (
              <div className="border-t border-neutral-100 dark:border-border-dark pt-4 space-y-2.5 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[11px] items-center">
                  <span className="flex items-center gap-1">
                    Canteen Handling Charge 
                    <HelpCircle className="h-3 w-3 text-neutral-400" title="Fixed charge for packing & tokens dispatch." />
                  </span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">₹{handlingCharge}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Canteen GST (5%)</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">₹{gst}</span>
                </div>
                
                <div className="flex justify-between border-t border-dashed border-neutral-200 dark:border-border-dark pt-3 text-sm font-extrabold text-neutral-800 dark:text-neutral-100">
                  <span>TO PAY</span>
                  <span className="text-brand">₹{grandTotal}</span>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/25 transition-all cursor-pointer mt-4"
                >
                  Pay & Generate Pass
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Quick Demo Controller Panel */}
          <div className="glass-panel border-brand/25 dark:border-brand/10 p-5 text-left bg-gradient-to-b from-brand/5 to-transparent dark:from-neutral-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-4.5 w-4.5 text-brand" />
              <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-brand">
                Demo Auth Controller
              </h3>
            </div>

            <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed mb-4">
              Trigger simulated HTTP error codes to test route restrictions, timeouts, and network failure messages.
            </p>

            <div className="space-y-3">
              {/* Timeout simulation */}
              <div className="p-2.5 bg-neutral-100/50 dark:bg-panel-dark/65 rounded-2xl flex justify-between items-center border border-neutral-200/40 dark:border-border-dark">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <Hourglass className="h-3.5 w-3.5 text-amber-500" />
                    Session Timeout
                  </h4>
                  <p className="text-[9px] text-neutral-450">Force 401 Expiration</p>
                </div>
                <button
                  onClick={handleSimulateTimeout}
                  className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Expire
                </button>
              </div>

              {/* Lockout simulation */}
              <div className="p-2.5 bg-neutral-100/50 dark:bg-panel-dark/65 rounded-2xl flex justify-between items-center border border-neutral-200/40 dark:border-border-dark">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldX className="h-3.5 w-3.5 text-rose-500" />
                    Account Lockout
                  </h4>
                  <p className="text-[9px] text-neutral-450">Force 423 Lockout</p>
                </div>
                <button
                  onClick={handleSimulateLockout}
                  className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Lock
                </button>
              </div>

              {/* Offline mode simulation */}
              <div className="p-2.5 bg-neutral-100/50 dark:bg-panel-dark/65 rounded-2xl flex justify-between items-center border border-neutral-200/40 dark:border-border-dark">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <ServerOff className="h-3.5 w-3.5 text-neutral-500" />
                    Offline Server
                  </h4>
                  <p className="text-[9px] text-neutral-450">Force 503 Outage</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineMode}
                    onChange={handleOfflineToggle}
                    className="sr-only peer cursor-pointer"
                  />
                  <div className="w-8.5 h-4.5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-brand" />
                </label>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Slide-out Transaction Passbook Ledger Drawer (Right Side) */}
      <AnimatePresence>
        {isLedgerOpen && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLedgerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-panel-dark border-l border-border-light dark:border-border-dark p-6 shadow-2xl flex flex-col justify-between text-left"
            >
              <div className="space-y-5 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-border-dark">
                  <div className="flex items-center gap-2.5">
                    <History className="h-5 w-5 text-brand" />
                    <h3 className="font-heading text-base font-extrabold uppercase tracking-wider">
                      Wallet Passbook
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsLedgerOpen(false)}
                    className="p-1 rounded-lg hover:bg-neutral-150 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {transactions.map((txn) => (
                    <div 
                      key={txn.id} 
                      className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-150/40 dark:border-border-dark/50 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div className="space-y-1 max-w-[65%]">
                        <p className="font-bold text-neutral-800 dark:text-neutral-250 truncate">{txn.title}</p>
                        <p className="text-[10px] text-neutral-450">{txn.date} • ID: {txn.id}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-extrabold text-sm flex items-center justify-end gap-1 ${
                          txn.type === "credit" ? "text-emerald-500" : "text-rose-500"
                        }`}>
                          {txn.type === "credit" ? (
                            <>
                              <ArrowDownLeft className="h-3 w-3" /> +₹{txn.amount}
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3" /> -₹{txn.amount}
                            </>
                          )}
                        </span>
                        <span className="text-[8px] font-bold uppercase text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Token Preparation Details Stepper Modal */}
      <AnimatePresence>
        {selectedToken && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedToken(null)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 m-auto z-50 h-fit max-w-sm w-full bg-white dark:bg-panel-dark border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center pb-3.5 border-b border-neutral-100 dark:border-border-dark">
                <div className="flex items-center gap-2 text-brand">
                  <Ticket className="h-5 w-5" />
                  <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider">
                    Preparation Tracker
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="p-1 rounded-lg hover:bg-neutral-150 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Barcode scan receipt details */}
              <div className="py-4 space-y-4 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider">Active Token ID</span>
                  <h4 className="text-base font-extrabold text-neutral-800 dark:text-neutral-100">{selectedToken.id}</h4>
                </div>

                {/* Laser scanning visual scanner bar */}
                <div className="relative w-48 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mx-auto flex items-center justify-center overflow-hidden border border-neutral-200/50 dark:border-border-dark">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-brand dark:bg-brand/80 opacity-70 animate-bounce pointer-events-none" style={{ animationDuration: "4s" }} />
                  <QrCode className="h-12 w-12 text-neutral-800 dark:text-neutral-200" />
                </div>

                {/* Stepper Status tracker */}
                <div className="pt-2 max-w-[280px] mx-auto text-left relative pl-8 space-y-6">
                  {/* Vertical Dotted connecting line */}
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 stepper-line pointer-events-none" />

                  {/* Step 1: Received */}
                  <div className="relative flex gap-3.5 items-start">
                    <div className="absolute -left-8 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-panel-dark text-xs font-bold shadow-sm">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-250">Order Received</h5>
                      <p className="text-[10px] text-neutral-450">Payment verified successfully.</p>
                    </div>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className="relative flex gap-3.5 items-start">
                    <div className={`absolute -left-8 h-7 w-7 rounded-full flex items-center justify-center border-2 border-white dark:border-panel-dark text-xs font-bold shadow-sm transition-all duration-300 ${
                      selectedToken.status === "Ready" || selectedToken.status === "Preparing"
                        ? "bg-brand text-white"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400"
                    }`}>
                      {selectedToken.status === "Ready" ? "✓" : "2"}
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${
                        selectedToken.status === "Ready" || selectedToken.status === "Preparing"
                          ? "text-neutral-850 dark:text-neutral-200"
                          : "text-neutral-400"
                      }`}>
                        Preparing Meal
                      </h5>
                      <p className="text-[10px] text-neutral-450">Counter chef preparing your dish.</p>
                    </div>
                  </div>

                  {/* Step 3: Ready for pickup */}
                  <div className="relative flex gap-3.5 items-start">
                    <div className={`absolute -left-8 h-7 w-7 rounded-full flex items-center justify-center border-2 border-white dark:border-panel-dark text-xs font-bold shadow-sm transition-all duration-300 ${
                      selectedToken.status === "Ready"
                        ? "bg-emerald-500 text-white"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400"
                    }`}>
                      3
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${
                        selectedToken.status === "Ready"
                          ? "text-neutral-850 dark:text-neutral-200"
                          : "text-neutral-400"
                      }`}>
                        Ready at Counter
                      </h5>
                      <p className="text-[10px] text-neutral-450">Show code at Counter for pickup.</p>
                    </div>
                  </div>
                </div>

                {/* Print/Download controls */}
                <div className="flex gap-2.5 pt-4">
                  <button
                    onClick={() => triggerCustomToast("info", "Receipt printed successfully! (Mock Action)")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-[10px] font-bold rounded-xl transition-all cursor-pointer text-neutral-600 dark:text-neutral-350"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Receipt
                  </button>
                  <button
                    onClick={() => triggerCustomToast("success", "Voucher downloaded to your downloads! (Mock Action)")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-850 dark:hover:bg-white text-[10px] font-bold rounded-xl transition-all cursor-pointer text-white dark:text-neutral-900 shadow-sm"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Claim Food
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
