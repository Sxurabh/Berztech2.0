import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/upload — Upload an image to Supabase Storage (admin only)
export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();

        // Verify admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Generate unique filename (sanitize extension)
        const lastDotIndex = file.name.lastIndexOf(".");
        let fileExt = "";
        if (lastDotIndex >= 0) {
            fileExt = file.name.substring(lastDotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
        } else {
            fileExt = "bin";
        }

        const fileName = fileExt ? `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}` : `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from("images")
            .upload(filePath, file, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            path: filePath,
        });
    } catch (error) {
        console.error("POST /api/upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
