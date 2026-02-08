// src/app/page.jsx
"use client";
import React from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import ProcessStrip from "@/components/sections/ProcessStrip";
import AITransparency from "@/components/sections/AITransparency";
import GridBackground from "@/components/ui/GridBackground";

// Dynamic imports for heavy below-the-fold components
const BentoGrid = dynamic(() => import("@/components/sections/BentoGrid"));
const Testimonial = dynamic(() => import("@/components/sections/Testimonial"));
const FeaturedCaseStudy = dynamic(() => import("@/components/sections/FeaturedCaseStudy"));
const Services = dynamic(() => import("@/components/sections/Services"));
const ContactCTA = dynamic(() => import("@/components/sections/ContactCTA"));

export default function Home() {
  return (
    <div className="w-full relative selection:bg-neutral-900 selection:text-white">
      {/* Single continuous grid background for entire page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <GridBackground opacity={0.04} size={40} />
      </div>
      
      <div className="relative z-10">
        <Hero />
        <StatsBar />
        <ProcessStrip />
        <AITransparency />
        <BentoGrid />
        <Testimonial />
        <FeaturedCaseStudy/>
        <Services />
        <ContactCTA />
      </div>
    </div>
  );
}