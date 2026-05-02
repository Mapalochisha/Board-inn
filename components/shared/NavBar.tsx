import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function NavBar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Board-inn
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/listings" className="text-sm font-medium">
            Listings
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
