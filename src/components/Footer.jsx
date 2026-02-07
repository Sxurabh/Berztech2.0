// src/components/Footer.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CornerFrame } from "@/components/CornerFrame";
import { SocialMediaProfiles } from "@/components/SocialMedia";
// 1. Import the GridBackground
import GridBackground from "@/components/GridBackground";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";

// ... [Keep footerLinks, AccordionSection, DesktopLinkSection, NewsletterCompact exactly as they are] ...

const footerLinks = {
  services: {
    title: "Services",
    links: [
      { label: "Web Development", href: "/services/web" },
      { label: "Mobile Apps", href: "/services/mobile" },
      { label: "UI/UX Design", href: "/services/design" },
      { label: "Strategy", href: "/services/strategy" },
    ]
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Process", href: "/process" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ]
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Case Studies", href: "/work" },
      { label: "Documentation", href: "#" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ]
  }
};

function AccordionSection({ section, isOpen, onToggle, index }) {
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-2 text-left touch-manipulation"
        aria-expanded={isOpen}
      >
        <span className="font-space-grotesk text-sm font-medium text-neutral-900">
          {section.title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-neutral-400 text-lg"
          style={{ minWidth: "24px", textAlign: "center" }}
        >
          +
        </motion.span>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <ul className="pb-4 px-2 space-y-3">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors py-1 touch-manipulation"
                    style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesktopLinkSection({ section }) {
  return (
    <div>
      <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-4">
        {section.title}
      </h3>
      <ul className="space-y-3">
        {section.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors inline-block py-1"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterCompact() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 2000);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={status === "loading" || status === "success"}
        className={`
          flex-1 px-4 py-3 text-sm font-jetbrains-mono bg-neutral-50 border 
          focus:outline-none focus:border-neutral-400 transition-colors min-h-[44px]
          ${status === "success" ? "border-emerald-500 text-emerald-700" : "border-neutral-200 text-neutral-900"}
        `}
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className={`
          px-6 py-3 text-sm font-jetbrains-mono font-semibold uppercase tracking-wider transition-colors min-h-[44px] sm:min-w-[100px]
          ${status === "success" ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-800"}
        `}
      >
        {status === "loading" ? "..." : status === "success" ? "✓ Joined" : "Join"}
      </button>
    </form>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const currentYear = new Date().getFullYear();

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    // 2. Added 'relative' and 'overflow-hidden' to ensure grid stays INSIDE footer
    <footer className="relative  overflow-hidden">
      
      {/* 3. Add the GridBackground here */}
      {/* Main Footer Content - Added relative z-10 to sit above grid */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* ... [Rest of the footer content remains exactly the same] ... */}
        
        {/* Top Section - Logo & Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12 pb-8 sm:pb-12">
          {/* Logo & Description */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={blackLogo}
                alt="Berztech"
                className="hidden sm:block h-7 w-auto"
              />
              <Image
                src={compactLogoblack}
                alt="Berztech"
                className="block sm:hidden h-6 w-auto"
              />
            </Link>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              Engineering digital excellence for ambitious teams. 
              We build products that matter.
            </p>
            
            {/* Social Links - Horizontal on mobile */}
            <div className="flex items-center gap-1">
              {SocialMediaProfiles.slice(0, 4).map((profile) => (
                <a
                  key={profile.title}
                  href={profile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-all touch-manipulation"
                  aria-label={profile.title}
                  style={{ minWidth: "44px", minHeight: "44px" }}
                >
                  <profile.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter - Full width on mobile */}
          <div className="lg:max-w-md w-full">
            <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-3">
              Stay updated
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Get insights on engineering, design, and digital strategy.
            </p>
            <NewsletterCompact />
          </div>
        </div>

        {/* Navigation Links - Accordion on mobile, Grid on desktop */}
        <div className="py-6 sm:py-8">
          {/* Mobile: Accordion */}
          <div className="sm:hidden">
            {Object.entries(footerLinks).map(([key, section], index) => (
              <AccordionSection
                key={key}
                section={section}
                isOpen={openSection === key}
                onToggle={() => toggleSection(key)}
                index={index}
              />
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-8">
            <DesktopLinkSection section={footerLinks.services} />
            <DesktopLinkSection section={footerLinks.company} />
            <DesktopLinkSection section={footerLinks.resources} />
            
            {/* Contact Info Column */}
            <div className="lg:col-span-1">
              <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-4">
                Contact
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:hello@berztech.com"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    hello@berztech.com
                  </a>
                </li>
                <li className="text-sm text-neutral-600">
                  Pune, India
                </li>
                <li>
                  <span className="inline-flex items-center gap-2 text-sm text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Available for projects
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Contact Info - Only visible on mobile */}
        <div className="sm:hidden py-6 border-t border-neutral-100">
          <div className="flex flex-col gap-3">
            <a 
              href="mailto:hello@berztech.com"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors py-2 touch-manipulation"
              style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
            >
              hello@berztech.com
            </a>
            <div className="flex items-center gap-2 text-sm text-emerald-600 py-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Available for projects
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Added relative z-10 */}
      <div className="relative z-10   bg-neutral-50/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs font-jetbrains-mono text-neutral-500 text-center sm:text-left">
              © {currentYear} Berzcode technologies pvt. ltd. All rights reserved.
            </p>
            
            <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6">
              <Link 
                href="/privacy" 
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors touch-manipulation py-2"
                style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors touch-manipulation py-2"
                style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
              >
                Terms
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors touch-manipulation py-2 flex items-center gap-1"
                style={{ minHeight: "44px" }}
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}