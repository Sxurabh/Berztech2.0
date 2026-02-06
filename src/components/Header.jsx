// src/components/Header.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { HiMenuAlt4 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { layoutConfig } from "@/config/layout";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import whiteLogo from "../../assets/Logo/WhiteLogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";
import compactLogowhite from "../../assets/Logo/CompactLogo-white.png";

const navItems = [
  { title: "Work", href: "/work" },
  { title: "About", href: "/about" },
  { title: "Process", href: "/process" },
  { title: "Blog", href: "/blog" },
];

function DesktopNavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="group relative py-2">
      <span className={clsx(
        "font-jetbrains-mono text-xs uppercase tracking-widest transition-colors duration-300",
        isActive ? "text-neutral-900 font-semibold" : "text-neutral-500 group-hover:text-neutral-900"
      )}>
        {children}
      </span>
      <span className={clsx(
        "absolute -bottom-0.5 left-0 h-px bg-neutral-900 transition-all duration-300",
        isActive ? "w-full" : "w-0 group-hover:w-full"
      )} />
    </Link>
  );
}

function MobileNavLink({ href, children, index, onClick }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
    >
      <Link href={href} onClick={onClick} className="group block py-3">
        <div className="flex items-baseline gap-4">
          <span className="font-jetbrains-mono text-xs text-neutral-500 w-6">
            0{index + 1}
          </span>
          <span className={clsx(
            "font-space-grotesk text-4xl sm:text-5xl font-medium tracking-tight transition-colors duration-300",
            isActive ? "text-white" : "text-neutral-400 group-hover:text-white"
          )}>
            {children}
          </span>
        </div>
        <motion.div
          className="h-px bg-white/20 mt-3 origin-left"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
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

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white",
          mobileMenuOpen && "bg-neutral-950"
        )}
      >
        {/* Consistent grid container */}
        <div className={clsx(
          "mx-auto",
          layoutConfig.maxWidth,
          layoutConfig.padding.mobile,
          layoutConfig.padding.tablet,
          layoutConfig.padding.desktop
        )}>
          <div className="grid grid-cols-12 gap-4 items-center h-16 sm:h-20 lg:h-24">
            
            {/* Logo - spans 3 columns on desktop */}
            <div className="col-span-6 lg:col-span-3">
              <Link href="/" className="relative z-50 inline-block">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Image
                    src={mobileMenuOpen ? whiteLogo : blackLogo}
                    alt="Berztech"
                    className="hidden sm:block h-7 lg:h-8 w-auto object-contain"
                    priority
                  />
                  <Image
                    src={mobileMenuOpen ? compactLogowhite : compactLogoblack}
                    alt="Berztech"
                    className="block sm:hidden h-6 w-auto object-contain"
                    priority
                  />
                </motion.div>
              </Link>
            </div>

            {/* Desktop Navigation - spans 6 columns */}
            <nav className="hidden lg:flex col-span-6 items-center justify-center gap-8">
              {navItems.map((item) => (
                <DesktopNavLink key={item.href} href={item.href}>
                  {item.title}
                </DesktopNavLink>
              ))}
            </nav>

            {/* Desktop CTA - spans 3 columns */}
            <div className="hidden lg:flex col-span-3 items-center justify-end gap-6">
              <div className="flex items-center gap-2">
               
                
              </div>

              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-[11px] uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Hire Us
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </Link>
            </div>

            {/* Mobile: Hamburger - spans 6 columns */}
            <div className="col-span-6 lg:hidden flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={clsx(
                  "relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300",
                  mobileMenuOpen
                    ? "text-white hover:bg-white/10"
                    : "text-neutral-950 hover:bg-neutral-100"
                )}
                aria-label="Toggle menu"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? (
                    <IoMdClose className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <HiMenuAlt4 className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - uses same grid container */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="lg:hidden bg-neutral-950 overflow-hidden"
            >
              <div className={clsx(
                "mx-auto",
                layoutConfig.maxWidth,
                layoutConfig.padding.mobile,
                layoutConfig.padding.tablet,
                layoutConfig.padding.desktop
              )}>
                <div className="grid grid-cols-12 gap-4 py-8 sm:py-12">
                  {/* Navigation - full width */}
                  <div className="col-span-12 space-y-2 mb-10">
                    {navItems.map((item, index) => (
                      <MobileNavLink 
                        key={item.href} 
                        href={item.href} 
                        index={index}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.title}
                      </MobileNavLink>
                    ))}
                  </div>

                  {/* CTA - full width */}
                  <div className="col-span-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold"
                      >
                        Start Your Project →
                      </Link>
                    </motion.div>
                  </div>

                  {/* Footer info - spans 12 on mobile, 6+6 on tablet */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-12 mt-10 pt-8 border-t border-white/10"
                  >
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-6">
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 block mb-1">
                          Email
                        </span>
                        <a 
                          href="mailto:hello@berztech.com"
                          className="font-space-grotesk text-sm text-white hover:text-neutral-300 transition-colors"
                        >
                          hello@berztech.com
                        </a>
                      </div>

                      <div className="col-span-12 sm:col-span-6">
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 block mb-1">
                          Location
                        </span>
                        <span className="font-space-grotesk text-sm text-white">
                          Pune City, India
                        </span>
                      </div>

                      <div className="col-span-12 sm:col-span-6 sm:col-start-7 flex items-center gap-4 sm:justify-end">
                        {["TW", "GH", "LI"].map((social) => (
                          <a
                            key={social}
                            href="#"
                            className="w-8 h-8 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all text-[10px] font-jetbrains-mono"
                          >
                            {social}
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-16 sm:h-20 lg:h-24" />
    </>
  );
}