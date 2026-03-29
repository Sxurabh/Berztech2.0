import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_BYTES = {
    "image/jpeg": [
        { bytes: [0xFF, 0xD8, 0xFF], offset: 0 }
    ],
    "image/png": [
        { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 }
    ],
    "image/gif": [
        { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], offset: 0 },
        { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], offset: 0 }
    ],
    "image/webp": [
        { bytes: [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50], offset: 0, wildcard: true }
    ]
};

function validateMagicBytes(fileBuffer, mimeType) {
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures) return false;

    const uint8Array = new Uint8Array(fileBuffer);

    return signatures.some(sig => {
        const match = sig.bytes.every((byte, index) => {
            if (sig.wildcard && byte === null) return true;
            return uint8Array[sig.offset + index] === byte;
        });
        return match;
    });
}

function sanitizeFilename(filename) {
    if (!filename) return filename;
    return filename
        .replace(/\.\./g, '')
        .replace(/[\/\\]/g, '')
        .replace(/\x00/g, '')
        .trim()
        .substring(0, 255);
}

// Simple in-memory rate limiting map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 20;

const MIME_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

// POST /api/upload — Upload an image to Supabase Storage (admin only)
export async function POST(request) {
    try {
        // Enforce Basic Rate Limiting based on IP
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const requestData = rateLimitMap.get(ip) || { count: 0, startTime: now };

        if (now - requestData.startTime > RATE_LIMIT_WINDOW_MS) {
            requestData.count = 1;
            requestData.startTime = now;
        } else {
            requestData.count += 1;
        }
        rateLimitMap.set(ip, requestData);

        if (requestData.count > MAX_UPLOADS_PER_WINDOW) {
            return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
        }

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

        // Validate magic bytes to verify actual file content
        const fileBuffer = await file.arrayBuffer();
        if (!validateMagicBytes(fileBuffer, file.type)) {
            return NextResponse.json(
                { error: "File content does not match declared type" },
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

        // Secure filename generation: ignore client-provided extension and strictly map to MIME
        const fileExt = MIME_TO_EXT[file.type] || "bin";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
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
