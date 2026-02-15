// src/app/page.jsx
import React from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import ProcessStrip from "@/components/sections/ProcessStrip";
import AITransparency from "@/components/sections/AITransparency";

// Dynamic imports for heavy below-the-fold components
const BentoGrid = dynamic(() => import("@/components/sections/BentoGrid"));
const Testimonial = dynamic(() => import("@/components/sections/Testimonial"));
const FeaturedCaseStudy = dynamic(() => import("@/components/sections/FeaturedCaseStudy"));
const Services = dynamic(() => import("@/components/sections/Services"));
const ContactCTA = dynamic(() => import("@/components/sections/ContactCTA"));

import { getProjects } from "@/lib/data/projects";

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
