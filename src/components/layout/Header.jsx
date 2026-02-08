"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { layoutConfig } from "@/config/layout";

import blackLogo from "../../../assets/Logo/blacklogo.png";
import whiteLogo from "../../../assets/Logo/WhiteLogo.png";

const navItems = [
  { title: "Work", href: "/work" },
  { title: "About", href: "/about" },
  { title: "Process", href: "/process" },
  { title: "Blog", href: "/blog" },
];

// Redesigned Navigation Menu Button with corner brackets
function MenuButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative z-50 group"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className={clsx(
        "relative px-4 py-2 transition-all duration-300",
        " bg-white",
        "hover:border-neutral-400 hover:bg-neutral-50",
        isOpen && "border-neutral-700 bg-neutral-900"
      )}>
        {/* Corner Brackets */}
        <span className={clsx(
          "absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300",
          isOpen ? "border-neutral-400" : "border-neutral-400 group-hover:border-neutral-600"
        )} />
        <span className={clsx(
          "absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300",
          isOpen ? "border-neutral-400" : "border-neutral-400 group-hover:border-neutral-600"
        )} />
        <span className={clsx(
          "absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300",
          isOpen ? "border-neutral-400" : "border-neutral-400 group-hover:border-neutral-600"
        )} />
        <span className={clsx(
          "absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300",
          isOpen ? "border-neutral-400" : "border-neutral-400 group-hover:border-neutral-600"
        )} />

        {/* Menu Text */}
        <span className={clsx(
          "font-jetbrains-mono text-xs uppercase tracking-widest font-medium transition-colors duration-300",
          isOpen ? "text-black " : "text-neutral-900 "
        )}>
          {isOpen ? "Close" : "Menu"}
        </span>
      </div>
    </button>
  );
}

// Redesigned Hire Button with corner brackets
function HireButton() {
  return (
    <Link href="/contact" className="group relative hidden lg:block">
      <div className="relative px-5 py-2.5 bg-neutral-900 text-white transition-all duration-300 hover:bg-neutral-800">
        {/* Corner Brackets - White on dark */}
        <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-white/60 transition-colors duration-300" />
        <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 group-hover:border-white/60 transition-colors duration-300" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 group-hover:border-white/60 transition-colors duration-300" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-white/60 transition-colors duration-300" />

        <span className="flex items-center gap-2 font-jetbrains-mono text-[11px] uppercase tracking-widest font-semibold">
          Hire Us
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </span>
      </div>
    </Link>
  );
}

// Desktop Navigation with underline animation
function DesktopNav({ pathname }) {
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item, index) => (
        <React.Fragment key={item.href}>
          <Link 
            href={item.href} 
            className="group relative px-4 py-2"
          >
            
            <span className={clsx(
              "font-jetbrains-mono text-xs uppercase tracking-widest transition-colors duration-300",
              pathname === item.href ? "text-neutral-900 font-semibold" : "text-neutral-500 group-hover:text-neutral-900"
            )}>
              {item.title}
            </span>
            {/* Animated underline */}
            <span className={clsx(
              "absolute bottom-0 left-4 right-4 h-px bg-neutral-900 transition-transform duration-300 origin-left",
              pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )} />
          </Link>
          {index < navItems.length - 1 && (
            <span className="w-px h-4 bg-neutral-200" />
          )}
        </React.Fragment>
      ))}
    </nav>
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          // CHANGED: Always white background, no transparency
          "bg-white border-b border-neutral-100",
          scrolled && "shadow-sm"
        )}
      >
        <div className={clsx("mx-auto", layoutConfig.maxWidth, layoutConfig.padding.mobile, layoutConfig.padding.tablet, layoutConfig.padding.desktop)}>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="relative z-50">
              <Image 
                src={blackLogo} 
                alt="Berztech" 
                className="h-6 sm:h-7 w-auto" 
                priority 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <DesktopNav pathname={pathname} />
              <div className="w-px h-6 bg-neutral-200" />
              <HireButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MenuButton 
                isOpen={mobileMenuOpen} 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-16 left-0 right-0 bg-white border-b border-neutral-200 z-40 lg:hidden shadow-lg"
            >
              <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                          "group flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0",
                          pathname === item.href ? "text-neutral-900" : "text-neutral-500"
                        )}
                      >
                        <span className="font-space-grotesk text-lg font-medium">
                          {item.title}
                        </span>
                        <span className={clsx(
                          "font-jetbrains-mono text-xs transition-all duration-300",
                          pathname === item.href ? "text-neutral-900" : "text-neutral-300 group-hover:text-neutral-500"
                        )}>
                          0{index + 1}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-6 border-t border-neutral-100"
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold"
                  >
                    Start Your Project
                    <span>→</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
}