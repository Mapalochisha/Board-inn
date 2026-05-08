import Link from "next/link";
import { LayoutDashboard, Calendar, Building2, PlusCircle, UserCircle, Home } from "lucide-react";

export function Sidebar({ role }: { role: string }) {
  const landlordLinks = [
    { name: 'My Listings', href: '/landlord/listings', icon: Building2 },
    { name: 'Bookings Received', href: '/landlord/bookings', icon: Calendar },
    { name: 'Add Listing', href: '/landlord/listings/new', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  const renterLinks = [
    { name: 'My Bookings', href: '/bookings', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  const links = role === 'landlord' ? landlordLinks : renterLinks;

  return (
    <div className="flex flex-col h-full w-full bg-card p-6 border-r">
      <Link href="/" className="flex items-center gap-2 mb-10 text-primary">
        <Home className="w-8 h-8" />
        <span className="font-bold text-2xl tracking-tight">Board-inn</span>
      </Link>
      
      <div className="flex-1 space-y-2">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all font-medium"
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </Link>
        ))}
      </div>
      
      <div className="pt-6 border-t">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium">
          ← Back to Site
        </Link>
      </div>
    </div>
  );
}
