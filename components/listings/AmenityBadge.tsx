import { LucideIcon, Wifi, Droplets, Shield, Camera, Car, MapPin } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  droplets: Droplets,
  shield: Shield,
  camera: Camera,
  car: Car,
};

export function AmenityBadge({ name, icon }: { name: string; icon: string }) {
  const Icon = iconMap[icon] || MapPin;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700">
      <Icon className="w-4 h-4" />
      {name}
    </div>
  );
}
