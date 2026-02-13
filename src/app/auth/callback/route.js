import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/config/admin";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createServerSupabaseClient();
        if (supabase) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.user) {
                const dest = isAdminEmail(data.user.email) ? "/admin" : "/dashboard";
                return NextResponse.redirect(`${origin}${dest}`);
            }
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
