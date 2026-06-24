import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhcqbsgapavchsobmlbs.supabase.co';
const supabaseAnonKey = 'sb_publishable_KOT0ItSMwvnZE-kUwyN_QQ_xan9z07D';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("Fetching profiles from Supabase...");
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at');
    
  if (pError) {
    console.error("Error fetching profiles:", pError);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles:`);
  console.table(profiles);

  console.log("Fetching canteens from Supabase...");
  const { data: canteens, error: cError } = await supabase
    .from('canteens')
    .select('id, name, owner_id, status, created_at');
    
  if (cError) {
    console.error("Error fetching canteens:", cError);
    return;
  }
  
  console.log(`Found ${canteens.length} canteens:`);
  console.table(canteens);
}

check();
