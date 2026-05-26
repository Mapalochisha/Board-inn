"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotFound() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950">
      <div className="w-full max-w-lg text-center space-y-10">
        <div className="space-y-4">
          <p className="text-green-600 dark:text-green-500 font-black text-6xl tracking-tighter">404</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. Maybe it moved, or the link is broken.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
              <Search size={20} />
            </div>
            <Input
              type="text"
              placeholder="Search for listings, cities, or universities..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-green-600 text-base"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-2 h-10 rounded-xl bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/10"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="outline" className="h-12 px-8 rounded-xl font-bold gap-2">
            <Link href="/">
              <Home size={18} />
              Home Page
            </Link>
          </Button>
          <Button asChild className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 px-8 rounded-xl font-bold gap-2">
            <Link href="/listings">
              <MapPin size={18} />
              Browse All Listings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
