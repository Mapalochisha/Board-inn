import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const amenityUpdateSchema = z.object({
  amenity_ids: z.array(z.string().uuid()),
});

export async function PUT(
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

    // Verify ownership
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", params.id)
      .eq("landlord_id", session.user.id)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { data: null, error: "Forbidden - You do not own this property" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = amenityUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // DELETE existing relations
    const { error: deleteError } = await supabase
      .from("property_amenities")
      .delete()
      .eq("property_id", params.id);

    if (deleteError) {
      return NextResponse.json(
        { data: null, error: deleteError.message },
        { status: 500 }
      );
    }

    // INSERT new relations
    const insertData = result.data.amenity_ids.map((amenity_id) => ({
      property_id: params.id,
      amenity_id,
    }));

    const { data, error: insertError } = await supabase
      .from("property_amenities")
      .insert(insertData)
      .select("amenity_id");

    if (insertError) {
      return NextResponse.json(
        { data: null, error: insertError.message },
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
