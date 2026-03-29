import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Profile fetch error:", error);
            return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
        }

        const { data: authData } = await supabase.auth.getUser();
        
        let isCurrentUser = false;
        if (authData.user && authData.user.id === userId) {
            isCurrentUser = true;
        }

        return NextResponse.json({ 
            data: profile || { id: userId, full_name: null, avatar_url: null },
            is_current_user: isCurrentUser
        });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
