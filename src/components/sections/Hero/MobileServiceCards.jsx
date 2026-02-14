"use client";
import React from "react";
import { motion } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { serviceColors } from "@/lib/design-tokens";
import { serviceCategories } from "@/data/marketing";

const MobileServiceCards = ({ shouldReduceMotion, isLoaded }) => {
    const services = serviceCategories;

    return (
        <div className="grid grid-cols-1 gap-3 md:hidden my-6 sm:my-8">
            {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                    <motion.div
                        key={service.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.4 + (idx * 0.1) }}
                    >
                        <CornerFrame
                            className="bg-white/50 backdrop-blur-sm border-neutral-200 shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
                            bracketClassName="w-2 h-2 border-neutral-400"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`text-2xl flex-shrink-0 mt-0.5 ${serviceColors[service.color].text}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-space-grotesk font-semibold text-neutral-900 mb-1">
                                        {service.title}
                                    </h3>
                                    <p className="text-[12px] text-neutral-600 leading-tight mb-2">
                                        {service.description}
                                    </p>
                                    <p className="text-[11px] font-jetbrains-mono text-neutral-500 uppercase tracking-wider">
                                        {service.metric}
                                    </p>
                                </div>
                            </div>
                        </CornerFrame>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default MobileServiceCards;
