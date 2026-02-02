import React, { useState } from "react";
import Container from "./Container";
import FadeIn from "./FadeIn";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";

/* --- Navigation Link --- */
const FooterLink = ({ href, children, external = false }) => (
  <Link
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    className="group flex items-center gap-1 font-jetbrains-mono text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
  >
    {children}
    {external && (
      <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    )}
  </Link>
);

/* --- Social Link --- */
const SocialLink = ({ href, platform }) => {
  const icons = {
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    github: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    instagram: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
      aria-label={platform}
    >
      {icons[platform]}
    </a>
  );
};

/* --- Newsletter Form --- */
const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-sm">
      <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-2">
        Stay in the loop
      </h3>
      <p className="font-jetbrains-mono text-xs text-neutral-500 mb-4 leading-relaxed">
        Monthly insights on web development, design trends, and digital growth strategies.
      </p>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === "loading" || status === "success"}
          className={clsx(
            "w-full px-4 py-3 bg-neutral-50 border font-jetbrains-mono text-xs placeholder:text-neutral-400 focus:outline-none transition-all",
            status === "success" 
              ? "border-emerald-500 text-emerald-700 bg-emerald-50" 
              : "border-neutral-200 focus:border-neutral-400 text-neutral-900"
          )}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={clsx(
            "absolute right-1.5 top-1.5 px-3 py-1.5 font-jetbrains-mono text-[10px] font-bold uppercase tracking-wider transition-all",
            status === "success"
              ? "bg-emerald-500 text-white"
              : "bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50"
          )}
        >
          {status === "loading" ? "..." : status === "success" ? "Done" : "Join"}
        </button>
      </form>
      
      {status === "success" && (
        <p className="mt-2 font-jetbrains-mono text-[10px] text-emerald-600">
          Thanks for subscribing!
        </p>
      )}
    </div>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    services: [
      { label: "Web Development", href: "/services/web" },
      { label: "Mobile Apps", href: "/services/mobile" },
      { label: "Branding", href: "/services/branding" },
      { label: "Marketing", href: "/services/marketing" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Process", href: "/process" },
      { label: "Contact", href: "/contact" },
    ],
    resources: [
      { label: "Blog", href: "/blog" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "FAQ", href: "/faq" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ]
  };

  return (
    <footer className="w-full bg-white border-t border-neutral-200">
      <Container className="py-16 sm:py-20">
        <FadeIn>
          {/* Main Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src={blackLogo}
                  alt="Berztech"
                  className="hidden sm:block h-7 w-auto object-contain"
                />
                <Image
                  src={compactLogoblack}
                  alt="Berztech"
                  className="block sm:hidden h-6 w-auto object-contain"
                />
              </Link>
              <p className="font-jetbrains-mono text-xs text-neutral-500 leading-relaxed max-w-xs mb-6">
                Digital studio crafting websites, mobile apps, and brand identities for ambitious businesses.
              </p>
              <div className="flex gap-2">
                <SocialLink href="https://twitter.com" platform="twitter" />
                <SocialLink href="https://linkedin.com" platform="linkedin" />
                <SocialLink href="https://github.com" platform="github" />
                <SocialLink href="https://instagram.com" platform="instagram" />
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-jetbrains-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                Services
              </h4>
              <ul className="space-y-2.5">
                {navigation.services.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-jetbrains-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                {navigation.company.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-jetbrains-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {navigation.resources.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:col-start-6">
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-jetbrains-mono text-[10px] text-neutral-400 order-2 sm:order-1">
              © {currentYear} Berztech. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 order-1 sm:order-2">
              {navigation.legal.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </div>
          </div>
        </FadeIn>
      </Container>
    </footer>
  );
};

export default Footer;