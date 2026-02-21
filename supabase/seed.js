/**
 * Seed script — populates the database with existing hardcoded data.
 * 
 * Usage:
 *   1. Add your Supabase credentials to .env.local
 *   2. Run: node supabase/seed.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local (Next.js does this automatically, but plain Node.js does not)
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0) {
            process.env[key.trim()] = rest.join("=").trim();
        }
    });
    console.log("✅ Loaded environment from .env.local");
} else {
    console.warn("⚠️  No .env.local found — using system environment variables");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const projects = [
    {
        slug: "family-fund",
        slug: "family-fund",
        client: "Family Fund",
        title: "Skip the bank, borrow from those you trust",
        description: "A crowdfunding platform enabling friends and family to lend without traditional banking friction. Built with Next.js, Node.js, and integrated payment infrastructure.",
        image: "/images/laptop.jpg",
        category: "Fintech",
        year: "2023",
        services: ["Web Development", "UI/UX Design", "Payment Integration"],
        stats: { users: "1.5M", volume: "$2M+", rating: "4.9" },
        color: "blue",
        featured: true,
    },
    {
        slug: "unseal",
        slug: "unseal",
        client: "Unseal",
        title: "Get a double-check on your SSL certificates",
        description: "First NFT platform for personal health records. Custom blockchain explorer with real-time transaction verification.",
        image: "/images/meeting.jpg",
        category: "Blockchain",
        year: "2022",
        services: ["Blockchain", "Web3", "Smart Contracts"],
        stats: { nfts: "50K+", volume: "$5M+", users: "12K" },
        color: "purple",
        featured: true,
    },
    {
        slug: "phobia",
        slug: "phobia",
        client: "Phobia",
        title: "Overcome your fears, find your match",
        description: "Dating app matching users based on mutual phobias. React Native app with custom onboarding flow and ML matching algorithm.",
        image: "/images/whiteboard.jpg",
        category: "Mobile",
        year: "2022",
        services: ["Mobile App", "React Native", "ML Integration"],
        stats: { downloads: "100K+", matches: "2M+", retention: "45%" },
        color: "emerald",
        featured: false,
    },
    {
        slug: "bright-path",
        slug: "bright-path",
        client: "Bright Path",
        title: "Illuminating educational journeys",
        description: "AI-powered learning platform with personalized curriculum paths. Real-time progress tracking and adaptive assessments.",
        image: "/images/laptop.jpg",
        category: "EdTech",
        year: "2023",
        services: ["Platform Development", "AI Integration", "Analytics"],
        stats: { students: "50K+", courses: "500+", completion: "85%" },
        color: "amber",
        featured: false,
    },
    {
        slug: "green-life",
        slug: "green-life",
        client: "Green Life",
        title: "Sustainable living made simple",
        description: "Carbon footprint tracking app with IoT device integration. Gamified sustainability challenges and community features.",
        image: "/images/meeting.jpg",
        category: "Sustainability",
        year: "2023",
        services: ["Mobile App", "IoT Integration", "Data Viz"],
        stats: { users: "200K+", co2: "1.2M tons", actions: "5M+" },
        color: "rose",
        featured: false,
    },
    {
        slug: "north-adventures",
        slug: "north-adventures",
        client: "North Adventures",
        title: "Expedition planning reimagined",
        description: "Adventure tourism platform with real-time weather, gear recommendations, and expert-guided trip planning.",
        image: "/images/whiteboard.jpg",
        category: "Travel",
        year: "2022",
        services: ["Web Platform", "API Development", "Maps Integration"],
        stats: { trips: "10K+", guides: "500+", satisfaction: "98%" },
        color: "cyan",
        featured: false,
    },
];

const blogPosts = [
    {
        title: "Why We Chose Next.js for Enterprise Applications",
        excerpt: "A deep dive into our decision-making process and the technical benefits that convinced us to standardize on Next.js for client projects.",
        content: "# Why We Chose Next.js for Enterprise Applications\n\nA deep dive into our decision-making process and the technical benefits that convinced us to standardize on Next.js for client projects.\n\n## The Challenge\n\nWhen building enterprise-grade web applications, the choice of framework is one of the most critical decisions...",
        category: "Engineering",
        author: "Alex Chen",
        read_time: "8 min read",
        image: "/images/laptop.jpg",
        featured: true,
        color: "blue",
        slug: "why-we-chose-nextjs",
        published: true,
    },
    {
        title: "The Art of Minimalist Interface Design",
        excerpt: "How restraint and intentionality create more powerful user experiences than feature-heavy alternatives.",
        content: "# The Art of Minimalist Interface Design\n\nHow restraint and intentionality create more powerful user experiences than feature-heavy alternatives.",
        category: "Design",
        author: "Sarah Miller",
        read_time: "6 min read",
        image: "/images/whiteboard.jpg",
        featured: false,
        color: "purple",
        slug: "minimalist-interface-design",
        published: true,
    },
    {
        title: "Building Design Systems That Scale",
        excerpt: "Lessons learned from creating component libraries for fast-growing startups and enterprise teams.",
        content: "# Building Design Systems That Scale\n\nLessons learned from creating component libraries for fast-growing startups and enterprise teams.",
        category: "Design",
        author: "James Wilson",
        read_time: "10 min read",
        image: "/images/meeting.jpg",
        featured: false,
        color: "emerald",
        slug: "design-systems-that-scale",
        published: true,
    },
    {
        title: "Technical Debt: A Strategic Perspective",
        excerpt: "When to pay it down, when to leverage it, and how to communicate about it with non-technical stakeholders.",
        content: "# Technical Debt: A Strategic Perspective\n\nWhen to pay it down, when to leverage it, and how to communicate about it with non-technical stakeholders.",
        category: "Strategy",
        author: "Alex Chen",
        read_time: "7 min read",
        image: "/images/laptop.jpg",
        featured: false,
        color: "amber",
        slug: "technical-debt-strategic-perspective",
        published: true,
    },
    {
        title: "Remote Collaboration: Our Playbook",
        excerpt: "Tools, rituals, and mindsets that keep our distributed team aligned and productive.",
        content: "# Remote Collaboration: Our Playbook\n\nTools, rituals, and mindsets that keep our distributed team aligned and productive.",
        category: "Culture",
        author: "Emma Davis",
        read_time: "5 min read",
        image: "/images/meeting.jpg",
        featured: false,
        color: "rose",
        slug: "remote-collaboration-playbook",
        published: true,
    },
    {
        title: "TypeScript at Scale: Best Practices",
        excerpt: "Advanced patterns and architectural decisions for maintaining type safety in large codebases.",
        content: "# TypeScript at Scale: Best Practices\n\nAdvanced patterns and architectural decisions for maintaining type safety in large codebases.",
        category: "Engineering",
        author: "James Wilson",
        read_time: "12 min read",
        image: "/images/whiteboard.jpg",
        featured: false,
        color: "blue",
        slug: "typescript-at-scale",
        published: true,
    },
];

async function seed() {
    console.log("🌱 Seeding database...\n");

    // Seed projects
    console.log("📁 Seeding projects...");
    const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .upsert(projects, { onConflict: "slug" });

    if (projectsError) {
        console.error("  ❌ Error seeding projects:", projectsError.message);
    } else {
        console.log(`  ✅ ${projects.length} projects seeded successfully`);
    }

    // Seed blog posts
    console.log("📝 Seeding blog posts...");
    const { data: postsData, error: postsError } = await supabase
        .from("blog_posts")
        .upsert(blogPosts, { onConflict: "slug" });

    if (postsError) {
        console.error("  ❌ Error seeding blog posts:", postsError.message);
    } else {
        console.log(`  ✅ ${blogPosts.length} blog posts seeded successfully`);
    }

    console.log("\n✨ Seeding complete!");
}

seed().catch(console.error);
