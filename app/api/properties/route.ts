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
  const isLandlordView = searchParams.get("landlord") === "true";

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let query = supabase
    .from("properties")
    .select(`
      id, title, city, district, cover_image_url, status,
      units (
        id,
        price_per_month,
        is_available,
        unit_type,
        gender_restriction
      )
    `)
    .is("deleted_at", null);

  // If landlord view, filter by ownership
  if (isLandlordView) {
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    query = query.eq("landlord_id", session.user.id);
  } else {
    // Public view: only published
    query = query.eq("status", "published");
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  // Transform and Filter data manually to prevent joined data pruning
  const applyFilters = (units: any[], city: string | null, district: string | null, unitType: string | null, gender: string | null, minPrice: number | null, maxPrice: number | null) => {
    let filtered = units;
    if (minPrice) filtered = filtered.filter((u: any) => u.price_per_month >= minPrice);
    if (maxPrice) filtered = filtered.filter((u: any) => u.price_per_month <= maxPrice);
    if (unitType && unitType !== "any") filtered = filtered.filter((u: any) => u.unit_type === unitType);
    if (gender && gender !== "any") filtered = filtered.filter((u: any) => u.gender_restriction === gender);
    return filtered;
  };

  const formattedData = (data || [])
    .map((prop: any) => {
      const allUnits = prop.units || [];
      const exactMatches = applyFilters(allUnits, city, null, unitType, genderRestriction, minPrice ? parseFloat(minPrice) : null, maxPrice ? parseFloat(maxPrice) : null);
      
      // Tier 1: Exact Match (Everything including District/Gender/Type)
      let finalUnits = exactMatches;
      let score = 100;

      // Tier 2: Fallback (Ignore gender/type if exact fails)
      if (finalUnits.length === 0) {
        finalUnits = applyFilters(allUnits, city, null, "any", "any", minPrice ? parseFloat(minPrice) : null, maxPrice ? parseFloat(maxPrice) : null);
        score = 50;
      }

      // If still no units, exclude property
      if (finalUnits.length === 0) return null;

      const prices = finalUnits.map((u: any) => u.price_per_month);
      const availableUnitsCount = finalUnits.filter((u: any) => u.is_available).length;
      
      return {
        id: prop.id,
        title: prop.title,
        city: prop.city,
        district: prop.district,
        cover_image_url: prop.cover_image_url,
        status: prop.status,
        min_price: prices.length > 0 ? Math.min(...prices) : null,
        available_units: availableUnitsCount,
        match_score: score
      };
    })
    .filter(Boolean);

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

    // Check role (Landlord or Admin)
    const role = session.user.user_metadata?.role;
    if (role !== "landlord" && role !== "admin") {
      return NextResponse.json(
        { data: null, error: "Forbidden - Landlord or Admin role required" },
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
