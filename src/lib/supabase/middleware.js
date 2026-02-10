import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Skip Supabase session refresh if not configured
    if (!url || !key || !url.startsWith("http")) {
        return response;
    }

    const supabase = createServerClient(url, key, {
        cookies: {
            get(name) {
                return request.cookies.get(name)?.value;
            },
            set(name, value, options) {
                request.cookies.set({ name, value, ...options });
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                response.cookies.set({ name, value, ...options });
            },
            remove(name, options) {
                request.cookies.set({ name, value: "", ...options });
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                response.cookies.set({ name, value: "", ...options });
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && !user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return response;
}

