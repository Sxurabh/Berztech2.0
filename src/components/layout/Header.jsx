"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { layoutConfig } from "@/config/layout";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FiUser, FiLogOut, FiGrid } from "react-icons/fi";

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
      className="relative z-50 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
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
    <Link
      href="/contact"
      className="group relative hidden lg:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
      aria-label="Contact Us"
    >
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

// Auth Button — Sign In or Admin dropdown
function AuthButton({ mobile = false }) {
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  if (!user) {
    if (mobile) {
      return (
        <Link
          href="/auth/login"
          className="flex items-center gap-2 py-3 text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <FiUser className="w-4 h-4" />
          <span className="font-space-grotesk text-lg font-medium">Sign In</span>
        </Link>
      );
    }
    return (
      <Link
        href="/auth/login"
        className="group relative hidden lg:flex items-center gap-2 px-4 py-2 transition-colors"
      >
        <FiUser className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
        <span className="font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500 group-hover:text-neutral-900 transition-colors">
          Sign In
        </span>
      </Link>
    );
  }

  if (mobile) {
    return (
      <div className="space-y-1 border-t border-neutral-100 pt-3 mt-3">
        <Link
          href="/admin"
          className="flex items-center gap-2 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <FiGrid className="w-4 h-4" />
          <span className="font-space-grotesk text-base font-medium">Admin Dashboard</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-2 py-2 text-neutral-500 hover:text-red-600 transition-colors w-full"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="font-space-grotesk text-base font-medium">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative hidden lg:block" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 transition-colors"
      >
        <div className="w-7 h-7 bg-neutral-900 flex items-center justify-center">
          <span className="font-jetbrains-mono text-[10px] font-bold text-white">
            {user.email?.[0]?.toUpperCase() || "A"}
          </span>
        </div>
        <svg className={clsx("w-3 h-3 text-neutral-400 transition-transform", dropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 shadow-lg z-50"
          >
            <div className="p-2 border-b border-neutral-100">
              <p className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest truncate">
                {user.email}
              </p>
            </div>
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-jetbrains-mono text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              <FiGrid className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <button
              onClick={() => { signOut(); setDropdownOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-jetbrains-mono text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
            className="group relative px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm"
            aria-label={item.title}
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-6 py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-bold rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-transform"
      >
        Skip to main content
      </a>
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
            <Link
              href="/"
              className="relative z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm"
              aria-label="Berztech Home"
            >
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
              <AuthButton />
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
              id="mobile-menu"
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
                          "group flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset",
                          pathname === item.href ? "text-neutral-900" : "text-neutral-500"
                        )}
                        aria-label={item.title}
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
                    className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                    aria-label="Start Your Project"
                  >
                    Start Your Project
                    <span>→</span>
                  </Link>
                </motion.div>

                {/* Auth section in mobile menu */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <AuthButton mobile />
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