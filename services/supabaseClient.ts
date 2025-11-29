import { createClient } from '@supabase/supabase-js';

// These should be set in your environment variables.
// If not present, the DB service will gracefully downgrade to mock mode/console logs.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;