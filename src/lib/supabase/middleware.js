import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/config/admin";

const isAdmin = (email) => email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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

    const pathname = request.nextUrl.pathname;
    const userEmail = user?.email;

    // Protect admin routes — only saurabhkirve@gmail.com
    if (pathname.startsWith("/admin")) {
        if (!user) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("redirect", "/admin");
            return NextResponse.redirect(loginUrl);
        }
        if (!isAdmin(userEmail)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Protect client dashboard — redirect admin to /admin
    if (pathname.startsWith("/dashboard")) {
        if (!user) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("redirect", "/dashboard");
            return NextResponse.redirect(loginUrl);
        }
        if (isAdmin(userEmail)) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return response;
}

