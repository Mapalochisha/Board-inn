import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createUnitSchema } from "@/lib/validations/property";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("property_id", params.id)
    .order("name");

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

export async function POST(
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

    // Verify ownership of the property
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
    const result = createUnitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("units")
      .insert({
        ...result.data,
        property_id: params.id,
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
