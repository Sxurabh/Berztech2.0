// src/app/page.jsx
"use client";
import React from "react";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import Services from "@/components/Services";
import Button from "@/components/Button";
import BentoGrid from "@/components/BentoGrid";
import { CornerFrame } from "@/components/CornerFrame"; 
import StatsBar from "@/components/StatsBar";
import FeaturedCaseStudy from "@/components/FeaturedCaseStudy";
import ProcessStrip from "@/components/ProcessStrip";
import Testimonial from "@/components/Testimonial";
import ContactCTA from "@/components/ContactCTA";
import TrustBar from "@/components/TrustBar";
import AITransparency from "@/components/AITransparency";
import Hero from "@/components/Hero"; // Import the new Hero

export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-900 selection:text-white">
      {/* 1. HERO SECTION - Now using the component */}
      <Hero />

      {/* 2. CLIENTS (Validation) */}
      <TrustBar/>

      {/* 3. CODE SHOWCASE (Engineering Proof) */}
      
      <StatsBar />
      <ProcessStrip />
      <AITransparency />  
      <BentoGrid />
      <Testimonial />
      <FeaturedCaseStudy/>

      {/* 5. SERVICES (The Offer) */}
      <Services />

      {/* 6. CONTACT (The Closer) */}
      <ContactCTA />
    </main>
  );
}