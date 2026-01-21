
// Supabase Configuration
const SUPABASE_URL = 'https://chesrtrlvhfgglltmdqa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4ukvQYXw93vogQ9eSCWSbQ_ZAbx0v2N';

// Initialize Supabase client
// Ensure the supabase-js library is loaded before this script runs
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Make it globally available
window.supabaseClient = supabaseClient;

console.log("Supabase Client Initialized:", window.supabaseClient);
