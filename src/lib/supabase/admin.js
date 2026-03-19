import { createClient } from "@supabase/supabase-js";

// Ensure this file is only imported on the server
if (typeof window !== "undefined") {
    throw new Error("createAdminClient must only be used on the server");
}

// Admin client bypasses RLS — only use in server-side code
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key || !url.startsWith("http")) return null;

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

