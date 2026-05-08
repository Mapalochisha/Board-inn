import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createPropertySchema } from "@/lib/validations/property";
import { ApiResponse, Property } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const unitType = searchParams.get("unit_type");
  const genderRestriction = searchParams.get("gender_restriction");
  const search = searchParams.get("search");

  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(`
      id, title, city, district, cover_image_url,
      units (
        price_per_month,
        is_available,
        unit_type,
        gender_restriction
      )
    `)
    .eq("status", "published")
    .is("deleted_at", null);

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (minPrice) {
    query = query.gte("units.price_per_month", parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte("units.price_per_month", parseFloat(maxPrice));
  }
  if (unitType) {
    query = query.eq("units.unit_type", unitType);
  }
  if (genderRestriction) {
    query = query.eq("units.gender_restriction", genderRestriction);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  // Transform data to include MIN(price_per_month) and count of available units
  const formattedData = data.map((prop: any) => {
    const prices = prop.units.map((u: any) => u.price_per_month);
    const availableUnitsCount = prop.units.filter((u: any) => u.is_available).length;
    
    return {
      id: prop.id,
      title: prop.title,
      city: prop.city,
      district: prop.district,
      cover_image_url: prop.cover_image_url,
      min_price: prices.length > 0 ? Math.min(...prices) : null,
      available_units: availableUnitsCount,
    };
  });

  return NextResponse.json({
    data: formattedData,
    error: null,
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check landlord role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "landlord") {
      return NextResponse.json(
        { data: null, error: "Forbidden - Landlord role required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createPropertySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...result.data,
        landlord_id: session.user.id,
        status: result.data.status || "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, error: null },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
