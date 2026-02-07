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
import GlobalGridWrapper from "@/components/GlobalGridWrapper";

// Wrapper component for sections that need grid background


export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-900 selection:text-white">
      {/* Hero includes TrustBar at bottom - No grid (has its own background) */}
      <Hero />

      {/* Stats Bar - With grid background */}
     <GlobalGridWrapper opacity={0.015} size={40}>
        <StatsBar />
      </GlobalGridWrapper>
      
      {/* Process Overview - With grid background */}
     <GlobalGridWrapper opacity={0.015} size={40}>
        <ProcessStrip />
      </GlobalGridWrapper>
      
      {/* AI/Engineering Proof - Already has grid */}
      <GlobalGridWrapper opacity={0.015} size={40}>
      <AITransparency />  
      </GlobalGridWrapper>
      {/* Capabilities Grid - With grid background */}
      <GlobalGridWrapper opacity={0.015} size={40}>
        <BentoGrid />
     </GlobalGridWrapper>
      
      {/* Social Proof - With grid background */}
      <GlobalGridWrapper opacity={0.015} size={40}>
        <Testimonial />
      
      </GlobalGridWrapper>
      {/* Featured Work - With grid background */}
      <GlobalGridWrapper opacity={0.015} size={40}>
        <FeaturedCaseStudy/>
     </GlobalGridWrapper>

      {/* Services - With grid background */}
      <GlobalGridWrapper opacity={0.015} size={40}>
        <Services />
    </GlobalGridWrapper>

      {/* Final CTA - With grid background */}
      <GlobalGridWrapper opacity={0.015} size={40}>
        <ContactCTA />
     </GlobalGridWrapper>
    </main>
  );
}