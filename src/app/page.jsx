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

export default function Home() {
  return (
    <main className="w-full  relative selection:bg-neutral-900 selection:text-white">
      <Hero />
      
      {/* You can now use the components directly since they have their own grids */}
      
      {/* Note: StatsBar didn't have a bg-color, so it was the only one working before. 
          If you want to keep using GlobalGridWrapper just for StatsBar, you can, 
          OR you can add GridBackground inside StatsBar.jsx too. */}
          
      
        <StatsBar />
      
      
      <ProcessStrip />
      <AITransparency />
      <BentoGrid />
      <Testimonial />
      <FeaturedCaseStudy/>
      <Services />
      <ContactCTA />
    </main>
  );
}