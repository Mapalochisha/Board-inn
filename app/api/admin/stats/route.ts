import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [properties, profiles, bookings, units] = await Promise.all([
      supabaseAdmin.from("properties").select("*", { count: "exact" }).is("deleted_at", null),
      supabaseAdmin.from("profiles").select("*", { count: "exact" }),
      supabaseAdmin.from("viewing_bookings").select("status, created_at"),
      supabaseAdmin.from("units").select("total_capacity, current_occupancy")
    ]);

    const totalCapacity = units.data?.reduce((acc, u) => acc + (u.total_capacity || 0), 0) || 0;
    const currentOccupancy = units.data?.reduce((acc, u) => acc + (u.current_occupancy || 0), 0) || 0;

    // Group bookings by status
    const bookingsByStatus = bookings.data?.reduce((acc: any, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    // Group properties by city
    const propertiesByCity = properties.data?.reduce((acc: any, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      data: {
        total_properties: properties.count || 0,
        active_users: profiles.count || 0,
        total_bookings: bookings.data?.length || 0,
        available_beds: totalCapacity - currentOccupancy,
        bookings_by_status: bookingsByStatus || {},
        properties_by_city: propertiesByCity || {}
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
