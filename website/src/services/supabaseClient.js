import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are placeholders, empty, or invalid
const isValidConfig = 
  import.meta.env.VITE_USE_MOCK_SUPABASE !== 'true' &&
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
  // In-memory mock database for frontend testing and CI/CD pipelines
  const mockCanteens = [
    {
      id: "e33f4f26-c16a-4020-a74f-f4e013ef1f28",
      name: "H1 Owner Canteen",
      owner_id: "mock-owner-id-123",
      status: "approved",
      cuisine_type: "Indian",
      rating: 4.8
    }
  ];

  const mockMenuItems = [
    {
      id: "mock-menu-item-1",
      canteen_id: "e33f4f26-c16a-4020-a74f-f4e013ef1f28",
      name: "Veg Burger",
      price: 80,
      is_active: true,
      category: "Snacks",
      is_veg: true,
      image_url: null,
      description: "Crispy veg patty burger"
    },
    {
      id: "mock-menu-item-2",
      canteen_id: "e33f4f26-c16a-4020-a74f-f4e013ef1f28",
      name: "Masala Dosa",
      price: 60,
      is_active: true,
      category: "South Indian",
      is_veg: true,
      image_url: null,
      description: "South Indian crepe served with chutney and sambar"
    }
  ];

  const mockOrders = [];

  const mockProfiles = [
    {
      id: "mock-supabase-uuid-1234",
      full_name: "JOHN DOE",
      student_id: "CS-2026-928",
      department: "Computer Science & Engineering",
      academic_year: "3rd Year",
      phone: "+91 98765 43210",
      role: "student"
    }
  ];

  const makeMockQueryBuilder = (table) => {
    console.log("[Supabase Mock] from table:", table);
    let mockData = [];
    if (table === "canteens") mockData = mockCanteens;
    if (table === "menu_items") mockData = mockMenuItems;
    if (table === "orders") mockData = mockOrders;
    if (table === "profiles") mockData = mockProfiles;

    const chainObj = {
      select: () => chainObj,
      eq: (col, val) => {
        if (col === "id" || col === "student_id") {
          mockData = mockData.filter(item => item.id === val || item.student_id === val);
        }
        if (col === "canteen_id") {
          mockData = mockData.filter(item => item.canteen_id === val);
        }
        return chainObj;
      },
      neq: (col, val) => {
        if (col === "status") {
          mockData = mockData.filter(item => item.status !== val);
        }
        return chainObj;
      },
      order: () => chainObj,
      single: async () => ({ data: mockData[0] || null, error: null }),
      maybeSingle: async () => ({ data: mockData[0] || null, error: null }),
      insert: (newData) => {
        const items = Array.isArray(newData) ? newData : [newData];
        items.forEach(item => {
          const inserted = {
            id: item.id || "mock-order-id-" + Math.floor(Math.random() * 1000000),
            created_at: new Date().toISOString(),
            ...item
          };
          mockOrders.push(inserted);
        });
        mockData = items;
        return chainObj;
      },
      update: (updateData) => {
        mockData.forEach(item => {
          Object.assign(item, updateData);
        });
        return chainObj;
      },
      delete: async () => {
        return { data: null, error: null };
      },
      then: (resolve) => {
        resolve({ data: mockData, error: null });
      }
    };
    return chainObj;
  };

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
        console.log("[Supabase Mock] signInWithPassword called for email:", email);
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
        console.log("[Supabase Mock] signUp called for email:", email);
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const user = {
          id: "mock-supabase-uuid-5678",
          email: email,
          user_metadata: options?.data || options?.options?.data || {
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
    from: (table) => makeMockQueryBuilder(table),
    channel: (name) => {
      const channelObj = {
        on: () => channelObj,
        subscribe: () => channelObj,
      };
      return channelObj;
    },
    removeChannel: () => {},
    isMock: true
  };
}

export const supabase = supabaseInstance;
