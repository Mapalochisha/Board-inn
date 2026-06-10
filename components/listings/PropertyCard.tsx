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
    <button
      onClick={() => router.push(`/listings/${property.id}`)}
      className="group text-left w-full border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-green-600"
      aria-label={`View details for ${property.title} in ${property.city}`}
    >
      <div className="relative aspect-video">
        {property.cover_image_url ? (
          <Image 
            src={property.cover_image_url} 
            alt={`Cover photo of ${property.title}`} 
            fill 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index === 0}
            className="object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image Available</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg truncate group-hover:text-green-700 dark:group-hover:text-green-500 transition-colors">{property.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{property.city}, {property.district}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-green-700 dark:text-green-500 font-bold">From ZMW {property.min_price || 'N/A'}/mo</span>
          <span className="text-xs text-muted-foreground font-medium">{property.available_units || 0} spaces left</span>
        </div>
      </div>
    </button>
  );
}
