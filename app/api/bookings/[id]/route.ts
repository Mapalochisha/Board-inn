import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { updateBookingSchema } from "@/lib/validations/booking";
import { isWithin24Hours, canRenterCancel } from "@/lib/booking-utils";

export async function GET(
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

    const { data: booking, error } = await supabase
      .from("viewing_bookings")
      .select(`
        *,
        slot:viewing_slots (*),
        property:properties (*),
        renter:profiles!viewing_bookings_renter_id_fkey (*)
      `)
      .eq("id", params.id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ data: null, error: "Booking not found" }, { status: 404 });
    }

    // Check permission: renter's own or landlord's property
    const isRenter = booking.renter_id === session.user.id;
    const isLandlord = booking.property.landlord_id === session.user.id;

    if (!isRenter && !isLandlord) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: booking, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await request.json();
    const result = updateBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Fetch existing booking with slot and property details
    const { data: booking, error: fetchError } = await supabase
      .from("viewing_bookings")
      .select(`
        *,
        slot:viewing_slots (*),
        property:properties (landlord_id)
      `)
      .eq("id", params.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ data: null, error: "Booking not found" }, { status: 404 });
    }

    const { status, cancellation_reason } = result.data;
    const isRenter = booking.renter_id === session.user.id;
    const isLandlord = booking.property.landlord_id === session.user.id;

    let updatePayload: any = {
      status,
      cancellation_reason,
      updated_at: new Date().toISOString(),
    };

    if (status === "cancelled_by_renter") {
      if (!isRenter) {
        return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
      }
      if (!canRenterCancel(booking.status)) {
        return NextResponse.json({ data: null, error: "Booking cannot be cancelled in its current state" }, { status: 400 });
      }

      updatePayload.is_late_cancellation = isWithin24Hours(booking.slot.slot_date, booking.slot.start_time);
    } else {
      // Landlord update
      if (!isLandlord) {
        return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
      }
      
      const allowedLandlordStatuses = ["confirmed", "declined", "cancelled_by_landlord", "completed", "no_show"];
      if (!allowedLandlordStatuses.includes(status)) {
        return NextResponse.json({ data: null, error: "Invalid status for landlord update" }, { status: 400 });
      }
    }

    // Perform the update
    const { data: updatedBooking, error: updateError } = await supabase
      .from("viewing_bookings")
      .update(updatePayload)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ data: null, error: updateError.message }, { status: 500 });
    }

    // Restore slot viewers if cancelled
    if (status === "cancelled_by_renter" || status === "cancelled_by_landlord") {
      // Check if we need to restore (only if the previous status was something that counted towards current_viewers)
      // Pending and Confirmed are usually what we consider 'active' claims
      if (["pending", "confirmed"].includes(booking.status)) {
        const { error: slotUpdateError } = await supabase
          .from("viewing_slots")
          .update({
            current_viewers: Math.max(0, booking.slot.current_viewers - 1),
            status: "available" // Always set to available if we just removed a viewer from a full slot
          })
          .eq("id", booking.slot_id);

        if (slotUpdateError) {
          console.error("Failed to restore slot viewers:", slotUpdateError);
          // We don't return 500 here because the booking itself was successfully updated
        }
      }
    }

    return NextResponse.json({ data: updatedBooking, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Internal Server Error" }, { status: 500 });
  }
}
