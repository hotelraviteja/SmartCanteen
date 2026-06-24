import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhcqbsgapavchsobmlbs.supabase.co';
const supabaseAnonKey = 'sb_publishable_KOT0ItSMwvnZE-kUwyN_QQ_xan9z07D';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const email = 'admin@college.edu';
  const password = 'AdminPassword123!';

  console.log(`Checking if admin user ${email} exists...`);
  
  // Try to sign in or sign up
  console.log("Attempting sign in first...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.log("Sign in failed with message:", signInError.message, signInError.status);
  }

  // Test simple public query
  console.log("Testing connection by reading public profiles...");
  const { data: testData, error: testError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);
  if (testError) {
    console.error("Test query failed:", testError.message, testError);
  } else {
    console.log("Connection test succeeded! Profiles count or data returned.");
  }

  if (signInData?.user) {
    console.log("Admin account already exists and signs in successfully!");
    console.log("User details:", signInData.user);
    
    // Check their profile role
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .maybeSingle();
      
    if (profile) {
      console.log("Profile details:", profile);
      if (profile.role !== 'admin') {
        console.log(`Updating profile role to 'admin'...`);
        const { error: uError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', signInData.user.id);
        if (uError) {
          console.error("Failed to update role:", uError);
        } else {
          console.log("Profile role successfully updated to 'admin'.");
        }
      }
    } else {
      console.log("No profile found, inserting admin profile...");
      const { error: iError } = await supabase
        .from('profiles')
        .insert({
          id: signInData.user.id,
          full_name: 'System Admin',
          student_id: '',
          phone: '+91 99999 88888',
          department: 'Administration',
          academic_year: '',
          role: 'admin'
        });
      if (iError) console.error("Error inserting profile:", iError);
      else console.log("Profile created successfully.");
    }
    return;
  }

  console.log("Admin account not found or password incorrect. Attempting registration without metadata...");
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error("Sign up failed:", signUpError.message, signUpError.status, JSON.stringify(signUpError, null, 2));
  } else {
    console.log("Registration successful! Admin account created.");
    console.log("Admin user:", signUpData.user);
    console.log("Note: If email confirmation is enabled on Supabase, the user may need to be confirmed before logging in, or you can verify it in Supabase dashboard.");
  }
}

createAdmin();
