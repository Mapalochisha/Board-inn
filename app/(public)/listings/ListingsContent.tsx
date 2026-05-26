"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { PropertyCardSkeleton } from "@/components/listings/PropertyCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    unit_type: searchParams.get("unit_type") || "any",
    gender_restriction: searchParams.get("gender_restriction") || "any",
  });

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "unit_type" || key === "gender_restriction") return value !== "any";
      return !!value;
    }).length;
  }, [filters]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.min_price) params.set("min_price", filters.min_price);
    if (filters.max_price) params.set("max_price", filters.max_price);
    if (filters.unit_type !== "any") params.set("unit_type", filters.unit_type);
    if (filters.gender_restriction !== "any") params.set("gender_restriction", filters.gender_restriction);

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const { data } = await res.json();
      setProperties(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "any") params.set(key, value as string);
    });
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-64 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Filter size={20} className="text-green-600" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="bg-green-600 ml-1">{activeFilterCount}</Badge>
              )}
            </h2>
            <button 
              onClick={() => updateFilters({
                city: "",
                min_price: "",
                max_price: "",
                unit_type: "any",
                gender_restriction: "any",
              })}
              className="text-xs text-muted-foreground hover:text-green-600 underline md:hidden"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">Location</label>
              <input placeholder="City" className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all" value={filters.city} onChange={e => updateFilters({...filters, city: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">Price Range</label>
              <div className="flex gap-2">
                <input placeholder="Min" type="number" className="w-1/2 border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all" value={filters.min_price} onChange={e => updateFilters({...filters, min_price: e.target.value})} />
                <input placeholder="Max" type="number" className="w-1/2 border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all" value={filters.max_price} onChange={e => updateFilters({...filters, max_price: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">Unit Type</label>
              <select value={filters.unit_type} onChange={e => updateFilters({...filters, unit_type: e.target.value})} className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all bg-white">
                  <option value="any">Any Unit Type</option>
                  <option value="full_room">Full Room</option>
                  <option value="bed_space">Bed Space</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">Preference</label>
              <select value={filters.gender_restriction} onChange={e => updateFilters({...filters, gender_restriction: e.target.value})} className="w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all bg-white">
                  <option value="any">Any Gender</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
              </select>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
          ) : properties.length === 0 ? (
              <EmptyState 
                icon={Search}
                title="No listings found"
                description="Try adjusting your filters or search area to find what you're looking for."
                action={{
                  label: "Clear All Filters",
                  href: "/listings"
                }}
              />
          ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((p: any, i: number) => (
                    <PropertyCard key={p.id} property={p} index={i} />
                  ))}
              </div>
          )}
        </main>
      </div>
    </div>
  );
}
