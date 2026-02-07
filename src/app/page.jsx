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

// Wrapper component for sections that need grid background
function SectionWithGrid({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <GridBackground opacity={0.015} size={40} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-900 selection:text-white">
      {/* Hero includes TrustBar at bottom - No grid (has its own background) */}
      <Hero />

      {/* Stats Bar - With grid background */}
      <SectionWithGrid>
        <StatsBar />
      </SectionWithGrid>
      
      {/* Process Overview - With grid background */}
      <SectionWithGrid>
        <ProcessStrip />
      </SectionWithGrid>
      
      {/* AI/Engineering Proof - Already has grid */}
      <AITransparency />  
      
      {/* Capabilities Grid - With grid background */}
      <SectionWithGrid>
        <BentoGrid />
      </SectionWithGrid>
      
      {/* Social Proof - With grid background */}
      <SectionWithGrid className="bg-neutral-50">
        <Testimonial />
      </SectionWithGrid>
      
      {/* Featured Work - With grid background */}
      <SectionWithGrid>
        <FeaturedCaseStudy/>
      </SectionWithGrid>

      {/* Services - With grid background */}
      <SectionWithGrid>
        <Services />
      </SectionWithGrid>

      {/* Final CTA - With grid background */}
      <SectionWithGrid>
        <ContactCTA />
      </SectionWithGrid>
    </main>
  );
}