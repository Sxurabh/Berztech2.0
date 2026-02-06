// src/components/Footer.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CornerFrame } from "@/components/CornerFrame";
import { SocialMediaProfiles } from "@/components/SocialMedia";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";

const footerLinks = {
  services: [
    { label: "Web Dev", href: "/services/web" },
    { label: "Mobile", href: "/services/mobile" },
    { label: "Branding", href: "/services/branding" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Work", href: "/work" },
    { label: "Process", href: "/process" },
    { label: "Contact", href: "/contact" },
  ]
};

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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={status === "loading" || status === "success"}
        className={`
          w-32 sm:w-40 px-3 py-2 text-xs font-jetbrains-mono bg-neutral-50 border 
          focus:outline-none focus:border-neutral-400 transition-colors
          ${status === "success" ? "border-emerald-500 text-emerald-700" : "border-neutral-200 text-neutral-900"}
        `}
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className={`
          px-3 py-2 text-[10px] font-jetbrains-mono font-bold uppercase tracking-wider transition-colors
          ${status === "success" ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-700"}
        `}
      >
        {status === "loading" ? "..." : status === "success" ? "✓" : "Join"}
      </button>
    </form>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-100">
      {/* Main Footer Row */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          
          {/* Left: Brand + Newsletter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Link href="/" className="shrink-0">
              <Image
                src={blackLogo}
                alt="Berztech"
                className="hidden sm:block h-6 w-auto"
              />
              <Image
                src={compactLogoblack}
                alt="Berztech"
                className="block sm:hidden h-5 w-auto"
              />
            </Link>
            
            <div className="hidden sm:block h-8 w-px bg-neutral-200" />
            
            
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            {footerLinks.services.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="hidden sm:block h-4 w-px bg-neutral-200" />
            {footerLinks.company.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Social */}
          <div className="flex items-center gap-2">
            {SocialMediaProfiles.slice(0, 4).map((profile) => (
              <a
                key={profile.title}
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-all"
                aria-label={profile.title}
              >
                <profile.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[10px] font-jetbrains-mono text-neutral-400">
              © {currentYear} Berztech. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-[10px] font-jetbrains-mono text-neutral-400 hover:text-neutral-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[10px] font-jetbrains-mono text-neutral-400 hover:text-neutral-900 transition-colors">
                Terms
              </Link>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-jetbrains-mono text-neutral-400">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}