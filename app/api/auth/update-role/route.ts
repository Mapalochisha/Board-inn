import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["renter", "landlord"]),
});

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

    const body = await request.json();
    const result = roleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: "Invalid role" },
        { status: 400 }
      );
    }

    const { role } = result.data;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", session.user.id);

    if (updateError) {
      return NextResponse.json(
        { data: null, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { role },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
