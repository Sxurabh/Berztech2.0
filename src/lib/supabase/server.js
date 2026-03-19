import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function wrapCookieSet(cookieStore) {
    return function (name, value, options) {
        try {
            cookieStore.set({ name, value, ...options });
        } catch (error) {
            console.warn("Supabase cookie set error:", error.message);
        }
    };
}

export function wrapCookieRemove(cookieStore) {
    return function (name, options) {
        try {
            cookieStore.set({ name, value: "", ...options });
        } catch (error) {
            console.warn("Supabase cookie remove error:", error.message);
        }
    };
}

export async function createServerSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return null if Supabase is not configured (e.g. during build/prerender)
    if (!url || !key || !url.startsWith("http")) return null;

    const cookieStore = await cookies();

    return createServerClient(url, key, {
        cookies: {
            get(name) {
                return cookieStore.get(name)?.value;
            },
            set: wrapCookieSet(cookieStore),
            remove: wrapCookieRemove(cookieStore),
        },
    });
}

