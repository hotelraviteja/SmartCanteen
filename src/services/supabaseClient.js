import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are placeholders, empty, or invalid
const isValidConfig = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "" &&
  supabaseAnonKey !== "" &&
  !supabaseUrl.includes("your-project-id") && 
  !supabaseAnonKey.includes("your-anon-key-here") &&
  !supabaseAnonKey.includes("your-key-here");

let supabaseInstance;
let isMock = false;

if (isValidConfig) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase Client initialized successfully with environment variables.");
  } catch (error) {
    console.error("Error creating Supabase client. Falling back to Mock client:", error);
    isMock = true;
  }
} else {
  console.warn("Supabase credentials not configured or using placeholders. Falling back to local Mock Auth.");
  isMock = true;
}

if (isMock) {
  // Mock interface mimicking the Supabase Auth APIs for UI development
  supabaseInstance = {
    auth: {
      getSession: async () => {
        const storedUser = localStorage.getItem("campusbite_user");
        const storedToken = localStorage.getItem("campusbite_token");
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          return { data: { session: { user, access_token: storedToken } }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      
      onAuthStateChange: (callback) => {
        // Return dummy unsubscribe method
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        };
      },
      
      signInWithPassword: async ({ email, password }) => {
        // Simulate minor delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        if (password.toLowerCase().includes("wrong")) {
          return { 
            data: { user: null, session: null }, 
            error: { message: "Invalid email or password. Please try again." } 
          };
        }
        
        const user = {
          id: "mock-supabase-uuid-1234",
          email: email,
          user_metadata: {
            full_name: email.split("@")[0].replace(".", " ").toUpperCase(),
            avatar_url: null
          }
        };
        const session = {
          access_token: "mock-supabase-jwt-token-xyz-123",
          user
        };
        
        return { data: { user, session }, error: null };
      },
      
      signUp: async ({ email, password, options }) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const user = {
          id: "mock-supabase-uuid-5678",
          email: email,
          user_metadata: options?.options?.data || {
            full_name: email.split("@")[0].replace(".", " ").toUpperCase()
          }
        };
        
        return { data: { user, session: null }, error: null };
      },
      
      signInWithOAuth: async ({ provider, options }) => {
        console.log(`[Supabase Mock] Initiating sign-in with OAuth provider: ${provider}`);
        alert(`[Supabase Mock] Redirecting to ${provider} OAuth sign-in... (Once configured with real keys, this redirects directly to Google's authentication page)`);
        
        // Simulate successful login after redirection by setting local storage & refreshing
        const mockUser = {
          id: "mock-supabase-google-uuid",
          email: "google.student@college.edu",
          user_metadata: {
            full_name: "GOOGLE STUDENT",
            avatar_url: "https://lh3.googleusercontent.com/a/default-user"
          }
        };
        
        localStorage.setItem("campusbite_user", JSON.stringify(mockUser));
        localStorage.setItem("campusbite_token", "mock-supabase-google-jwt");
        
        window.location.reload();
        return { data: {}, error: null };
      },
      
      signOut: async () => {
        return { error: null };
      },
      
      verifyOtp: async ({ email, token, type }) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (token !== "123456" && token !== "000000") {
          return { 
            data: { user: null, session: null }, 
            error: { message: "Incorrect OTP code. Please check and try again. (Hint: Use 123456)" } 
          };
        }
        const user = {
          id: "mock-supabase-uuid-otp",
          email: email,
          user_metadata: {
            full_name: email.split("@")[0].replace(".", " ").toUpperCase()
          }
        };
        const session = {
          access_token: "mock-supabase-otp-jwt",
          user
        };
        return { data: { user, session }, error: null };
      },
      
      resetPasswordForEmail: async (email, options) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { data: {}, error: null };
      },
      
      updateUser: async (attributes) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { data: { user: { email: "student@college.edu" } }, error: null };
      }
    },
    isMock: true
  };
}

export const supabase = supabaseInstance;
