"use client";
import React from "react";
import { motion } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { serviceColors, typography } from "@/lib/design-tokens";
import { FiSmartphone } from "react-icons/fi";

const EcosystemVisual = ({ shouldReduceMotion }) => {
    return (
        <div className="relative w-full max-w-[650px] aspect-square flex items-center justify-center">

            {/* Background Ambience - Reduced blur on mobile */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 blur-[60px] sm:blur-[80px] rounded-full -z-10" style={{ contain: "paint" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-purple-500/10 blur-[40px] sm:blur-[60px] rounded-full -z-10" style={{ contain: "paint" }} />

            {/* --- 1. GROWTH / MARKETING (Top Right - Pushed Out) --- */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.8, duration: 0.6 }}
                className="absolute top-[5%] right-[0%] z-30"
            >
                <motion.div
                    animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <CornerFrame
                        className="bg-white/90 backdrop-blur-md border-neutral-200 shadow-xl p-3 min-w-[150px]"
                        bracketClassName="w-2 h-2 border-neutral-400"
                    >
                        <div className={`flex items-center gap-2 mb-2 border-b pb-2 ${serviceColors.emerald.border}`}>
                            <span className="relative flex h-1.5 w-1.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serviceColors.emerald.bg}`}></span>
                                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${serviceColors.emerald.bg}`}></span>
                            </span>
                            <span className={`${typography.fontSize.tiny} ${typography.fontFamily.mono} uppercase ${typography.tracking.wider} ${serviceColors.emerald.text}`}>Growth</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className={`text-xl font-space-grotesk font-bold ${serviceColors.emerald.textDark}`}>+124%</div>
                                <div className={`${typography.fontSize.tiny} ${serviceColors.emerald.text}`}>ROI</div>
                            </div>
                            <div className="h-6 flex items-end gap-0.5">
                                {[40, 60, 45, 70, 50, 80, 100].map((h, i) => (
                                    <div key={i} className={`w-1.5 rounded-sm overflow-hidden h-full flex items-end ${serviceColors.emerald.bgLight}`}>
                                        <motion.div
                                            className={`w-full rounded-sm ${serviceColors.emerald.bg}`}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ duration: 1, delay: 1.2 + (i * 0.1) }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CornerFrame>
                </motion.div>
            </motion.div>

            {/* --- 2. MOBILE APP (Top Left - Pushed Out) --- */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: shouldReduceMotion ? 0 : 1.0, duration: 0.6 }}
                className="absolute top-[12%] left-[-5%] z-20"
            >
                <motion.div
                    animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <CornerFrame
                        className="bg-neutral-900 text-white shadow-2xl p-4 w-[170px]"
                        bracketClassName="w-2 h-2 border-neutral-600"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className={`${typography.fontSize.tiny} ${typography.fontFamily.mono} text-white uppercase`}>iOS / Android</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${serviceColors.purple.bg}`} />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${serviceColors.purple.bgLight} ${serviceColors.purple.border}`}>
                                <FiSmartphone className={`w-4 h-4 ${serviceColors.purple.text}`} />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-white">Berztech</div>
                                <div className="text-[8px] text-white">Deployed</div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-purple-200/60">
                                <span>Rating</span>
                                <span>5.0 ★</span>
                            </div>
                            <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <div className={`h-full w-full ${serviceColors.purple.bg}`} />
                            </div>
                        </div>
                    </CornerFrame>
                </motion.div>
            </motion.div>

            {/* --- 3. BRANDING / DESIGN (Bottom Right - Pushed Out) --- */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: shouldReduceMotion ? 0 : 1.2, duration: 0.6 }}
                className="absolute bottom-[8%] right-[5%] z-30"
            >
                <motion.div
                    animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <CornerFrame
                        className="bg-white/95 backdrop-blur-md border-neutral-200 shadow-xl p-3 min-w-[140px]"
                        bracketClassName="w-2 h-2 border-purple-500"
                    >
                        <div className="text-[9px] font-jetbrains-mono text-rose-500 uppercase tracking-wider mb-2">Identity</div>
                        <div className="flex gap-2 justify-between">
                            {[
                                { bg: 'bg-neutral-900', label: 'Aa' },
                                { bg: serviceColors.blue.bg, label: '#' },
                                { bg: serviceColors.purple.bg, label: '#' },
                                { bg: serviceColors.rose.bg, label: '#' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-6 h-6 rounded-md shadow-sm ${item.bg} flex items-center justify-center text-[8px] text-white`}>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CornerFrame>
                </motion.div>
            </motion.div>

            {/* --- 4. WEB DEVELOPMENT (Center Anchor) --- */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.5, duration: 0.6 }}
                className="relative z-10 w-[340px]"
            >
                <CornerFrame
                    className="bg-white/80 backdrop-blur-xl border-neutral-200 shadow-2xl p-0 overflow-hidden"
                    bracketClassName="w-3 h-3 border-neutral-900"
                >
                    {/* Browser Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-white/50">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/20 border border-red-400/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20 border border-amber-400/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20 border border-emerald-400/30" />
                        </div>
                        <div className="flex-1 bg-neutral-100/50 rounded-md text-[9px] text-neutral-600 py-1.5 px-3 text-center font-jetbrains-mono">
                            berztech.com/build
                        </div>
                    </div>

                    {/* Web Content Area */}
                    <div className="p-5 space-y-4">
                        {/* Mock Hero */}
                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-neutral-100 rounded-lg shrink-0 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-200 to-white" />
                                {!shouldReduceMotion && (
                                    <motion.div
                                        className="absolute inset-0 bg-neutral-900/5"
                                        animate={{ opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </div>
                            <div className="space-y-2 flex-1 pt-1">
                                <div className="h-2.5 w-3/4 bg-neutral-200 rounded-full" />
                                <div className="h-2 w-full bg-neutral-100 rounded-full" />
                                <div className="h-2 w-5/6 bg-neutral-100 rounded-full" />

                                <div className="flex gap-2 mt-3">
                                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-[9px] font-medium rounded">React</span>
                                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-[9px] font-medium rounded">Next.js</span>
                                </div>
                            </div>
                        </div>

                        {/* Code Block */}
                        <div className="bg-neutral-950 rounded-lg p-3 font-jetbrains-mono text-[9px] leading-relaxed text-neutral-400 relative group">
                            <div className="absolute top-3 right-3 flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                            </div>
                            <div><span className="text-purple-400">export default</span> <span className="text-purple-400">function</span> <span className="text-blue-400">App</span>() {'{'}</div>
                            <div className="pl-3"><span className="text-purple-400">return</span> (</div>
                            <div className="pl-6 text-neutral-400">{'<'}<span className="text-yellow-400">Performance</span> <span className="text-blue-300">mode</span>=<span className="text-emerald-400">"fast"</span> {'/>'}</div>
                            <div className="pl-3">);</div>
                            <div>{'}'}</div>
                        </div>
                    </div>
                </CornerFrame>
            </motion.div>
        </div>
    );
};

export default EcosystemVisual;
