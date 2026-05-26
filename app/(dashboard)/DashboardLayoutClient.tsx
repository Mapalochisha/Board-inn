"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: any;
  role: string;
}

export default function DashboardLayoutClient({ children, user, role }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900/30">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex shrink-0 border-r border-black/5 dark:border-white/5 sticky top-0 h-full bg-white dark:bg-slate-950 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}>
        <Sidebar 
          role={role} 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          user={user} 
          isSidebarCollapsed={isCollapsed} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
