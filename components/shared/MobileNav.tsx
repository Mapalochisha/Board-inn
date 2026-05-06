import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileNav({ role }: { role: string }) {
  const links = role === 'landlord' ? [
    { name: 'My Listings', href: '/landlord/listings' },
    { name: 'Bookings Received', href: '/landlord/bookings' },
    { name: 'Add Listing', href: '/landlord/listings/new' },
    { name: 'Profile', href: '/profile' },
  ] : [
    { name: 'My Bookings', href: '/bookings' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <div className="p-4 border-b flex justify-between items-center">
      <h1 className="font-bold text-xl">Board-inn</h1>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost">Menu</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex flex-col gap-4 mt-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-lg font-medium">
                {link.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
