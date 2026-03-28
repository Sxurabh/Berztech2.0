import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...DOC_TYPES];
const MAX_SIZE = 10 * 1024 * 1024;

const MIME_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
};

export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const projectId = formData.get("project_id");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!projectId) {
            return NextResponse.json({ error: "project_id is required" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB." },
                { status: 400 }
            );
        }

        const fileExt = MIME_TO_EXT[file.type] || "bin";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from("message-attachments")
            .upload(filePath, file, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Storage error:", error);
            return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from("message-attachments")
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            type: IMAGE_TYPES.includes(file.type) ? "image" : "document",
            name: file.name,
        });
    } catch (error) {
        console.error("POST /api/messages/upload error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
