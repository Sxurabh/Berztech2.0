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

export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-900 selection:text-white">
      {/* Hero includes TrustBar at bottom */}
      <Hero />

      {/* Stats Bar - Immediate credibility */}
      <StatsBar />
      
      {/* Process Overview */}
      <ProcessStrip />
      
      {/* AI/Engineering Proof */}
      <AITransparency />  
      
      {/* Capabilities Grid */}
      <BentoGrid />
      
      {/* Social Proof */}
      <Testimonial />
      
      {/* Featured Work */}
      <FeaturedCaseStudy/>

      {/* Services */}
      <Services />

      {/* Final CTA */}
      <ContactCTA />
    </main>
  );
}