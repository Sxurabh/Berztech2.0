"use client";
import React from "react";

const HeroBackground = ({ enableInteraction, shouldReduceMotion }) => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* The global GridBackground from RootLayout provides the overall interactive grid */}
        </div>
    );
};

export default HeroBackground;
