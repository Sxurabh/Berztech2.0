// src/app/page.jsx
import React from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import ProcessStrip from "@/components/sections/ProcessStrip";
import AITransparency from "@/components/sections/AITransparency";

// Skeleton placeholders for heavy components to prevent CLS
const SectionSkeleton = () => (
  <div className="w-full h-[60vh] max-h-[600px] flex items-center justify-center bg-neutral-50/50 animate-pulse border-y border-neutral-100">
    <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-400 animate-spin" />
  </div>
);

// Dynamic imports for heavy below-the-fold components
const BentoGrid = dynamic(() => import("@/components/sections/BentoGrid"), {
  loading: () => <SectionSkeleton />
});
const Testimonial = dynamic(() => import("@/components/sections/Testimonial"), {
  loading: () => <SectionSkeleton />
});
const FeaturedCaseStudy = dynamic(() => import("@/components/sections/FeaturedCaseStudy"), {
  loading: () => <SectionSkeleton />
});
const Services = dynamic(() => import("@/components/sections/Services"), {
  loading: () => <SectionSkeleton />
});
const ContactCTA = dynamic(() => import("@/components/sections/ContactCTA"), {
  loading: () => <SectionSkeleton />
});

import { getProjects } from "@/lib/data/projects";

export const revalidate = 86400; // 24 hours


export default async function Home() {
  const projects = await getProjects();

  // Find the featured project, or default to the first one available
  const featuredProject = projects.find(p => p.featured) || projects[0];

  return (
    <div className="w-full relative selection:bg-neutral-900 selection:text-white">
      <Hero />
      <StatsBar />
      <ProcessStrip />
      <AITransparency />
      <BentoGrid />
      <Testimonial />
      {featuredProject && <FeaturedCaseStudy project={featuredProject} />}
      <Services />
      <ContactCTA />
    </div>
  );
}
