import Link from "next/link";
import { LayoutDashboard, Calendar, Building2, PlusCircle, UserCircle, Home, LogOut, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: string }) {
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
    { name: 'Analytics', href: '/admin/analytics', icon: Building2 }, // Reusing Building for now or find better
    { name: 'All Properties', href: '/admin/properties', icon: Building2 },
    { name: 'User Management', href: '/admin/users', icon: UserCircle },
    { name: 'Site Settings', href: '/admin/settings', icon: PlusCircle }, // Reusing Plus for now
  ];

  const links = role === 'admin' ? adminLinks : (role === 'landlord' ? landlordLinks : renterLinks);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-950 border-r border-black/5 dark:border-white/5">
      <div className="h-[72px] flex items-center px-6 border-b border-black/5 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/20">
            <Home className="w-5 h-5" />
          </div>
          <span className="font-bold text-[18px] tracking-tight text-slate-900 dark:text-white">Board-inn</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
        <div>
          <h3 className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4">
            Management
          </h3>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group"
              >
                <link.icon className="w-5 h-5 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4">
            Account
          </h3>
          <nav className="space-y-1">
            <Link 
              href="/profile" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group"
            >
              <UserCircle className="w-5 h-5 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors" />
              My Profile
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-black/5 dark:border-white/5">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to site
        </Link>
      </div>
    </div>
  );
}
