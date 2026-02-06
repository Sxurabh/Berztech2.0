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
import Offices from "./Offices";
import SocialMedia from "./SocialMedia";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import whiteLogo from "../../assets/Logo/WhiteLogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";
import compactLogowhite from "../../assets/Logo/CompactLogo-white.png";

function Counter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, value]);

  return (
    <span ref={(el) => el && setIsVisible(true)} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

function NavLink({ href, children, index, onClick }) {
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
            "font-space-grotesk text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight transition-colors duration-300",
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

function MenuStat({ value, suffix, label }) {
  return (
    <div className="group cursor-default">
      <div className="font-space-grotesk text-3xl font-medium text-white tabular-nums">
        <Counter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 group-hover:text-neutral-400 transition-colors">
        {label}
      </div>
    </div>
  );
}

export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const pathname = usePathname();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  const navItems = [
    { title: "Work", href: "/work" },
    { title: "About", href: "/about" },
    { title: "Process", href: "/process" },
    { title: "Blog", href: "/blog" },
  ];

  return (
    <>
      {/* HEADER BAR - Fixed at top, full width white bg */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          expanded ? "bg-neutral-950" : "bg-white"
        )}
      >
        {/* Aligned content container */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            {/* Logo */}
            <Link href="/" className="relative z-50 flex-shrink-0">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                <Image
                  src={expanded ? whiteLogo : blackLogo}
                  alt="Berztech"
                  className="hidden sm:block h-8 lg:h-9 w-auto object-contain"
                  priority
                />
                <Image
                  src={expanded ? compactLogowhite : compactLogoblack}
                  alt="Berztech"
                  className="block sm:hidden h-6 w-auto object-contain"
                  priority
                />
              </motion.div>
            </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
              {/* Status - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                  Available
                </span>
              </div>

              {/* Hire Button - Desktop */}
              <Link href="/contact" className="hidden md:block">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2 font-jetbrains-mono text-[10px] uppercase tracking-widest font-semibold border transition-all duration-300",
                    expanded
                      ? "border-white text-white hover:bg-white hover:text-neutral-950"
                      : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                  )}
                >
                  Hire Us
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </Link>

              {/* Hamburger - All Screens */}
              <button
                onClick={() => setExpanded(!expanded)}
                className={clsx(
                  "relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-colors duration-300",
                  expanded
                    ? "text-white hover:bg-white/10"
                    : "text-neutral-950 hover:bg-neutral-100"
                )}
                aria-label="Toggle menu"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {expanded ? (
                    <IoMdClose className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <HiMenuAlt4 className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* EXPANDING MENU - Full width black bg, aligned content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
              opacity: { duration: 0.2 }
            }}
            className="fixed left-0 right-0 top-[72px] sm:top-[88px] bg-neutral-950 z-40 overflow-hidden"
          >
            {/* Content stays aligned with max-w-5xl */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="py-10 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
                  {/* Navigation */}
                  <div className="lg:col-span-7 space-y-1">
                    {navItems.map((item, index) => (
                      <NavLink 
                        key={item.href} 
                        href={item.href} 
                        index={index}
                        onClick={() => setExpanded(false)}
                      >
                        {item.title}
                      </NavLink>
                    ))}
                    
                    {/* Mobile CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-6 md:hidden"
                    >
                      <Link
                        href="/contact"
                        onClick={() => setExpanded(false)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-white text-neutral-950 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold"
                      >
                        Start Your Project →
                      </Link>
                    </motion.div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="lg:col-span-5 space-y-8 lg:space-y-10 lg:pl-8 lg:border-l lg:border-white/10">
                    {/* Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-8"
                    >
                      <MenuStat value={50} suffix="+" label="Projects" />
                      <MenuStat value={98} suffix="%" label="Retention" />
                    </motion.div>

                    {/* Office */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <h4 className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                        Office
                      </h4>
                      <Offices invert className="text-neutral-300" />
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                        Contact
                      </h4>
                      <a 
                        href="mailto:hello@berztech.com"
                        className="font-space-grotesk text-lg text-white hover:text-neutral-300 transition-colors"
                      >
                        hello@berztech.com
                      </a>
                    </motion.div>

                    {/* Social */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <h4 className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                        Follow
                      </h4>
                      <SocialMedia invert />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[72px] sm:h-[88px]" />
    </>
  );
}