"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu, PanelLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: any;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ user, isSidebarCollapsed, onToggleSidebar }: DashboardHeaderProps) {
  const router = useRouter();
  const role = user?.user_metadata?.role || "renter";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="h-[72px] bg-white dark:bg-slate-950 border-b border-black/5 dark:border-white/5 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-none">
              <Sidebar role={role} isMobile />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Toggle (only visible when collapsed) */}
        {isSidebarCollapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="hidden md:flex text-slate-400 hover:text-green-600"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        )}

        <h2 className={cn(
          "text-[11px] lg:text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] truncate transition-all",
          isSidebarCollapsed ? "ml-2" : ""
        )}>
          Management Console
        </h2>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] lg:text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
            {user?.user_metadata?.full_name || "User"}
          </p>
          <p className="text-[11px] lg:text-[12px] text-green-600 dark:text-green-500 font-semibold uppercase tracking-wider">
            {role}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-xl overflow-hidden p-0 shadow-lg shadow-black/5">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  {(user?.user_metadata?.full_name || "U")[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mt-2 p-2 shadow-2xl border-2 bg-white dark:bg-slate-900" align="end">
            <div className="flex flex-col space-y-4 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-bold text-base">{user?.user_metadata?.full_name}</p>
                    <p className="w-full truncate text-xs text-slate-500 uppercase tracking-widest font-semibold opacity-70">{user?.email}</p>
                </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2.5 cursor-pointer" onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive py-2.5 cursor-pointer focus:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

