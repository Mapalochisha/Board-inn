import AuthGuard from "@/components/shared/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const role = session?.user.user_metadata.role;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex w-64 border-r sticky top-0 h-full">
          <Sidebar role={role} />
        </aside>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="md:hidden">
            <MobileNav role={role} />
          </div>
          <main className="p-6 md:p-10">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
