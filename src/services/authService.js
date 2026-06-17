import { supabase } from "./supabaseClient";

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Map Supabase user profile metadata to the application format
    return {
      user: {
        name: data.user.user_metadata?.full_name || email.split("@")[0].replace(".", " ").toUpperCase(),
        email: data.user.email,
        studentId: data.user.user_metadata?.student_id || "CB-" + Math.floor(100000 + Math.random() * 900000),
        department: data.user.user_metadata?.department || "Computer Science & Engineering",
        academicYear: data.user.user_metadata?.academic_year || "3rd Year",
        phone: data.user.phone || data.user.user_metadata?.phone || "+91 98765 43210"
      },
      token: data.session?.access_token || "mock-jwt-token-xyz-123"
    };
  },

  register: async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName || userData.name,
          student_id: userData.studentId || "CB-" + Math.floor(100000 + Math.random() * 900000),
          department: userData.department || "Computer Science & Engineering",
          academic_year: userData.academicYear || "3rd Year",
          phone: userData.phone || "+91 98765 43210"
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Registration successful! Please check your email for the verification link.",
      user: data.user
    };
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard"
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  requestOTP: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/reset-password",
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: "Password reset link sent to your email." };
  },

  verifyOTP: async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup"
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  },

  resetPassword: async (email, newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  },

  verifyEmail: async (email) => {
    return { success: true };
  }
};

