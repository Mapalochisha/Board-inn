import AuthGuard from "@/components/shared/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const role = user?.user_metadata.role;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900/30">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[280px] shrink-0 border-r border-black/5 dark:border-white/5 sticky top-0 h-full bg-white dark:bg-slate-950">
          <Sidebar role={role} />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={user} />

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
