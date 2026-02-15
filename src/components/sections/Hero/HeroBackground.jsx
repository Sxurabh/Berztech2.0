"use client";
import React, { useEffect } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const HeroBackground = ({ enableInteraction, shouldReduceMotion }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        if (!enableInteraction || shouldReduceMotion) return;
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [enableInteraction, shouldReduceMotion, mouseX, mouseY]);

    const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.05), transparent 40%)`;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {enableInteraction && !shouldReduceMotion && (
                <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{ background }}
                />
            )}
            <div className="absolute top-1/4 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" style={{ contain: "paint" }} />
            <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/5 rounded-full blur-[40px] sm:blur-[80px] pointer-events-none" style={{ contain: "paint" }} />
        </div>
    );
};

export default HeroBackground;
