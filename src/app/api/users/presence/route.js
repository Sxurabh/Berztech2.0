import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const UpdatePresenceSchema = z.object({
    is_online: z.boolean().optional(),
});

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json(
                { error: "user_id is required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase
            .from("user_presence")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Presence fetch error:", error);
            return NextResponse.json(
                { error: "Failed to fetch presence" },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            data: data || { user_id: userId, is_online: false, last_seen: null } 
        });
    } catch (error) {
        console.error("Presence GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const supabase = await createServerSupabaseClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = UpdatePresenceSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { is_online } = validation.data;
        
        const updateData = {
            is_online: is_online ?? false,
            last_seen: is_online ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("user_presence")
            .upsert({
                user_id: user.id,
                ...updateData,
            })
            .select()
            .single();

        if (error) {
            console.error("Presence update error:", error);
            return NextResponse.json(
                { error: "Failed to update presence" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Presence PATCH error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST handler for sendBeacon (no auth required - more reliable for browser close)
export async function POST(request) {
    try {
        let body;
        const contentType = request.headers.get("content-type");
        
        if (contentType?.includes("application/json")) {
            body = await request.json();
        } else {
            // Try to parse as text
            const text = await request.text();
            try {
                body = JSON.parse(text);
            } catch {
                body = {};
            }
        }
        
        // For sendBeacon, we need the user_id in the body since no auth available
        // Use admin client to bypass RLS for this specific case
        const { user_id, is_online } = body;
        
        // Determine which client to use
        let client;
        let targetUserId = user_id;
        
        if (user_id) {
            // sendBeacon case - use admin client to bypass RLS
            client = createAdminClient();
        } else {
            // Authenticated case - use regular client
            const supabase = await createServerSupabaseClient();
            client = supabase;
            const { data: { user } } = await client.auth.getUser();
            if (!user) {
                return NextResponse.json(
                    { error: "Unauthorized - no user_id or auth" },
                    { status: 401 }
                );
            }
            targetUserId = user.id;
        }
        
        const updateData = {
            is_online: is_online ?? false,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await client
            .from("user_presence")
            .upsert({
                user_id: targetUserId,
                ...updateData,
            })
            .select()
            .single();

        if (error) {
            console.error("Presence POST error:", error);
            return NextResponse.json(
                { error: "Failed to update presence" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Presence POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
