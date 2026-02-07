"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { layoutConfig } from "@/config/layout";

import blackLogo from "../../assets/Logo/blacklogo.png";
import whiteLogo from "../../assets/Logo/WhiteLogo.png";
// Removed compact logo imports - using full logo for all screen sizes

const navItems = [
  { title: "Work", href: "/work" },
  { title: "About", href: "/about" },
  { title: "Process", href: "/process" },
  { title: "Blog", href: "/blog" },
];

function HamburgerIcon({ isOpen }) {
  const lineVariants = {
    closed: { rotate: 0, y: 0 },
    open: (custom) => ({
      rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
      y: custom === 1 ? 8 : custom === 3 ? -8 : 0,
      opacity: custom === 2 ? 0 : 1,
    }),
  };

  const color = isOpen ? "#ffffff" : "#171717";

  return (
    <div className="w-6 h-5 flex flex-col justify-between relative">
      {[1, 2, 3].map((line) => (
        <motion.span
          key={line}
          custom={line}
          variants={lineVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="block w-full h-0.5 origin-center"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled && !mobileMenuOpen ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent",
          mobileMenuOpen && "bg-neutral-950"
        )}
      >
        <div className={clsx("mx-auto", layoutConfig.maxWidth, layoutConfig.padding.mobile, layoutConfig.padding.tablet, layoutConfig.padding.desktop)}>
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Logo - Full logo for ALL screen sizes */}
            <Link href="/" className="relative z-50">
              {/* Mobile: Full logo with adjusted height */}
              <Image 
                src={mobileMenuOpen ? whiteLogo : blackLogo} 
                alt="Berztech" 
                className="h-6 sm:h-7 lg:h-8 w-auto" 
                priority 
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="group relative py-2">
                  <span className={clsx("font-jetbrains-mono text-xs uppercase tracking-widest transition-colors", pathname === item.href ? "text-neutral-900 font-semibold" : "text-neutral-500 group-hover:text-neutral-900")}>
                    {item.title}
                  </span>
                  <span className={clsx("absolute -bottom-0.5 left-0 h-px bg-neutral-900 transition-all", pathname === item.href ? "w-full" : "w-0 group-hover:w-full")} />
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-6">
              <Link href="/contact">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-[11px] uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors">
                  Hire Us
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </motion.span>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={clsx("relative z-50 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 lg:hidden", mobileMenuOpen ? "bg-white/10 text-white" : "hover:bg-neutral-100 text-neutral-950")}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <HamburgerIcon isOpen={mobileMenuOpen} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-neutral-950 z-40 lg:hidden overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px]" />
              
              <div className="relative h-full flex flex-col p-6 sm:p-8 pt-24">
                <nav className="flex-1">
                  {navItems.map((item, index) => (
                    <motion.div key={item.href} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
                      <Link href={item.href} onClick={() => setMobileMenuOpen(false)} className="group block">
                        <div className="flex items-baseline gap-4 py-4 border-b border-white/10">
                          <span className="font-jetbrains-mono text-xs text-neutral-500 w-8">0{index + 1}</span>
                          <span className={clsx("font-space-grotesk text-4xl sm:text-5xl font-medium tracking-tight transition-colors", pathname === item.href ? "text-white" : "text-neutral-400 group-hover:text-white")}>
                            {item.title}
                          </span>
                          {pathname === item.href && <motion.span layoutId="activeIndicator" className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="border-t border-white/10 pt-6">
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block w-full py-4 bg-white text-neutral-950 font-jetbrains-mono text-sm uppercase tracking-widest font-semibold text-center hover:bg-neutral-100 transition-colors mb-6">
                    Start Your Project →
                  </Link>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 block mb-1">Email</span>
                      <a href="mailto:hello@berztech.com" className="text-white hover:text-emerald-400 transition-colors">hello@berztech.com</a>
                    </div>
                    <div>
                      <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 block mb-1">Location</span>
                      <span className="text-white">Pune, India</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {["GH", "LI", "TW"].map((social, i) => (
                      <motion.a key={social} href="#" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }} className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 text-xs font-jetbrains-mono transition-colors">
                        {social}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16 sm:h-20 lg:h-24" />
    </>
  );
}