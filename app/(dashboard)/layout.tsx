import AuthGuard from "@/components/shared/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const role = profile?.role || user?.user_metadata?.role || "renter";

  return (
    <AuthGuard>
      <DashboardLayoutClient user={user} role={role}>
        {children}
      </DashboardLayoutClient>
    </AuthGuard>
  );
}
