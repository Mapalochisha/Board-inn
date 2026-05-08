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
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-12 pb-24">
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border">
        <Image src={property.cover_image_url || "/placeholder.jpg"} alt={property.title} fill className="object-cover" />
      </div>
      
      <section>
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">{property.title}</h1>
        <p className="text-muted-foreground text-lg mb-6">{property.address_line1}, {property.city}</p>
        <div className="prose prose-slate max-w-none">
          <p className="text-foreground/80 leading-relaxed text-lg">{property.description}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Amenities</h2>
        <div className="flex flex-wrap gap-3">
          {property.amenities?.map((a: any) => <AmenityBadge key={a.id} name={a.name} icon={a.icon} />)}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Available Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.units?.map((u: any) => (
            <div key={u.id} className={`border rounded-xl p-6 flex justify-between items-center transition-colors ${!u.is_available ? 'bg-muted' : 'bg-card hover:border-primary/30'}`}>
              <div>
                <h3 className="font-semibold text-lg">{u.name}</h3>
                <UnitTypeTag type={u.unit_type} />
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-primary">ZMW {u.price_per_month}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="viewing-slots">
        <h2 className="text-2xl font-bold mb-6">Book a Viewing</h2>
        <ViewingSlotPicker 
          propertyId={params.id} 
          units={property.units} 
          isLoggedIn={!!session} 
        />
      </section>

      {/* Sticky Mobile Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-background border-t shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)] z-50">
        <a 
          href="#viewing-slots" 
          className="block w-full text-center bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
        >
          Book a Viewing
        </a>
      </div>
    </main>
  );
}
