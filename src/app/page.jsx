// src/app/page.jsx
"use client";
import React from "react";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import BentoGrid from "@/components/BentoGrid";
import StatsBar from "@/components/StatsBar";
import ProcessStrip from "@/components/ProcessStrip";
import Testimonial from "@/components/Testimonial";
import ContactCTA from "@/components/ContactCTA";
import AITransparency from "@/components/AITransparency";
import FeaturedCaseStudy from "@/components/FeaturedCaseStudy";
import GridBackground from "@/components/GridBackground";

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