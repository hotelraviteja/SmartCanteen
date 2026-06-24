import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhcqbsgapavchsobmlbs.supabase.co';
const supabaseAnonKey = 'sb_publishable_KOT0ItSMwvnZE-kUwyN_QQ_xan9z07D';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CANTEEN_CATALOGUE = [
  { name: "Paneer Butter Masala Combo", price: 120, prepTime: "10 min", rating: "4.8", img: "🍛", category: "Veg Specials", isVeg: true, desc: "Soft paneer cubes cooked in rich butter gravy, served with 2 Butter Rotis." },
  { name: "Classic Tomato Rice", price: 70, prepTime: "6 min", rating: "4.6", img: "🍅", category: "Veg Specials", isVeg: true, desc: "Tangy and aromatic rice cooked with tempered tomatoes, mustard seeds, and fresh curry leaves." },
  { name: "Standard Veg Meals", price: 90, prepTime: "8 min", rating: "4.7", img: "🍱", category: "Veg Specials", isVeg: true, desc: "Complete South Indian meals with Steamed Rice, Sambar, Rasam, Curd, and Special Poriyal." },
  { name: "Chapathi Kurma Combo", price: 40, prepTime: "5 min", rating: "4.5", img: "🫓", category: "Veg Specials", isVeg: true, desc: "2 pieces of soft whole-wheat chapathis served with aromatic vegetable kurma." },
  { name: "Special Chicken Biryani", price: 160, prepTime: "12 min", rating: "4.9", img: "🍚", category: "Non-Veg Specials", isVeg: false, desc: "Premium basmati rice layered with slow-cooked spiced chicken, served with onion raita." },
  { name: "Egg & Chicken Mixed Rice", price: 80, prepTime: "9 min", rating: "4.7", img: "🍳", category: "Non-Veg Specials", isVeg: false, desc: "Stir-fried basmati rice cooked with shredded chicken, scrambled egg, and scallions." },
  { name: "Malabar Parotta Combo", price: 100, prepTime: "8 min", rating: "4.8", img: "🫓", category: "Non-Veg Specials", isVeg: false, desc: "2 flaky layered Malabar parottas served with spicy chicken gravy." },
  { name: "Fresh Mango Juice", price: 50, prepTime: "3 min", rating: "4.7", img: "🥭", category: "Beverages & Juices", isVeg: true, desc: "Thick and chilled mango nectar squeezed from sweet ripe campus mangoes." },
  { name: "Fresh Watermelon Juice", price: 45, prepTime: "3 min", rating: "4.6", img: "🍉", category: "Beverages & Juices", isVeg: true, desc: "Refreshing, hydrating watermelon juice blended with a hint of mint and black salt." },
  { name: "Fresh Apple Juice", price: 60, prepTime: "4 min", rating: "4.5", img: "🍎", category: "Beverages & Juices", isVeg: true, desc: "Pure red apple juice extracted fresh, rich in vitamins with no added sugar." },
  { name: "Premium Dragon Fruit Juice", price: 70, prepTime: "4 min", rating: "4.8", img: "🥤", category: "Beverages & Juices", isVeg: true, desc: "Vibrant pink dragon fruit pulp blended with light honey and crushed ice." },
  { name: "Cold Coffee with Ice Cream", price: 60, prepTime: "4 min", rating: "4.8", img: "☕", category: "Beverages & Juices", isVeg: true, desc: "Double-shot espresso blended cold brew topped with a rich vanilla scoop." },
  { name: "Mineral Water Bottle (1L)", price: 20, prepTime: "1 min", rating: "4.9", img: "🍼", category: "Beverages & Juices", isVeg: true, desc: "Chilled, packaged mineral water bottle with electrolytes." },
  { name: "Hot Veg Samosa (2 Pcs)", price: 30, prepTime: "3 min", rating: "4.6", img: "🥟", category: "Snacks & Desserts", isVeg: true, desc: "Crispy fried pastry triangles stuffed with spiced potatoes and green peas, served with sweet chutney." },
  { name: "Cheese Grilled Sandwich", price: 65, prepTime: "5 min", rating: "4.6", img: "🥪", category: "Snacks & Desserts", isVeg: true, desc: "Golden toasted bread stuffed with molten mozzarella cheese, capsicum, and sweet corn." },
  { name: "Fudge Chocolate Brownie", price: 75, prepTime: "5 min", rating: "4.9", img: "🍰", category: "Snacks & Desserts", isVeg: true, desc: "Warm fudgy dark chocolate cake loaded with walnuts and hot chocolate drizzle." },
  { name: "Gulab Jamun (2 Pcs)", price: 35, prepTime: "2 min", rating: "4.7", img: "🍩", category: "Snacks & Desserts", isVeg: true, desc: "Classic soft fried cottage cheese balls soaked in warm sweet cardamom sugar syrup." }
];

async function seed() {
  const email = 'bharath_owner_new_test_123@college.edu';
  const password = 'Password123!';

  console.log(`Signing in as owner ${email}...`);
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
    return;
  }

  console.log("Signed in successfully. Fetching approved canteens...");
  const { data: canteens, error: fError } = await supabase
    .from('canteens')
    .select('*')
    .eq('owner_id', data.user.id)
    .eq('status', 'approved');

  if (fError) {
    console.error("Failed to fetch canteens:", fError);
    return;
  }

  if (canteens.length === 0) {
    console.error("No approved canteen found for this owner!");
    return;
  }

  const canteen = canteens[0];
  console.log(`Using approved canteen '${canteen.name}' (ID: ${canteen.id})`);

  console.log("Seeding menu items...");
  const menuItems = CANTEEN_CATALOGUE.map(item => ({
    canteen_id: canteen.id,
    name: item.name,
    price: item.price,
    prep_time: item.prepTime,
    rating: item.rating,
    img: item.img,
    category: item.category,
    is_veg: item.isVeg,
    desc_text: item.desc
  }));

  const { error: iError } = await supabase
    .from('menu_items')
    .insert(menuItems);

  if (iError) {
    console.error("Failed to seed menu items:", iError.message);
  } else {
    console.log(`Successfully seeded ${menuItems.length} menu items into database!`);
  }
}

seed();
