import AuthGuard from "@/components/shared/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import Link from "next/link";
import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const role = session?.user.user_metadata.role;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50/50">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 border-r sticky top-0 h-full bg-card">
          <Sidebar role={role} />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <MobileNav role={role} />
              </div>
              <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                <Home className="w-6 h-6" />
                <span className="font-bold text-xl tracking-tight">Board-inn</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-foreground">
                <Link href="/">View Storefront</Link>
              </Button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
