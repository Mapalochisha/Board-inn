"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Image from "next/image";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1555854817-40e098ee7fdd?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2000",
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % DEFAULT_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Images */}
      {DEFAULT_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={img}
            alt={`Hero ${i}`}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="max-w-xl w-full mb-12">
            <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                <input 
                    type="text" 
                    placeholder="Enter city..." 
                    className="flex-1 min-w-0 px-4 py-3 rounded-lg text-white bg-transparent border-none focus:ring-0 placeholder:text-white/60" 
                />
                <button className="bg-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center min-w-[56px] text-white transition-colors">
                    <Search className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl tracking-tight">
          Find Your Perfect <br />
          <span className="text-green-400">Student Space</span>
        </h1>
        <p className="text-lg text-white/90 max-w-lg mx-auto drop-shadow-md">
            Discover affordable, high-quality rooms and bed spaces near your university.
        </p>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {DEFAULT_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-white w-8" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
