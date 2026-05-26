"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function PropertyCard({ property, index = 0 }: { property: any; index?: number }) {
  const router = useRouter();

  const getUnitSummary = () => {
    if (property.unit_types?.includes("full_room") && property.unit_types?.includes("bed_space")) return "Mixed";
    if (property.unit_types?.includes("full_room")) return "Full Rooms";
    return "Bed Spaces";
  };

  return (
    <div
      onClick={() => router.push(`/listings/${property.id}`)}
      className="group cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] bg-card text-card-foreground"
    >
      <div className="relative aspect-video">
        {property.cover_image_url ? (
          <Image 
            src={property.cover_image_url} 
            alt={`${property.title}, preview`} 
            fill 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index === 0}
            className="object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg truncate">{property.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {property.city}, {property.district}
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-green-700 dark:text-green-500 font-semibold">From ZMW {property.min_price || 'N/A'}/mo</span>
          <span className="text-xs text-muted-foreground">{property.available_units || 0} spaces available</span>
        </div>
      </div>
    </div>
  );
}
