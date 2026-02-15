"use client";
import React from "react";
import { motion } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { serviceColors } from "@/lib/design-tokens";
import { serviceCategories } from "@/data/marketing";

const TabletEcosystemPreview = ({ shouldReduceMotion, isLoaded }) => {
    const services = serviceCategories;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.5 }}
            className="hidden md:block lg:hidden w-full my-6 sm:my-8"
        >
            <div className="space-y-4">
                {/* Featured Card - Full Width */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={isLoaded ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                    transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.5 }}
                >
                    <CornerFrame
                        className="bg-white/50 backdrop-blur-sm border-neutral-200 shadow-lg p-6"
                        bracketClassName="w-2 h-2 border-neutral-400"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`text-3xl flex-shrink-0 ${serviceColors[services[0].color].text}`}>
                                {(() => {
                                    const Icon = services[0].icon;
                                    return <Icon className="w-6 h-6" />;
                                })()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-space-grotesk font-semibold text-neutral-900">
                                        {services[0].title}
                                    </h3>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-600 mb-3">{services[0].subtitle}</p>
                                <p className="text-xs font-jetbrains-mono text-neutral-500 uppercase tracking-wider">
                                    {services[0].description}
                                </p>
                            </div>
                        </div>
                    </CornerFrame>
                </motion.div>

                {/* Three Cards Below - Grid Layout */}
                <div className="grid grid-cols-3 gap-4">
                    {services.slice(1).map((service, idx) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={service.title}
                                initial={{ y: 10, opacity: 0 }}
                                animate={isLoaded ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.6 + (idx * 0.1) }}
                            >
                                <CornerFrame
                                    className="bg-white/50 backdrop-blur-sm border-neutral-200 shadow-lg p-4 h-full"
                                    bracketClassName="w-2 h-2 border-neutral-400"
                                >
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className={`text-2xl ${serviceColors[service.color].text}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-xs font-space-grotesk font-semibold text-neutral-900">
                                            {service.title}
                                        </h4>
                                        <p className="text-[11px] text-neutral-600 leading-tight">
                                            {service.subtitle}
                                        </p>
                                        <div className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-wider pt-1">
                                            {service.items.join(" • ")}
                                        </div>
                                    </div>
                                </CornerFrame>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default TabletEcosystemPreview;
