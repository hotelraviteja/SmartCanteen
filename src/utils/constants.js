export const APP_NAME = "CampusBite";
export const TAGLINE = "Order Fast. Skip the Queue.";
export const ALT_TAGLINE = "Smart Food Ordering for Smarter Campuses.";

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Basic Sciences"
];

export const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year"
];

export const STORAGE_KEYS = {
  THEME: "campusbite_theme",
  USER: "campusbite_user",
  TOKEN: "campusbite_token",
  REMEMBER_EMAIL: "campusbite_remembered_email"
};

export const FOOD_CATEGORIES = [
  "All",
  "Veg Specials",
  "Non-Veg Specials",
  "Beverages & Juices",
  "Snacks & Desserts"
];

export const CANTEEN_CATALOGUE = [
  // Veg Specials Category
  {
    id: "item-1",
    name: "Paneer Butter Masala Combo",
    price: 120,
    prepTime: "10 min",
    rating: "4.8",
    img: "🍛",
    category: "Veg Specials",
    isVeg: true,
    desc: "Soft paneer cubes cooked in rich butter gravy, served with 2 Butter Rotis."
  },
  {
    id: "item-2",
    name: "Classic Tomato Rice",
    price: 70,
    prepTime: "6 min",
    rating: "4.6",
    img: "🍅",
    category: "Veg Specials",
    isVeg: true,
    desc: "Tangy and aromatic rice cooked with tempered tomatoes, mustard seeds, and fresh curry leaves."
  },
  {
    id: "item-3",
    name: "Standard Veg Meals",
    price: 90,
    prepTime: "8 min",
    rating: "4.7",
    img: "🍱",
    category: "Veg Specials",
    isVeg: true,
    desc: "Complete South Indian meals with Steamed Rice, Sambar, Rasam, Curd, and Special Poriyal."
  },
  {
    id: "item-4",
    name: "Chapathi Kurma Combo",
    price: 40,
    prepTime: "5 min",
    rating: "4.5",
    img: "🫓",
    category: "Veg Specials",
    isVeg: true,
    desc: "2 pieces of soft whole-wheat chapathis served with aromatic vegetable kurma."
  },

  // Non-Veg Specials Category
  {
    id: "item-5",
    name: "Special Chicken Biryani",
    price: 160,
    prepTime: "12 min",
    rating: "4.9",
    img: "🍚",
    category: "Non-Veg Specials",
    isVeg: false,
    desc: "Premium basmati rice layered with slow-cooked spiced chicken, served with onion raita."
  },
  {
    id: "item-6",
    name: "Egg & Chicken Mixed Rice",
    price: 80,
    prepTime: "9 min",
    rating: "4.7",
    img: "🍳",
    category: "Non-Veg Specials",
    isVeg: false,
    desc: "Stir-fried basmati rice cooked with shredded chicken, scrambled egg, and scallions."
  },
  {
    id: "item-7",
    name: "Malabar Parotta Combo",
    price: 100,
    prepTime: "8 min",
    rating: "4.8",
    img: "🫓",
    category: "Non-Veg Specials",
    isVeg: false,
    desc: "2 flaky layered Malabar parottas served with spicy chicken gravy."
  },

  // Beverages & Juices Category
  {
    id: "item-8",
    name: "Fresh Mango Juice",
    price: 50,
    prepTime: "3 min",
    rating: "4.7",
    img: "🥭",
    category: "Beverages & Juices",
    isVeg: true,
    desc: "Thick and chilled mango nectar squeezed from sweet ripe campus mangoes."
  },
  {
    id: "item-9",
    name: "Fresh Watermelon Juice",
    price: 45,
    prepTime: "3 min",
    rating: "4.6",
    img: "🍉",
    category: "Beverages & Juices",
    isVeg: true,
    desc: "Refreshing, hydrating watermelon juice blended with a hint of mint and black salt."
  },
  {
    id: "item-10",
    name: "Fresh Apple Juice",
    price: 60,
    prepTime: "4 min",
    rating: "4.5",
    img: "🍎",
    category: "Beverages & Juices",
    isVeg: true,
    desc: "Pure red apple juice extracted fresh, rich in vitamins with no added sugar."
  },
  {
    id: "item-11",
    name: "Premium Dragon Fruit Juice",
    price: 70,
    prepTime: "4 min",
    rating: "4.8",
    img: "🥤",
    category: "Beverages & Juices",
    isVeg: true,
    desc: "Vibrant pink dragon fruit pulp blended with light honey and crushed ice."
  },
  {
    id: "item-12",
    name: "Cold Coffee with Ice Cream",
    price: 60,
    prepTime: "4 min",
    rating: "4.8",
    img: "☕",
    category: "Beverages & Juices",
    isVeg: true,
    desc: "Double-shot espresso blended cold brew topped with a rich vanilla scoop."
  },
  {
    id: "item-13",
    name: "Mineral Water Bottle (1L)",
    price: 20,
    prepTime: "1 min",
    rating: "4.9",
    img: "🍼",
    category: "Beverages & Juices",
    isVeg: true,
    desc: "Chilled, packaged mineral water bottle with electrolytes."
  },

  // Snacks & Desserts Category
  {
    id: "item-14",
    name: "Hot Veg Samosa (2 Pcs)",
    price: 30,
    prepTime: "3 min",
    rating: "4.6",
    img: "🥟",
    category: "Snacks & Desserts",
    isVeg: true,
    desc: "Crispy fried pastry triangles stuffed with spiced potatoes and green peas, served with sweet chutney."
  },
  {
    id: "item-15",
    name: "Cheese Grilled Sandwich",
    price: 65,
    prepTime: "5 min",
    rating: "4.6",
    img: "🥪",
    category: "Snacks & Desserts",
    isVeg: true,
    desc: "Golden toasted bread stuffed with molten mozzarella cheese, capsicum, and sweet corn."
  },
  {
    id: "item-16",
    name: "Fudge Chocolate Brownie",
    price: 75,
    prepTime: "5 min",
    rating: "4.9",
    img: "🍰",
    category: "Snacks & Desserts",
    isVeg: true,
    desc: "Warm fudgy dark chocolate cake loaded with walnuts and hot chocolate drizzle."
  },
  {
    id: "item-17",
    name: "Gulab Jamun (2 Pcs)",
    price: 35,
    prepTime: "2 min",
    rating: "4.7",
    img: "🍩",
    category: "Snacks & Desserts",
    isVeg: true,
    desc: "Classic soft fried cottage cheese balls soaked in warm sweet cardamom sugar syrup."
  }
];

export const MOCK_POPULAR_ITEMS = CANTEEN_CATALOGUE.slice(0, 4);

export const MOCK_TRANSACTIONS = [
  { id: "TXN-8291", type: "debit", amount: 120, title: "Paneer Butter Masala Combo", date: "Today, 12:42 PM", status: "Success" },
  { id: "TXN-1029", type: "credit", amount: 200, title: "Deposit (GPay UPI)", date: "Yesterday, 04:15 PM", status: "Success" },
  { id: "TXN-7362", type: "debit", amount: 65, title: "Cheese Grilled Sandwich", date: "14 Jun, 01:10 PM", status: "Success" },
  { id: "TXN-3921", type: "debit", amount: 45, title: "Chilled Mango Lassi", date: "12 Jun, 11:30 AM", status: "Success" }
];

export const MOCK_NOTIFICATIONS = [
  { id: "notif-1", title: "Order Ready!", body: "Your Sandwich token #CB-3721 is now READY at Counter 1.", time: "2m ago", unread: true },
  { id: "notif-2", title: "Wallet Credited", body: "₹200 deposited successfully into your Canteen Wallet.", time: "1d ago", unread: false },
  { id: "notif-3", title: "Brownie Back in Stock", body: "Chocolate Fudge Brownie is now serving at Desserts counter.", time: "3d ago", unread: false }
];
