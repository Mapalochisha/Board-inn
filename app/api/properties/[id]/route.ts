import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { updatePropertySchema } from "@/lib/validations/property";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    .eq("id", params.id)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { data: null, error: "Property not found" },
      { status: 404 }
    );
  }

  // Flatten amenities
  const formattedData = {
    ...data,
    amenities: data.amenities.map((item: any) => item.amenity),
  };

  return NextResponse.json({
    data: formattedData,
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

    const body = await request.json();
    const result = updatePropertySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("properties")
      .update({
        ...result.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("landlord_id", session.user.id) // Ensure ownership
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 403 }
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

  const { error } = await supabase
    .from("properties")
    .update({
      deleted_at: new Date().toISOString(),
      status: "archived",
    })
    .eq("id", params.id)
    .eq("landlord_id", session.user.id);

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 403 }
    );
  }

  return NextResponse.json({
    data: { deleted: true },
    error: null,
  });
}
