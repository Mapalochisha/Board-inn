import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createSlotSchema } from "@/lib/validations/booking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("property_id");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  if (!propertyId) {
    return NextResponse.json(
      { data: null, error: "property_id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("viewing_slots")
    .select("*")
    .eq("property_id", propertyId)
    .eq("status", "available")
    .gte("slot_date", new Date().toISOString().split("T")[0]);

  if (fromDate) {
    query = query.gte("slot_date", fromDate);
  }

  if (toDate) {
    query = query.lte("slot_date", toDate);
  }

  const { data, error } = await query.order("slot_date", { ascending: true }).order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
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
    const result = createSlotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check ownership (Admins bypass)
    if (role !== "admin") {
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", result.data.property_id)
        .eq("landlord_id", session.user.id)
        .single();

      if (propError || !property) {
        return NextResponse.json(
          { data: null, error: "Property not found or access denied" },
          { status: 403 }
        );
      }
    }

    // Get the actual landlord_id for the slot
    let slotLandlordId = session.user.id;
    if (role === "admin") {
        const { data: prop } = await supabase
            .from("properties")
            .select("landlord_id")
            .eq("id", result.data.property_id)
            .single();
        if (prop) slotLandlordId = prop.landlord_id;
    }

    const { data, error } = await supabase
      .from("viewing_slots")
      .insert({
        ...result.data,
        landlord_id: slotLandlordId,
        status: "available",
        current_viewers: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { data: null, error: "A slot already exists for this property at this date and time" },
          { status: 409 }
        );
      }
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Internal Server Error" }, { status: 500 });
  }
}
