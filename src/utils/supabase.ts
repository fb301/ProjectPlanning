/**/ 
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("eeeeh Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
