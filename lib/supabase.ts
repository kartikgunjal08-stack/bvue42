import { createClient } from '@supabase/supabase-js';

// Get the URL and Key exactly as they are in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the client directly
export const supabase = createClient(supabaseUrl, supabaseAnonKey);