"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { PropertyCardSkeleton } from "@/components/listings/PropertyCardSkeleton";

function ListingsContent() {
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
    const params = new URLSearchParams(newFilters);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
      <aside className="w-64 hidden md:block space-y-6">
        <h2 className="font-bold text-xl">Filters</h2>
        <input placeholder="City" className="w-full border p-2 rounded" value={filters.city} onChange={e => updateFilters({...filters, city: e.target.value})} />
        <div className="flex gap-2">
            <input placeholder="Min" type="number" className="w-1/2 border p-2 rounded" value={filters.min_price} onChange={e => updateFilters({...filters, min_price: e.target.value})} />
            <input placeholder="Max" type="number" className="w-1/2 border p-2 rounded" value={filters.max_price} onChange={e => updateFilters({...filters, max_price: e.target.value})} />
        </div>
        <select value={filters.unit_type} onChange={e => updateFilters({...filters, unit_type: e.target.value})} className="w-full border p-2 rounded">
            <option value="any">Any Unit Type</option>
            <option value="full_room">Full Room</option>
            <option value="bed_space">Bed Space</option>
        </select>
      </aside>

      <main className="flex-1">
        {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
        ) : properties.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No properties found. Try adjusting filters.</div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
            </div>
        )}
      </main>
    </div>
  );
}

export default function ListingsPage() {
    return <Suspense fallback={<div>Loading...</div>}><ListingsContent /></Suspense>;
}
