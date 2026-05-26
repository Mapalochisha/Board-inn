import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    
    const supabase = await createClient();
    
    if (key) {
        const { data, error } = await supabase
            .from("site_settings")
            .select("*")
            .eq("key", key)
            .single();

        if (error) return NextResponse.json({ data: null, error: error.message });
        return NextResponse.json({ data: data.value, error: null });
    }

    const { data, error } = await supabase
        .from("site_settings")
        .select("*");

    if (error) return NextResponse.json({ data: [], error: error.message });
    return NextResponse.json({ data, error: null });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Robust admin check
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const { key, value } = await req.json();

    if (!key || value === undefined) {
        return NextResponse.json({ error: "Key and Value are required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
