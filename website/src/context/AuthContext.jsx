import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { supabase } from "../services/supabaseClient";
import apiClient from "../services/apiClient";
import { STORAGE_KEYS } from "../utils/constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Initialize Auth State from Supabase and setup listeners
  useEffect(() => {
    const hasHashToken = window.location.hash.includes("access_token") || 
                         window.location.hash.includes("id_token") ||
                         window.location.hash.includes("type=recovery") ||
                         window.location.search.includes("access_token");

    const initializeAuth = async () => {
      const storedLocked = localStorage.getItem("campusbite_locked") === "true";
      if (storedLocked) {
        setIsLocked(true);
      }

      if (hasHashToken) {
        // Fallback timeout to prevent permanent loading if callback fails
        setTimeout(() => {
          setLoading(false);
        }, 3500);
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !storedLocked) {
          // Fetch profile details from profiles table
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          const userObj = {
            id: session.user.id,
            name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email.split("@")[0].replace(".", " ").toUpperCase(),
            email: session.user.email,
            studentId: profileData?.student_id || session.user.user_metadata?.student_id || "CB-" + Math.floor(100000 + Math.random() * 900000),
            department: profileData?.department || session.user.user_metadata?.department || "Computer Science & Engineering",
            academicYear: profileData?.academic_year || session.user.user_metadata?.academic_year || "3rd Year",
            phone: session.user.phone || profileData?.phone || session.user.user_metadata?.phone || "+91 98765 43210",
            role: profileData?.role || "student",
            canteenName: profileData?.canteen_name || ""
          };
          setUser(userObj);
          setToken(session.access_token);
          setIsAuthenticated(true);

          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
          localStorage.setItem(STORAGE_KEYS.TOKEN, session.access_token);
        }
      } catch (error) {
        console.error("Failed to load user session from Supabase:", error);
      } finally {
        if (!hasHashToken) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Catch sign-ins and sign-outs across browser tabs/redirection
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Fetch profile details from profiles table
        let profileData = null;
        try {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          profileData = data;
        } catch (err) {
          console.error("Error loading profile on auth state change:", err);
        }

        const userObj = {
          id: session.user.id,
          name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email.split("@")[0].replace(".", " ").toUpperCase(),
          email: session.user.email,
          studentId: profileData?.student_id || session.user.user_metadata?.student_id || "CB-" + Math.floor(100000 + Math.random() * 900000),
          department: profileData?.department || session.user.user_metadata?.department || "Computer Science & Engineering",
          academicYear: profileData?.academic_year || session.user.user_metadata?.academic_year || "3rd Year",
          phone: session.user.phone || profileData?.phone || session.user.user_metadata?.phone || "+91 98765 43210",
          role: profileData?.role || "student",
          canteenName: profileData?.canteen_name || ""
        };
        setUser(userObj);
        setToken(session.access_token);
        setIsAuthenticated(true);

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEYS.TOKEN, session.access_token);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setLoading(false);
      } else {
        if (!hasHashToken) {
          setLoading(false);
        }
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      // If already locked, block
      if (isLocked) {
        throw new Error("Account is currently locked. Please recover your account.");
      }

      const data = await authService.login(email, password);

      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      setLoginAttempts(0);
      setIsSessionExpired(false);

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
      }

      return data.user;
    } catch (error) {
      // Increment login attempts on credential failures
      const errMsg = error.response?.data?.message || error.message || "Failed to log in";
      if (errMsg.toLowerCase().includes("invalid email or password") || errMsg.toLowerCase().includes("invalid login credentials")) {
        const nextAttempts = loginAttempts + 1;
        setLoginAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          simulateAccountLocked();
          throw new Error("Account locked due to 5 consecutive failed login attempts.");
        }
      }
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Supabase signOut error:", error);
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsSessionExpired(false);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  const loginWithGoogle = async () => {
    try {
      const data = await authService.loginWithGoogle();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const data = await authService.verifyOTP(email, otp);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const data = await authService.resetPassword(email, newPassword);
      // If resetting a locked account, unlock it
      if (isLocked) {
        unlockAccount();
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const unlockAccount = () => {
    setIsLocked(false);
    setLoginAttempts(0);
    localStorage.removeItem("campusbite_locked");
  };

  const clearSessionExpiry = () => {
    setIsSessionExpired(false);
    apiClient.simulation.shouldExpireSession = false;
  };

  const simulateSessionExpired = async () => {
    await logout();
    setIsSessionExpired(true);
    apiClient.simulation.shouldExpireSession = true;
  };

  const simulateAccountLocked = async () => {
    await logout();
    setIsLocked(true);
    localStorage.setItem("campusbite_locked", "true");
    apiClient.simulation.shouldLockAccount = true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        isLocked,
        isSessionExpired,
        loginAttempts,
        login,
        loginWithGoogle,
        register,
        logout,
        verifyOTP,
        resetPassword,
        unlockAccount,
        clearSessionExpiry,
        simulateSessionExpired,
        simulateAccountLocked,
        apiClient // Exposed for the demo control panel
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
