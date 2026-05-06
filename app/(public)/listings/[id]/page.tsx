import { notFound } from "next/navigation";
import Image from "next/image";
import { AmenityBadge } from "@/components/listings/AmenityBadge";
import { UnitTypeTag } from "@/components/listings/UnitTypeTag";
import { ViewingSlotPicker } from "@/components/bookings/ViewingSlotPicker";
import { createClient } from "@/lib/supabase/server";

async function getProperty(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/properties/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data;
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const property = await getProperty(params.id);
  if (!property) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 pb-20">
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <Image src={property.cover_image_url || "/placeholder.jpg"} alt={property.title} fill className="object-cover" />
      </div>
      
      <section>
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <p className="text-gray-500 mb-4">{property.address_line1}, {property.city}</p>
        <p className="text-gray-700 leading-relaxed">{property.description}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Amenities</h2>
        <div className="flex flex-wrap gap-3">
          {property.amenities?.map((a: any) => <AmenityBadge key={a.id} name={a.name} icon={a.icon} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Available Units</h2>
        <div className="space-y-4">
          {property.units?.map((u: any) => (
            <div key={u.id} className={`border rounded-lg p-4 flex justify-between items-center ${!u.is_available ? 'bg-gray-100' : ''}`}>
              <div>
                <h3 className="font-semibold">{u.name}</h3>
                <UnitTypeTag type={u.unit_type} />
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">ZMW {u.price_per_month}</p>
                {!u.is_available && <span className="text-xs text-red-500 font-bold">Currently Occupied</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="viewing-slots">
        <h2 className="text-xl font-bold mb-4">Book a Viewing</h2>
        <ViewingSlotPicker 
          propertyId={params.id} 
          units={property.units} 
          isLoggedIn={!!session} 
        />
      </section>

      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t z-50">
        <a href="#viewing-slots" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-md font-semibold">
          Book a Viewing
        </a>
      </div>
    </main>
  );
}
