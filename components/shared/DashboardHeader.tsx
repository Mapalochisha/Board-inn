"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DashboardHeader({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="h-[72px] bg-white dark:bg-slate-950 border-b border-black/5 dark:border-white/5 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-[11px] lg:text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] truncate">
          Management Console
        </h2>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] lg:text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
            {user?.user_metadata?.full_name || "User"}
          </p>
          <p className="text-[11px] lg:text-[12px] text-green-600 dark:text-green-500 font-semibold uppercase tracking-wider">
            {user?.user_metadata?.role || "Member"}
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
          <DropdownMenuContent className="w-56 mt-2" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user?.user_metadata?.full_name}</p>
                    <p className="w-[180px] truncate text-[12px] text-slate-500">{user?.email}</p>
                </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
