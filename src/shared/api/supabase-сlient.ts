import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
