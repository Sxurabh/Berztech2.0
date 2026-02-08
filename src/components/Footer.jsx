// src/components/Footer.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CornerFrame } from "@/components/CornerFrame";
import GridBackground from "@/components/GridBackground";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";

// Social icons as components for consistency
const SocialIcons = {
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  GitHub: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Dribbble: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.29zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.428 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
    </svg>
  )
};

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: SocialIcons.Twitter },
  { name: "GitHub", href: "https://github.com", icon: SocialIcons.GitHub },
  { name: "LinkedIn", href: "https://linkedin.com", icon: SocialIcons.LinkedIn },
  { name: "Dribbble", href: "https://dribbble.com", icon: SocialIcons.Dribbble },
];

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

// REPLACE the NewsletterForm component in your Footer.jsx with this:



function LinkSection({ title, links }) {
  return (
    <div className="space-y-3">
      <h3 className="font-space-grotesk text-sm font-medium text-neutral-900">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
            >
              <span className="w-0 group-hover:w-2 h-px bg-neutral-900 transition-all duration-200" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileAccordion({ sections }) {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="border-t border-neutral-200">
      {sections.map(([key, section]) => (
        <div key={key} className="border-b border-neutral-200">
          <button
            onClick={() => setOpenSection(openSection === key ? null : key)}
            className="w-full flex items-center justify-between py-4 text-left"
            aria-expanded={openSection === key}
          >
            <span className="font-space-grotesk text-sm font-medium text-neutral-900">
              {section.title}
            </span>
            <motion.span
              animate={{ rotate: openSection === key ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-neutral-400 text-lg font-light"
            >
              +
            </motion.span>
          </button>
          
          <AnimatePresence initial={false}>
            {openSection === key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <ul className="pb-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1"
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
      ))}
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative  overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <GridBackground size={32} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Link href="/" className="inline-block">
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
              
              <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
                Engineering digital excellence for ambitious teams. 
                We build products that matter.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-1">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-jetbrains-mono text-emerald-700 uppercase tracking-wider">
                  Available for projects
                </span>
              </div>
            </div>

            {/* Links Columns - Desktop */}
            <div className="hidden lg:grid lg:col-span-5 grid-cols-3 gap-6">
              <LinkSection {...footerLinks.services} />
              <LinkSection {...footerLinks.company} />
              <LinkSection {...footerLinks.resources} />
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-3 space-y-4">
              <div>
                <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-1">
                  Stay updated
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Get insights on engineering, design, and digital strategy.
                </p>
              </div>
              
              
              
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Accordion Links */}
          <div className="lg:hidden mt-10">
            <MobileAccordion sections={Object.entries(footerLinks)} />
          </div>

          {/* Contact Info Bar */}
          <div className="mt-6 pt-4 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-600">
                <a 
                  href="mailto:hello@berztech.com"
                  className="hover:text-neutral-900 transition-colors font-jetbrains-mono text-xs uppercase tracking-wider"
                >
                  hello@berztech.com
                </a>
                <span className="hidden sm:inline text-neutral-300">·</span>
                <span className="text-xs text-neutral-500">Pune, India</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-jetbrains-mono text-neutral-400">
                <span className="uppercase tracking-wider">Response time: ~4hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs font-jetbrains-mono text-neutral-400">
              © {currentYear} Berzcode technologies pvt. ltd.
            </p>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/privacy" 
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
              >
                Terms
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group flex items-center gap-1 text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
              >
                Top
                <motion.span
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ↑
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}