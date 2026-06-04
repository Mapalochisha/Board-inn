import { notFound } from "next/navigation";
import Image from "next/image";
import { AmenityBadge } from "@/components/listings/AmenityBadge";
import { UnitTypeTag } from "@/components/listings/UnitTypeTag";
import { ViewingSlotPicker } from "@/components/bookings/ViewingSlotPicker";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

async function getProperty(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      units (*),
      amenities:property_amenities (
        amenity:amenities (*)
      ),
      landlord:profiles (
        full_name,
        avatar_url,
        created_at
      )
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    if (error) console.error("Error fetching property:", error);
    return null;
  }

  // Flatten amenities safely
  const amenities = Array.isArray(data.amenities) 
    ? data.amenities.map((item: any) => item.amenity).filter(Boolean)
    : [];

  return {
    ...data,
    amenities,
    units: data.units || [],
    images: data.images || []
  };
  }

  export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const property = await getProperty(params.id);
    if (!property) return { title: "Listing Not Found — Board-inn" };

    const title = `${property.title} — Board-inn`;
    const description = property.description?.substring(0, 155) || "View this listing on Board-inn.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: property.cover_image_url ? [{ url: property.cover_image_url }] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "Board-inn" };
  }
  }

  export default async function PropertyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData?.user;

  let user = null;
  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();
    user = profile;
  }

  const property = await getProperty(params.id);
  if (!property) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-12 pb-24">
      <ImageGallery images={property.images} title={property.title} />
      
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
          user={user} 
        />
      </section>
    </main>
  );
}
