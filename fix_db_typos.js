const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) process.env[key.trim()] = rest.join('=').trim();
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFixes() {
    console.log("Fixing Testimonial Typos...");

    // 1. Fetch the testimonial
    const { data: testimonials } = await supabase
        .from('testimonials')
        .select('*')
        .ilike('content', '%was best decision !!!%');

    if (testimonials && testimonials.length > 0) {
        for (const t of testimonials) {
            const fixedContent = t.content.replace('was best decision !!!', 'was the best decision.');
            await supabase.from('testimonials').update({ content: fixedContent }).eq('id', t.id);
            console.log(`✅ Fixed testimonial ID: ${t.id}`);
        }
    } else {
        console.log("No testimonial typo found.");
    }

    // 2. Fix Avail Arch project description
    console.log("Fixing Avail Arch project placeholder...");
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('title', 'Avail Arch')
        .eq('description', 'Test');

    if (projects && projects.length > 0) {
        for (const p of projects) {
            const betterDescription = "Avail Arch is a modern architecture portfolio and visualization platform designed to showcase innovative structural designs with immersive 3D renderings and responsive layouts.";
            await supabase.from('projects').update({ description: betterDescription }).eq('id', p.id);
            console.log(`✅ Fixed project ID: ${p.id}`);
        }
    } else {
        console.log("No Avail Arch placeholder found.");
    }
}

runFixes().catch(console.error);
