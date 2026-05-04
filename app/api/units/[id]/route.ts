import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { updateUnitSchema } from "@/lib/validations/property";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("*, property:properties (id, title)")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { data: null, error: "Unit not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data,
    error: null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership of parent property
    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("property_id, properties (landlord_id)")
      .eq("id", params.id)
      .single();

    if (unitError || !unit || (unit.properties as any).landlord_id !== session.user.id) {
      return NextResponse.json(
        { data: null, error: "Forbidden - You do not own this unit" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateUnitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // If marking unavailable, check for active bookings
    if (result.data.is_available === false) {
      const { count, error: bookingError } = await supabase
        .from("viewing_bookings")
        .select("*", { count: "exact", head: true })
        .eq("unit_id", params.id)
        .in("status", ["pending", "confirmed"]);

      if (bookingError) {
        return NextResponse.json(
          { data: null, error: bookingError.message },
          { status: 500 }
        );
      }

      if (count && count > 0) {
        return NextResponse.json(
          { data: null, error: "Cannot mark unavailable — active bookings exist" },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("units")
      .update({
        ...result.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

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
  } catch (error) {
    return NextResponse.json(
      { data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check ownership and safety
  const { data: unit, error: unitError } = await supabase
    .from("units")
    .select("current_occupancy, properties (landlord_id)")
    .eq("id", params.id)
    .single();

  if (unitError || !unit || (unit.properties as any).landlord_id !== session.user.id) {
    return NextResponse.json(
      { data: null, error: "Forbidden - You do not own this unit" },
      { status: 403 }
    );
  }

  if (unit.current_occupancy > 0) {
    return NextResponse.json(
      { data: null, error: "Cannot delete — unit is currently occupied" },
      { status: 409 }
    );
  }

  const { count: activeBookings } = await supabase
    .from("viewing_bookings")
    .select("*", { count: "exact", head: true })
    .eq("unit_id", params.id)
    .in("status", ["pending", "confirmed"]);

  if (activeBookings && activeBookings > 0) {
    return NextResponse.json(
      { data: null, error: "Cannot delete — active bookings exist" },
      { status: 409 }
    );
  }

  const { error: deleteError } = await supabase
    .from("units")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    return NextResponse.json(
      { data: null, error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { deleted: true },
    error: null,
  });
}
