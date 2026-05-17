import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "hero_images")
        .single();

    if (error) return NextResponse.json({ data: [], error: error.message });
    return NextResponse.json({ data: data.value, error: null });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.user_metadata.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json();

    const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "hero_images", value: images }, { onConflict: "key" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
