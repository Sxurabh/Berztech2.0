// src/components/ui/AnimatedCounter.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Animated counter that counts up from 0 to value when the component comes into view.
 * 
 * @param {number} value - The target value to count to
 * @param {string} suffix - Optional suffix to append (e.g., "+", "%")
 * @param {string} prefix - Optional prefix to prepend (e.g., "$")
 * @param {number} duration - Animation duration in ms (default: 1500)
 * @param {string} className - Additional classes for the wrapper span
 */
export default function AnimatedCounter({
    value,
    suffix = "",
    prefix = "",
    duration = 1500,
    className = ""
}) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10px" });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!inView || hasAnimated.current) return;
        hasAnimated.current = true;

        let start = 0;
        let animationFrameId;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            }
        };
        animationFrameId = requestAnimationFrame(step);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [inView, value, duration]);

    return (
        <span ref={ref} className={`tabular-nums ${className}`}>
            <span className="sr-only">{prefix}{value}{suffix}</span>
            <span aria-hidden="true">
                {prefix}{count}{suffix}
            </span>
        </span>
    );
}
