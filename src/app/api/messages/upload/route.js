import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const project_id = formData.get("project_id");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!project_id) {
            return NextResponse.json({ error: "project_id is required" }, { status: 400 });
        }

        const admin = createAdminClient();
        const bucket = "message-attachments";

        const { data: bucketData } = await admin.storage.getBucket(bucket);
        if (!bucketData) {
            await admin.storage.createBucket(bucket, { public: true });
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${project_id}/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await admin.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
        }

        const { data: publicUrlData } = admin.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrlData.publicUrl,
            path: filePath,
            type: file.type.startsWith("image/") ? "image" : "document",
            name: file.name,
        }, { status: 200 });
    } catch (err) {
        console.error("POST /api/messages/upload error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
