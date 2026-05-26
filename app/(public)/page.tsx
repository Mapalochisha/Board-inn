import { PropertyCard } from "@/components/listings/PropertyCard";
import { Search, Calendar, Home } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board-inn — Find Student Housing in Zambia",
  description: "Secure and affordable boarding houses and bed spaces for students and young professionals.",
  openGraph: {
    images: [{ url: "/og-image.jpg" }],
  },
};

async function getRecentProperties() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, city, district, cover_image_url, images, status')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) return []
  return data || []
}

export default async function HomePage() {
  const properties = await getRecentProperties();

  return (
    <main className="min-h-screen">
      <HeroCarousel />

      {/* Featured */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Recently Listed</h2>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
        </div>
        <div className="text-center mt-10">
          <Link href="/listings" className="text-green-700 dark:text-green-500 font-semibold hover:underline">View All Listings</Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Search, title: "Search", desc: "Find properties in your preferred city." },
            { icon: Calendar, title: "Book a Viewing", desc: "Schedule a tour at your convenience." },
            { icon: Home, title: "Move In", desc: "Secure your room and start your journey." }
          ].map((step, i) => (
            <div key={i} className="space-y-3">
              <step.icon className="w-10 h-10 mx-auto text-green-700 dark:text-green-500" />
              <div className="font-bold text-xl">{i + 1}. {step.title}</div>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 dark:bg-green-900/20 py-16 text-center px-6">
        <h2 className="text-2xl font-bold mb-4">Are you a landlord? List your property for free.</h2>
        <Link href="/register" className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800">
          Get Started
        </Link>
      </section>
    </main>
  );
}
