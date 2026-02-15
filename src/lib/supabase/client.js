import { createBrowserClient } from "@supabase/ssr";

let supabaseClient = null;

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return null if Supabase is not configured (e.g. during build/prerender)
    if (!url || !key || !url.startsWith("http")) return null;

    if (supabaseClient) return supabaseClient;

    supabaseClient = createBrowserClient(url, key);
    return supabaseClient;
}

