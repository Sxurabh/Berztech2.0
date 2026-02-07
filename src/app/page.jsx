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
     <GlobalGridWrapper gridOpacity={0.05} gridSize={40}>
        <StatsBar />
      </GlobalGridWrapper>
      
      {/* Process Overview - With grid background */}
     
        <ProcessStrip />
      
      
      {/* AI/Engineering Proof - Already has grid */}
      <AITransparency />  
      
      {/* Capabilities Grid - With grid background */}
      
        <BentoGrid />
     
      
      {/* Social Proof - With grid background */}
      
        <Testimonial />
      
      
      {/* Featured Work - With grid background */}
      
        <FeaturedCaseStudy/>
     

      {/* Services - With grid background */}
      
        <Services />
    

      {/* Final CTA - With grid background */}
      
        <ContactCTA />
     
    </main>
  );
}