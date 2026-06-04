import AuthGuard from "@/components/shared/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch source-of-truth role from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const role = profile?.role || user?.user_metadata?.role || "renter";

  return (
    <AuthGuard>
      <DashboardLayoutClient user={user} role={role}>
        {children}
      </DashboardLayoutClient>
    </AuthGuard>
  );
}
