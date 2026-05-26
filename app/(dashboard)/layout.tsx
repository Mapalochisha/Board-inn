import AuthGuard from "@/components/shared/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const role = user?.user_metadata.role || "renter";

  return (
    <AuthGuard>
      <DashboardLayoutClient user={user} role={role}>
        {children}
      </DashboardLayoutClient>
    </AuthGuard>
  );
}
