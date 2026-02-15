import { NextResponse } from "next/server";
import { getTestimonialById, updateTestimonial, deleteTestimonial } from "@/lib/data/testimonials";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const data = await getTestimonialById(id);
        if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();

        // Build payload only with defined fields
        const payload = {};
        const allowed = ["client", "role", "company", "content", "image", "metric", "color", "featured"];

        for (const key of allowed) {
            if (body[key] !== undefined) payload[key] = body[key];
        }

        // Handle camelCase mapping for metric_label
        if (body.metric_label !== undefined) payload.metric_label = body.metric_label;
        else if (body.metricLabel !== undefined) payload.metric_label = body.metricLabel;

        const updated = await updateTestimonial(id, payload);
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await deleteTestimonial(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
