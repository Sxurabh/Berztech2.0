"use client";
import React from "react";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { CornerFrame } from "@/components/ui/CornerFrame";
import TabletEcosystemPreview from "./TabletEcosystemPreview";
import MobileServiceCards from "./MobileServiceCards";

function TextReveal({ children, delay = 0, className }) {
    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
            className={clsx("overflow-hidden", className)}
        >
            {children}
        </motion.div>
    );
}

// --- Magnetic button ---
function MagneticButton({ children, href, variant = "primary", className, coarse }) {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    const variants = {
        primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800",
        secondary: "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
    };

    return (
        <Link
            href={href}
            className={className}
            onMouseMove={(e) => {
                if (coarse) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.1;
                mx.set(x);
                my.set(y);
            }}
            onMouseLeave={() => {
                mx.set(0);
                my.set(0);
            }}
        >
            <motion.div
                style={{ x: mx, y: my }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <CornerFrame
                    className={clsx("inline-block transition-all duration-300", variants[variant])}
                    bracketClassName="w-2.5 h-2.5 sm:w-3 sm:h-3 border-current opacity-30 group-hover:opacity-100 transition-opacity"
                >
                    <span className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
                        {children}
                    </span>
                </CornerFrame>
            </motion.div>
        </Link>
    );
}

function StatusBadge({ shouldReduceMotion }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="inline-flex mb-4 sm:mb-6"
        >
            <CornerFrame className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white border-neutral-200 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-jetbrains-mono font-medium uppercase tracking-wider text-neutral-600">
                        Available for Projects
                    </span>
                </div>
            </CornerFrame>
        </motion.div>
    );
}

const HeroContent = ({ isLoaded, shouldReduceMotion, isCoarsePointer }) => {
    return (
        <div className="lg:col-span-7 xl:col-span-6 order-1 lg:order-1">
            {isLoaded && <StatusBadge shouldReduceMotion={shouldReduceMotion} />}

            <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {isLoaded && (
                    <>
                        <h1 className="sr-only">Engineering Digital Excellence</h1>
                        <div aria-hidden="true" className="flex flex-col space-y-1 sm:space-y-2">
                            <TextReveal delay={0.1}>
                                <span className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-neutral-950 leading-[0.95] block">
                                    Engineering
                                </span>
                            </TextReveal>
                            <TextReveal delay={0.2}>
                                <span className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight leading-[0.95] text-neutral-500 block">
                                    Digital
                                </span>
                            </TextReveal>
                            <TextReveal delay={0.3}>
                                <span className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-neutral-950 leading-[0.95] relative inline-block">
                                    Excellence
                                    {!shouldReduceMotion && (
                                        <motion.span
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                            className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 bg-emerald-100 origin-left -z-10"
                                        />
                                    )}
                                </span>
                            </TextReveal>
                        </div>
                    </>
                )}
            </div>

            {isLoaded && (
                <>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-sm sm:text-base lg:text-lg text-neutral-600 leading-relaxed max-w-lg mb-6 sm:mb-8"
                    >
                        We are a boutique engineering studio architecting high-performance
                        web applications for the next generation of digital leaders.
                        No templates, just pure code.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                    >
                        <MagneticButton href="/contact" variant="primary" className="group w-full sm:w-auto justify-center" coarse={isCoarsePointer}>
                            <span>Start your project</span>
                            {!shouldReduceMotion && (
                                <motion.span
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    →
                                </motion.span>
                            )}
                        </MagneticButton>

                        <MagneticButton href="/process" variant="secondary" className="group w-full sm:w-auto justify-center" coarse={isCoarsePointer}>
                            Explore our process
                        </MagneticButton>
                    </motion.div>

                    {/* Tablet Ecosystem Preview - Visible only on md and below lg */}
                    <TabletEcosystemPreview shouldReduceMotion={shouldReduceMotion} isLoaded={isLoaded} />

                    {/* Mobile/Tablet Service Cards - Visible only on md and below */}
                    <MobileServiceCards shouldReduceMotion={shouldReduceMotion} isLoaded={isLoaded} />
                </>
            )}
        </div>
    );
};

export default HeroContent;
