"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import clsx from "clsx";
import TrustBar from "../TrustBar";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroVisuals from "./HeroVisuals";

// --- MAIN HERO COMPONENT ---
export default function Hero() {
    const containerRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
    const inView = useInView(containerRef, { margin: "-20%" });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const springY = useSpring(y, { stiffness: 100, damping: 30 });

    // Defer animation initialization to after hydration
    useEffect(() => {
        // Small delay to allow React to commit DOM
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(pointer: coarse)");
        const update = () => setIsCoarsePointer(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // Detect prefers-reduced-motion
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setShouldReduceMotion(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{ minHeight: "auto" }}
        >
            <HeroBackground enableInteraction={!isCoarsePointer && inView} shouldReduceMotion={shouldReduceMotion} />

            <motion.div
                style={{ y: springY }}
                className="relative z-10 w-full flex flex-col"
            >
                <div className={clsx(
                    "flex flex-col justify-center",
                    "py-6 sm:py-8 lg:py-12",
                    "mx-auto max-w-5xl",
                    "w-full",
                    "px-4 sm:px-6 lg:px-8"
                )}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                        {/* Left Content */}
                        <HeroContent
                            isLoaded={isLoaded}
                            shouldReduceMotion={shouldReduceMotion}
                            isCoarsePointer={isCoarsePointer}
                        />

                        {/* Visual: Desktop only (lg and up) to prevent mobile lag */}
                        <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 order-2 lg:order-2 items-center justify-center relative">
                            {/* Scaling wrapper */}
                            {isLoaded && (
                                <div className="lg:scale-100 origin-center w-full flex justify-center lg:my-0">
                                    <HeroVisuals shouldReduceMotion={shouldReduceMotion} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4 sm:mt-6">
                    <TrustBar />
                </div>
            </motion.div>
        </section>
    );
}
