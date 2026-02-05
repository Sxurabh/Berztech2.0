"use client";
import React, { useState, useEffect } from "react";
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


/* --- NEW: Hero Background Component (The "Element" you requested) --- */
function HeroBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-white">
      {/* 1. Base Grid Pattern (The "Architect" Blueprint) */}
      <div 
        className="absolute inset-0 opacity-[1]"
        style={{ 
          backgroundImage: `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`, 
          backgroundSize: '25px 25px' 
        }}
      />
      
      {/* 2. The Spotlight (The "Interactive" Element) */}
      <div 
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.0), white 40%)`,
        }}
      />

      {/* 3. Subtle Floating Orbs (Depth) */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}

/* --- NEW: Status Badge Component --- */
function StatusBadge() {
  return (
    // Wrapped in w-fit to prevent full width expansion
    <div className="w-fit mb-8">
      <CornerFrame className="px-3 py-1 backdrop-blur-md ">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-neutral-500">
            Accepting New Projects
          </span>
        </div>
      </CornerFrame>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-900 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 isolate">
        
        {/* The New "Architect" Background */}
        <HeroBackground />

        <Container>
          <FadeIn>
            {/* The New "Signal" Badge */}
            <StatusBadge />

            <h1 className="font-space-grotesk text-6xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-8xl lg:text-[120px] leading-[0.9]">
              Engineering <br /> 
              Digital <span className="text-neutral-400 relative inline-block">
                Excellence.
                {/* Visual Accent: Straight Horizontal Stroke */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-500 opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 L 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>
            
            <div className="mt-12 max-w-2xl relative">
              {/* Decorative side line for "Technical" feel */}
              <div className="absolute -left-6 top-2 bottom-2 w-0.5 bg-neutral-200 hidden sm:block"></div>

              <p className="font-jetbrains-mono text-lg leading-relaxed text-neutral-600 sm:text-xl relative z-10">
                We are a boutique engineering studio architecting high-performance 
                web applications for the next generation of digital leaders. 
                No templates, just pure code.
              </p>
              
              <div className="mt-10 flex gap-6">
                <Button href="/contact" className="w-full sm:w-auto" >
                  Start your project
                </Button>
                
                <Button href="/process" className="w-full sm:w-auto">
                  Explore our process
                </Button>
              </div>
            </div>
          </FadeIn>
        </Container>
      </div>

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