import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const slotId = params.id;

    // Check if slot exists and belongs to the landlord
    const { data: slot, error: slotError } = await supabase
      .from("viewing_slots")
      .select("id, landlord_id")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) {
      return NextResponse.json({ data: null, error: "Slot not found" }, { status: 404 });
    }

    if (slot.landlord_id !== session.user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    // Find active bookings
    const { count, error: countError } = await supabase
      .from("viewing_bookings")
      .select("*", { count: "exact", head: true })
      .eq("slot_id", slotId)
      .in("status", ["pending", "confirmed"]);

    if (countError) {
      return NextResponse.json({ data: null, error: countError.message }, { status: 500 });
    }

    if (count && count > 0) {
      // Update viewing_bookings
      const { error: updateBookingsError } = await supabase
        .from("viewing_bookings")
        .update({ status: "cancelled_by_landlord", updated_at: new Date().toISOString() })
        .eq("slot_id", slotId)
        .in("status", ["pending", "confirmed"]);

      if (updateBookingsError) {
        return NextResponse.json({ data: null, error: updateBookingsError.message }, { status: 500 });
      }
    }

    // Update viewing_slot
    const { error: updateSlotError } = await supabase
      .from("viewing_slots")
      .update({ status: "cancelled" })
      .eq("id", slotId);

    if (updateSlotError) {
      return NextResponse.json({ data: null, error: updateSlotError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: { cancelled: true, bookings_affected: count || 0 },
      error: null,
    });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Internal Server Error" }, { status: 500 });
  }
}
