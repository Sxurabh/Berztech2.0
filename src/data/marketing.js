// src/data/marketing.js
import { FiCode, FiTrendingUp, FiSmartphone, FiPenTool } from "react-icons/fi";

export const serviceCategories = [
    {
        id: "web-dev",
        title: "Web Development",
        shortTitle: "Web Dev",
        subtitle: "High-Performance Apps",
        description: "High-performance, SEO-optimized web applications built with Next.js and React.",
        features: ["Next.js & React", "Headless CMS", "API Integration"],
        items: ["Frontend", "Backend", "Database"],
        metric: "React + Next.js",
        price: "From $25k",
        timeline: "8-12 weeks",
        icon: FiCode,
        color: "blue",
        featured: true
    },
    {
        id: "growth",
        title: "Growth & Marketing",
        shortTitle: "Growth",
        subtitle: "Business Growth",
        description: "Data-driven growth strategies. SEO, content, and paid acquisition for ROI.",
        features: ["SEO Optimization", "Content Strategy", "Paid Acquisition"],
        items: ["+124%", "ROI"],
        metric: "+124% ROI",
        price: "From $8k/mo",
        timeline: "Ongoing",
        icon: FiTrendingUp,
        color: "emerald"
    },
    {
        id: "mobile",
        title: "Mobile Apps",
        shortTitle: "Mobile",
        subtitle: "iOS & Android",
        description: "Cross-platform applications using React Native. One codebase, native performance.",
        features: ["React Native", "iOS & Android", "Push Notifications"],
        items: ["5.0★", "Rating"],
        metric: "5.0★ Rating",
        price: "From $35k",
        timeline: "10-14 weeks",
        icon: FiSmartphone,
        color: "purple"
    },
    {
        id: "branding",
        title: "Branding & Design",
        shortTitle: "Design",
        subtitle: "Digital Identity",
        description: "Comprehensive brand identity systems that communicate value and differentiate.",
        features: ["Visual Identity", "Brand Guidelines", "Market Research"],
        items: ["Colors", "Typography"],
        metric: "Design Excellence",
        price: "From $15k",
        timeline: "4-6 weeks",
        icon: FiPenTool,
        color: "rose"
    }
];
