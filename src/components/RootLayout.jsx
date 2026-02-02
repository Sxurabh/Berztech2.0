"use client";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { motion, MotionConfig, useReducedMotion, AnimatePresence } from "framer-motion";
import Container from "./Container";
import Link from "next/link";
import Button from "./Button";
import clsx from "clsx";
import Offices from "./Offices";
import SocialMedia from "./SocialMedia";
import Footer from "./Footer";
import Image from "next/image";

// Assets
import blackLogo from "../../assets/Logo/blacklogo.png";
import whiteLogo from "../../assets/Logo/WhiteLogo.png";
import compactLogoblack from "../../assets/Logo/CompactLogo-black.png";
import compactLogowhite from "../../assets/Logo/CompactLogo-white.png";

/* --- Minimal Navigation Link --- */
const NavLink = ({ href, children, onClick }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative py-2 font-jetbrains-mono text-sm text-neutral-400 hover:text-neutral-900 transition-colors duration-300"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neutral-900 transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  );
};

/* --- Desktop Navigation --- */
const DesktopNav = () => {
  const links = [
    { href: "/work", label: "Work" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

/* --- Mobile Menu Overlay --- */
const MobileMenu = ({ isOpen, onClose }) => {
  const links = [
    { href: "/work", label: "Work", desc: "Selected projects" },
    { href: "/services", label: "Services", desc: "What we do" },
    { href: "/about", label: "About", desc: "Our studio" },
    { href: "/process", label: "Process", desc: "How we work" },
    { href: "/blog", label: "Blog", desc: "Thoughts & insights" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full p-6 sm:p-8">
              {/* Close Button */}
              <div className="flex items-center justify-between mb-12">
                <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  Menu
                </span>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1">
                <ul className="space-y-1">
                  {links.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="group flex items-center justify-between py-4 border-b border-neutral-100 hover:border-neutral-200 transition-colors"
                      >
                        <div>
                          <span className="font-space-grotesk text-xl font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors block">
                            {link.label}
                          </span>
                          <span className="font-jetbrains-mono text-[10px] text-neutral-400 mt-0.5 block">
                            {link.desc}
                          </span>
                        </div>
                        <svg 
                          className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 transition-colors transform group-hover:translate-x-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Contact CTA */}
              <div className="pt-8 border-t border-neutral-100">
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center justify-between w-full py-4 px-5 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors group"
                >
                  <span className="font-jetbrains-mono text-sm font-medium">Start a Project</span>
                  <svg 
                    className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                
                <div className="mt-6">
                  <p className="font-jetbrains-mono text-[10px] text-neutral-400 mb-3">Follow us</p>
                  <SocialMedia className="flex gap-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* --- Main Header Component --- */
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/90 backdrop-blur-md border-b border-neutral-200/50 py-3 sm:py-4" 
            : "bg-transparent py-4 sm:py-6"
        )}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-10 group">
              <div className="relative overflow-hidden">
                <Image
                  src={blackLogo}
                  alt="Berztech"
                  className="hidden sm:block h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-95"
                  priority
                />
                <Image
                  src={compactLogoblack}
                  alt="Berztech"
                  className="block sm:hidden h-7 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <DesktopNav />
              <div className="h-4 w-px bg-neutral-200" />
              <Button href="/contact" size="sm">
                Contact
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 lg:hidden">
              <Button href="/contact" size="sm" className="hidden sm:flex">
                Contact
              </Button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -mr-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20 lg:h-24" />
    </MotionConfig>
  );
};

/* --- Root Layout --- */
const RootLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;