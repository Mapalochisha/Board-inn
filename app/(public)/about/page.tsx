import Link from "next/link";
import { Building2, Shield, Users, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
            Redefining Student <span className="text-green-600">Housing</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Board-inn is on a mission to simplify the way students find and book their perfect homes. 
            We connect students with verified landlords to create a safe, reliable, and transparent housing ecosystem.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Verified Listings</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every property on our platform undergoes a verification process to ensure it meets our quality and safety standards.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Student-Centric</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Designed specifically for the needs of students, focusing on proximity to campuses and affordable pricing.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Local Expertise</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Our team has deep knowledge of the local housing markets, helping you find the best districts and neighborhoods.
          </p>
        </div>
      </section>

      {/* Team/Story */}
      <section className="bg-white dark:bg-slate-950 py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">Our Story</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4 text-lg">
            <p>
              Founded in 2024, Board-inn started with a simple observation: finding student housing was too difficult, 
              unreliable, and often stressful. We saw students struggling with unverified listings and complex booking processes.
            </p>
            <p>
              We decided to build a platform that brings everything into one place. From virtual tours and viewing bookings 
              to secure digital agreements, we're making housing one less thing students have to worry about.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
