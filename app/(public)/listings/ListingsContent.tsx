"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { PropertyCardSkeleton } from "@/components/listings/PropertyCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Filter, X as CloseIcon, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    unit_type: searchParams.get("unit_type") || "any",
    gender_restriction: searchParams.get("gender_restriction") || "any",
  });

  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
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
    if (filters.search) params.set("search", filters.search);
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

  const FilterFields = () => (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Search Keywords</Label>
        <div className="relative">
          <Input 
            placeholder="e.g. WiFi, Modern..." 
            value={filters.search} 
            onChange={e => updateFilters({...filters, search: e.target.value})} 
            className="rounded-xl border-2 pr-10"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

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

      <Button 
        variant="outline" 
        className="w-full md:hidden rounded-xl border-2"
        onClick={() => updateFilters({
          search: "",
          city: "",
          min_price: "",
          max_price: "",
          unit_type: "any",
          gender_restriction: "any",
        })}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Mobile Search & Filter Bar */}
      <div className="flex md:hidden gap-2 mb-8">
        <div className="relative flex-1">
          <Input 
            placeholder="Search keywords or city..." 
            value={filters.search || filters.city} 
            onChange={e => updateFilters({...filters, search: e.target.value})} 
            className="rounded-xl border-2 h-12 pr-10"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-2 shrink-0">
              <div className="relative">
                <SlidersHorizontal size={20} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-0 p-6">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                <Filter className="text-green-600" /> Filters
              </SheetTitle>
              <SheetDescription>
                Refine your results to find exactly what you need.
              </SheetDescription>
            </SheetHeader>
            <div className="pb-10 overflow-y-auto max-h-full no-scrollbar">
              <FilterFields />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 space-y-6">
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
                search: "",
                city: "",
                min_price: "",
                max_price: "",
                unit_type: "any",
                gender_restriction: "any",
              })}
              className="text-xs text-muted-foreground hover:text-green-600 underline"
            >
              Clear all
            </button>
          </div>
          
          <FilterFields />
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
