import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
            set(name, value, options) {
                try {
                    cookieStore.set({ name, value, ...options });
                } catch (error) {
                    // Handle cookie set errors in Server Components
                    console.warn("Supabase cookie set error:", error.message);
                }
            },
            remove(name, options) {
                try {
                    cookieStore.set({ name, value: "", ...options });
                } catch (error) {
                    // Handle cookie remove errors in Server Components
                    console.warn("Supabase cookie remove error:", error.message);
                }
            },
        },
    });
}

