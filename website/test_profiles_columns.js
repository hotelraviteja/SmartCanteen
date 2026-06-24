import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhcqbsgapavchsobmlbs.supabase.co';
const supabaseAnonKey = 'sb_publishable_KOT0ItSMwvnZE-kUwyN_QQ_xan9z07D';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing if column 'canteen_name' exists in profiles...");
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, canteen_name')
    .limit(1);

  if (error) {
    console.error("Select failed:", error.message, error);
  } else {
    console.log("Select succeeded! 'canteen_name' column exists.", data);
  }
}

test();
