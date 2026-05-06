import Link from "next/link";

export function Sidebar({ role }: { role: string }) {
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
    <nav className="flex flex-col p-6 w-full space-y-4">
      <h1 className="font-bold text-xl mb-6">Board-inn</h1>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-gray-600 hover:text-primary">
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
