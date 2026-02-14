import { NextResponse } from "next/server";
import { getTestimonials, createTestimonial } from "@/lib/data/testimonials";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

export async function GET() {
    try {
        const data = await getTestimonials();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();

        // Validate required fields
        if (!body.client || typeof body.client !== 'string' || !body.client.trim()) {
            return NextResponse.json({ error: "Client name is required" }, { status: 400 });
        }
        if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const payload = {
            client: body.client.trim(),
            role: body.role,
            company: body.company,
            content: body.content.trim(),
            image: body.image,
            metric: body.metric,
            metric_label: body.metric_label || body.metricLabel,
            color: body.color,
            featured: !!body.featured
        };

        const newTestimonial = await createTestimonial(payload);
        return NextResponse.json(newTestimonial, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
