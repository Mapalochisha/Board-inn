import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { uploadPropertyImage } from "@/lib/cloudinary";

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

    // Check role (Landlord or Admin)
    const role = session.user.user_metadata?.role;
    if (role !== "landlord" && role !== "admin") {
      return NextResponse.json(
        { data: null, error: "Forbidden - Landlord or Admin role required" },
        { status: 403 }
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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { data: null, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { data: null, error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    try {
      const result = await uploadPropertyImage(buffer, file.name);
      return NextResponse.json({
        data: result,
        error: null,
      });
    } catch (uploadError: any) {
      return NextResponse.json(
        { data: null, error: uploadError.message || "Cloudinary upload failed" },
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
