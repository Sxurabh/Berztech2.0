// src/app/page.jsx
"use client";
import React from "react";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import BentoGrid from "@/components/sections/BentoGrid";
import StatsBar from "@/components/sections/StatsBar";
import ProcessStrip from "@/components/sections/ProcessStrip";
import Testimonial from "@/components/sections/Testimonial";
import ContactCTA from "@/components/sections/ContactCTA";
import AITransparency from "@/components/sections/AITransparency";
import FeaturedCaseStudy from "@/components/sections/FeaturedCaseStudy";
import GridBackground from "@/components/ui/GridBackground";

export default function Home() {
  return (
    <main className="w-full relative selection:bg-neutral-900 selection:text-white">
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
    </main>
  );
}