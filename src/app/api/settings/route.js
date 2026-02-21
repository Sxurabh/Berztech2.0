import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { revalidatePath } from "next/cache";

export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

        const { error } = await supabase
            .from('settings')
            .upsert({ setting_key: key, setting_value: value });

        if (error) throw error;

        revalidatePath('/about');
        revalidatePath('/');

        return NextResponse.json({ success: true, value });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
