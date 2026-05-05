import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validations/booking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ data: null, error: "Profile not found" }, { status: 404 });
    }

    let query = supabase.from("viewing_bookings").select(`
      *,
      slot:viewing_slots (
        slot_date,
        start_time,
        end_time
      ),
      property:properties (
        title,
        address_line1,
        city
      ),
      unit:units (
        name
      ),
      renter:profiles!viewing_bookings_renter_id_fkey (
        full_name
      )
    `);

    if (profile.role === "renter") {
      query = query.eq("renter_id", session.user.id);
    } else if (profile.role === "landlord") {
      // Landlords see bookings for their properties
      const { data: ownedProperties } = await supabase
        .from("properties")
        .select("id")
        .eq("landlord_id", session.user.id);

      const propertyIds = ownedProperties?.map((p) => p.id) || [];
      query = query.in("property_id", propertyIds);
    } else {
      return NextResponse.json({ data: null, error: "Invalid role" }, { status: 403 });
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("slot(slot_date)", { ascending: false, foreignTable: "viewing_slots" });

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    // Manual sort if nested sort didn't work as expected
    const sortedData = [...(data || [])].sort((a: any, b: any) => {
      const dateA = a.slot?.slot_date ? new Date(a.slot.slot_date).getTime() : 0;
      const dateB = b.slot?.slot_date ? new Date(b.slot.slot_date).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ data: sortedData, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Internal Server Error" }, { status: 500 });
  }
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

    // Role must be renter
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "renter") {
      return NextResponse.json({ data: null, error: "Only renters can book viewings" }, { status: 403 });
    }

    const body = await request.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { slot_id, property_id, unit_id, renter_notes } = result.data;

    // 1. Fetch slot
    const { data: slot, error: slotError } = await supabase
      .from("viewing_slots")
      .select("*")
      .eq("id", slot_id)
      .single();

    if (slotError || !slot || slot.status !== "available") {
      return NextResponse.json({ data: null, error: "Slot is not available" }, { status: 409 });
    }

    // 2. Slot date must be in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(slot.slot_date);
    if (slotDate < today) {
      return NextResponse.json({ data: null, error: "This slot has already passed" }, { status: 400 });
    }

    // 3. Check UNIQUE (renter_id, slot_id)
    const { count: existingSlotBooking, error: existingSlotError } = await supabase
      .from("viewing_bookings")
      .select("*", { count: "exact", head: true })
      .eq("renter_id", session.user.id)
      .eq("slot_id", slot_id)
      .in("status", ["pending", "confirmed"]);

    if (existingSlotBooking && existingSlotBooking > 0) {
      return NextResponse.json({ data: null, error: "You already have a booking for this slot" }, { status: 409 });
    }

    // 4. Check same-day duplicate for the same property
    const { count: sameDayBooking, error: sameDayError } = await supabase
      .from("viewing_bookings")
      .select("*, slot:viewing_slots!inner(*)", { count: "exact", head: true })
      .eq("renter_id", session.user.id)
      .eq("property_id", property_id)
      .eq("slot.slot_date", slot.slot_date)
      .not("status", "in", '("declined","cancelled_by_renter","cancelled_by_landlord")');

    if (sameDayBooking && sameDayBooking > 0) {
      return NextResponse.json({ data: null, error: "You already have a booking for this property on this day" }, { status: 409 });
    }

    // Atomic claim using RPC (MUST BE IN THIS ORDER)
    const { data: claimed, error: claimError } = await supabase.rpc("claim_viewing_slot", {
      p_slot_id: slot_id,
    });

    if (claimError || claimed === false) {
      return NextResponse.json({ data: null, error: "This slot just became fully booked. Please choose another time." }, { status: 409 });
    }

    // INSERT into viewing_bookings with status='pending'
    const { data: booking, error: bookingError } = await supabase
      .from("viewing_bookings")
      .insert({
        slot_id,
        renter_id: session.user.id,
        property_id,
        unit_id,
        renter_notes,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({ data: null, error: bookingError.message }, { status: 500 });
    }

    return NextResponse.json({ data: booking, error: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Internal Server Error" }, { status: 500 });
  }
}
