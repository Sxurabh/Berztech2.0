"use client";
import React, { useState, useEffect, useRef } from "react";
import ContactSection from "@/components/ContactSection";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import Services from "@/components/Services";
import Button from "@/components/Button";
import Clients from "@/components/Clients";
import CodeShowcase from "@/components/CodeShowcase";
import BentoGrid from "@/components/BentoGrid";
import { CornerFrame } from "@/components/CornerFrame";
import clsx from "clsx";

/* --- Subtle Grid Background --- */
function MinimalGrid() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-white">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
          backgroundSize: '60px 60px' 
        }}
      />
      {/* Subtle accent orb */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-[120px] opacity-50" />
    </div>
  );
}

/* --- Availability Badge --- */
function AvailabilityBadge() {
  return (
    <div className="w-fit mb-6 sm:mb-8">
      <CornerFrame className="px-3 py-2 bg-white border-neutral-200" bracketClassName="w-3 h-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-neutral-600">
            Now Booking Q1 2025
          </span>
        </div>
      </CornerFrame>
    </div>
  );
}

/* --- Service Preview Cards (Minimal) --- */
function ServicePreview() {
  const services = [
    { 
      title: "Web Development", 
      desc: "Custom websites & web apps",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    { 
      title: "Mobile Apps", 
      desc: "iOS & Android development",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      title: "Branding", 
      desc: "Identity & design systems",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    { 
      title: "Digital Marketing", 
      desc: "Growth & visibility",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16 pt-8 border-t border-neutral-200">
      {services.map((service, i) => (
        <div 
          key={service.title}
          className="group p-4 sm:p-5 bg-neutral-50 border border-neutral-100 hover:border-neutral-300 hover:bg-white transition-all duration-300 cursor-default"
        >
          <div className="text-neutral-400 group-hover:text-neutral-900 transition-colors mb-3">
            {service.icon}
          </div>
          <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-1">
            {service.title}
          </h3>
          <p className="font-jetbrains-mono text-[10px] text-neutral-500 leading-relaxed">
            {service.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

/* --- Scroll Progress --- */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-neutral-100 z-50">
      <div 
        className="h-full bg-neutral-950 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* --- Floating Contact (Mobile) --- */
function FloatingContact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="#contact"
      className="fixed bottom-6 right-6 z-40 bg-neutral-950 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform lg:hidden animate-fade-up"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </a>
  );
}

/* --- Selected Work Preview --- */
function WorkPreview() {
  const projects = [
    { name: "Luxe Retail", type: "E-Commerce", year: "2024" },
    { name: "FinanceHub", type: "Fintech App", year: "2024" },
    { name: "Brand Co.", type: "Brand Identity", year: "2023" },
  ];

  return (
    <div className="mt-16 sm:mt-24 border-t border-neutral-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Selected Work
        </span>
        <a href="/work" className="font-jetbrains-mono text-[10px] text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1 group">
          View All
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div className="space-y-0">
        {projects.map((project, i) => (
          <div 
            key={project.name}
            className="group flex items-center justify-between py-4 border-b border-neutral-100 hover:border-neutral-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="font-jetbrains-mono text-[10px] text-neutral-400 w-8">
                0{i + 1}
              </span>
              <span className="font-space-grotesk text-base sm:text-lg font-medium text-neutral-900 group-hover:translate-x-2 transition-transform">
                {project.name}
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
              <span className="font-jetbrains-mono text-[10px] text-neutral-500 hidden sm:block">
                {project.type}
              </span>
              <span className="font-jetbrains-mono text-[10px] text-neutral-400">
                {project.year}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-950 selection:text-white">
      <ScrollProgress />
      <FloatingContact />
      
      {/* HERO SECTION - Minimal & Bold */}
      <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 isolate min-h-[85vh] flex flex-col justify-center">
        <MinimalGrid />

        <Container>
          <FadeIn>
            <AvailabilityBadge />

            {/* Label */}
            <p className="font-jetbrains-mono text-[10px] sm:text-xs text-neutral-400 uppercase tracking-[0.2em] mb-4 sm:mb-6">
              Web & Mobile Studio
            </p>

            {/* Main Headline */}
            <h1 className="font-space-grotesk text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-neutral-950 leading-[0.95] max-w-4xl mb-6 sm:mb-8">
              We design and build digital products for{" "}
              <span className="text-neutral-400">ambitious brands.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="font-jetbrains-mono text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed mb-8 sm:mb-10">
              Websites, mobile applications, and brand identities that drive growth 
              for startups and established businesses.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button href="#contact" className="w-full sm:w-auto justify-center">
                Start a Project
              </Button>
              <Button href="/work" variant="secondary" className="w-full sm:w-auto justify-center">
                View Our Work
              </Button>
            </div>

            {/* Service Preview Grid */}
            <ServicePreview />

            {/* Selected Work */}
            <WorkPreview />
          </FadeIn>
        </Container>
      </section>

      {/* CLIENTS - Trust */}
      <section className="py-16 sm:py-20 border-y border-neutral-100 bg-neutral-50/30">
        <Container>
          <Clients />
        </Container>
      </section>

      {/* SERVICES - Detailed */}
      <section id="services" className="py-20 sm:py-32">
        <Services />
      </section>

      {/* PROCESS - How we work */}
      <section className="py-20 sm:py-32 bg-neutral-950 text-white">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-4 block">
              Our Process
            </span>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
              Strategy, design, and development—
              <span className="text-neutral-500">delivered as one.</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Discovery",
                desc: "We understand your business, audience, and goals to define the right solution."
              },
              {
                step: "02",
                title: "Design & Build",
                desc: "From wireframes to final code, we craft every detail with precision."
              },
              {
                step: "03",
                title: "Launch & Grow",
                desc: "Deployment, marketing setup, and ongoing support to ensure success."
              }
            ].map((item, i) => (
              <div key={item.step} className="group">
                <span className="font-jetbrains-mono text-[10px] text-neutral-600 mb-4 block">
                  {item.step}
                </span>
                <h3 className="font-space-grotesk text-xl sm:text-2xl font-medium mb-3 group-hover:text-neutral-300 transition-colors">
                  {item.title}
                </h3>
                <p className="font-jetbrains-mono text-sm text-neutral-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CAPABILITIES - Bento Grid */}
      <section className="py-20 sm:py-32">
        <BentoGrid />
      </section>

      {/* CODE SHOWCASE - Technical Credibility */}
      <section className="py-20 sm:py-32 bg-neutral-50">
        <CodeShowcase />
      </section>

      {/* TESTIMONIALS - Social Proof */}
      <section className="py-20 sm:py-32 border-y border-neutral-200">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8 block">
              Client Words
            </span>
            <blockquote className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 leading-tight mb-8">
              "They transformed our outdated website into a modern sales engine. 
              Our conversion rate increased by 140% within three months."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-full" />
              <div className="text-left">
                <div className="font-jetbrains-mono text-xs font-bold text-neutral-900">
                  Sarah Chen
                </div>
                <div className="font-jetbrains-mono text-[10px] text-neutral-500">
                  CEO, TechStart Inc.
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <ContactSection />
      </section>

  

      <style jsx global>{`
        @keyframes fade-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-up {
          animation: fade-up 0.3s ease-out forwards;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  );
}