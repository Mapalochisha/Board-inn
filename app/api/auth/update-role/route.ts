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

    // 1. Update Profile table
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

    // 2. Update Auth Metadata (to keep them in sync for middleware/APIs)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      session.user.id,
      { user_metadata: { role } }
    );

    if (authError) {
        // Log but don't fail the whole request if profile update succeeded? 
        // Actually, we want them in sync.
        console.error("Failed to update auth metadata:", authError);
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
