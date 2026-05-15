import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { uploadAvatar } from "@/lib/cloudinary";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { data: null, error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    try {
      const { url } = await uploadAvatar(buffer, session.user.id);
      
      // Update profile in DB
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        url,
        error: null,
      });
    } catch (uploadError: any) {
      return NextResponse.json(
        { data: null, error: uploadError.message || "Upload failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
