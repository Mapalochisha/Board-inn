"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function PropertyCard({ property }: { property: any }) {
  const router = useRouter();

  const getUnitSummary = () => {
    const types = new Set(property.units?.map((u: any) => u.unit_type));
    if (types.has("full_room") && types.has("bed_space")) return "Mixed";
    if (types.has("full_room")) return "Full Rooms";
    return "Bed Spaces";
  };

  const minPrice = Math.min(...(property.units?.map((u: any) => u.price_per_month) || [0]));

  return (
    <div
      onClick={() => router.push(`/listings/${property.id}`)}
      className="group cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] bg-white"
    >
      <div className="relative aspect-video">
        {property.cover_image_url ? (
          <Image src={property.cover_image_url} alt={property.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg truncate text-gray-900">{property.title}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          {property.city}, {property.district}
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-green-700 font-semibold">From ZMW {minPrice}/mo</span>
          <span className="text-xs text-gray-400">{property.units?.length || 0} spaces available</span>
        </div>
        <div className="flex gap-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{getUnitSummary()}</span>
        </div>
      </div>
    </div>
  );
}
