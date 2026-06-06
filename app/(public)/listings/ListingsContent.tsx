"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { PropertyCardSkeleton } from "@/components/listings/PropertyCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Filter, X as CloseIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      unit_type: searchParams.get("unit_type") || "any",
      gender_restriction: searchParams.get("gender_restriction") || "any",
    });
  }, [searchParams]);

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
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Location</Label>
              <Input 
                placeholder="City" 
                value={filters.city} 
                onChange={e => updateFilters({...filters, city: e.target.value})} 
                className="rounded-xl border-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Price Range</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Min" 
                  type="number" 
                  value={filters.min_price} 
                  onChange={e => updateFilters({...filters, min_price: e.target.value})} 
                  className="w-1/2 rounded-xl border-2"
                />
                <Input 
                  placeholder="Max" 
                  type="number" 
                  value={filters.max_price} 
                  onChange={e => updateFilters({...filters, max_price: e.target.value})} 
                  className="w-1/2 rounded-xl border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Unit Type</Label>
              <Select value={filters.unit_type} onValueChange={val => updateFilters({...filters, unit_type: val})}>
                <SelectTrigger className="rounded-xl border-2 bg-white dark:bg-background">
                  <SelectValue placeholder="Any Unit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Unit Type</SelectItem>
                  <SelectItem value="full_room">Full Room</SelectItem>
                  <SelectItem value="bed_space">Bed Space</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Preference</Label>
              <Select value={filters.gender_restriction} onValueChange={val => updateFilters({...filters, gender_restriction: val})}>
                <SelectTrigger className="rounded-xl border-2 bg-white dark:bg-background">
                  <SelectValue placeholder="Any Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Gender</SelectItem>
                  <SelectItem value="male">Male Only</SelectItem>
                  <SelectItem value="female">Female Only</SelectItem>
                </SelectContent>
              </Select>
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
