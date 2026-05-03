import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER ONLY — never import in client components
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
