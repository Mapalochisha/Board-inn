import Link from "next/link";
import { LayoutDashboard, Calendar, Building2, PlusCircle, UserCircle, Home, ChevronLeft, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ role, isCollapsed, onToggle, isMobile }: SidebarProps) {
  const landlordLinks = [
    { name: 'Dashboard', href: '/landlord/listings', icon: LayoutDashboard },
    { name: 'My Listings', href: '/landlord/listings', icon: Building2 },
    { name: 'Bookings', href: '/landlord/bookings', icon: Calendar },
    { name: 'Add Listing', href: '/landlord/listings/new', icon: PlusCircle },
  ];

  const renterLinks = [
    { name: 'Dashboard', href: '/bookings', icon: LayoutDashboard },
    { name: 'My Bookings', href: '/bookings', icon: Calendar },
  ];

  const adminLinks = [
    { name: 'Console', href: '/admin', icon: LayoutDashboard },
    { name: 'Hero Images', href: '/admin/hero', icon: Building2 },
    { name: 'All Properties', href: '/admin/properties', icon: Building2 },
    { name: 'User Management', href: '/admin/users', icon: UserCircle },
    { name: 'Site Settings', href: '/admin/settings', icon: PlusCircle },
  ];

  const links = role === 'admin' ? adminLinks : (role === 'landlord' ? landlordLinks : renterLinks);

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-950 border-r border-black/5 dark:border-white/5 transition-all duration-300",
      isCollapsed && !isMobile ? "w-[80px]" : "w-full"
    )}>
      <div className={cn(
        "h-[72px] flex items-center border-b border-black/5 dark:border-white/5",
        isCollapsed && !isMobile ? "justify-center px-0" : "justify-between px-6"
      )}>
        <Link href="/" className={cn("flex items-center gap-2.5", isCollapsed && !isMobile && "hidden")}>
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/20">
            <Home className="w-5 h-5" />
          </div>
          <span className="font-bold text-[18px] tracking-tight text-slate-900 dark:text-white">Board-inn</span>
        </Link>
        
        {isCollapsed && !isMobile && (
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/20">
            <Home className="w-6 h-6" />
          </div>
        )}

        {!isMobile && onToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className={cn("text-slate-400 hover:text-green-600", isCollapsed && "mt-2")}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>
        )}
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-8 overflow-y-auto overflow-x-hidden">
        <div>
          <h3 className={cn(
            "px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4 transition-opacity duration-200",
            isCollapsed && !isMobile ? "opacity-0 h-0 mb-0" : "opacity-100"
          )}>
            Management
          </h3>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                title={isCollapsed ? link.name : ""}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group",
                  isCollapsed && !isMobile ? "justify-center" : ""
                )}
              >
                <link.icon className={cn(
                  "w-5 h-5 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors shrink-0",
                  isCollapsed && !isMobile ? "w-6 h-6" : ""
                )} />
                <span className={cn(
                  "transition-all duration-200",
                  isCollapsed && !isMobile ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                )}>
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className={cn(
            "px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4 transition-opacity duration-200",
            isCollapsed && !isMobile ? "opacity-0 h-0 mb-0" : "opacity-100"
          )}>
            Account
          </h3>
          <nav className="space-y-1">
            <Link 
              href="/profile" 
              title={isCollapsed ? "My Profile" : ""}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group",
                isCollapsed && !isMobile ? "justify-center" : ""
              )}
            >
              <UserCircle className={cn(
                "w-5 h-5 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors shrink-0",
                isCollapsed && !isMobile ? "w-6 h-6" : ""
              )} />
              <span className={cn(
                "transition-all duration-200",
                isCollapsed && !isMobile ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
              )}>
                My Profile
              </span>
            </Link>
          </nav>
        </div>
      </div>
      
      <div className={cn("p-4 border-t border-black/5 dark:border-white/5", isCollapsed && !isMobile && "flex justify-center")}>
        <Link 
          href="/" 
          title={isCollapsed ? "Back to site" : ""}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all",
            isCollapsed && !isMobile ? "justify-center px-0" : ""
          )}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className={cn(
            "transition-all duration-200",
            isCollapsed && !isMobile ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}>
            Back to site
          </span>
        </Link>
      </div>
    </div>
  );
}

