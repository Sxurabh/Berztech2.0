"use client";

import { motion } from "framer-motion";

const STAGES = [
    { id: "discover", label: "Discover", desc: "Understanding needs" },
    { id: "define", label: "Define", desc: "Charting the course" },
    { id: "design", label: "Design", desc: "Crafting experience" },
    { id: "develop", label: "Develop", desc: "Building" },
    { id: "deliver", label: "Deliver", desc: "Launch & handoff" },
    { id: "maintain", label: "Maintain", desc: "Ongoing support" },
];

const LEGACY_TO_STAGE = { submitted: "discover", reviewing: "define", in_progress: "develop", completed: "deliver", on_hold: "define" };

export default function RequestTimeline({ currentStage = "discover", interactive, onStageChange, compact }) {
    const resolvedStage = LEGACY_TO_STAGE[currentStage] || currentStage;
    const currentIndex = STAGES.findIndex((s) => s.id === resolvedStage);
    const normalizedIndex = currentIndex >= 0 ? currentIndex : 0; // unknown/legacy -> discover
    const isClickable = interactive && onStageChange;

    if (compact) {
        return (
            <div className="w-full relative group">
                {/* Horizontal scroll container */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mb-2 scrollbar-none sm:scrollbar-thin sm:scrollbar-thumb-neutral-200 sm:scrollbar-track-transparent">
                    {STAGES.map((stage, index) => {
                        const isCompleted = index < normalizedIndex;
                        const isCurrent = index === normalizedIndex;

                        return (
                            <motion.button
                                key={stage.id}
                                type="button"
                                onClick={() => isClickable && onStageChange(stage.id)}
                                className={`
                                    relative flex-shrink-0 flex items-center gap-1.5 py-1 px-2.5 border transition-all duration-300
                                    ${isClickable ? "cursor-pointer" : "cursor-default"}
                                    ${isCompleted ? "bg-neutral-900 border-neutral-900 text-white" : ""}
                                    ${isCurrent ? "bg-white border-neutral-900 text-neutral-900 shadow-[2px_2px_0px_#171717]" : ""}
                                    ${!isCompleted && !isCurrent ? "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 hover:bg-neutral-50" : ""}
                                `}
                                whileHover={isClickable && !isCurrent ? { y: -1 } : {}}
                                whileTap={isClickable ? { scale: 0.98, y: 0 } : {}}
                            >
                                <span className={`text-[10px] font-space-grotesk font-medium uppercase tracking-wider whitespace-nowrap ${isCompleted ? 'opacity-90' : ''}`}>
                                    {stage.label}
                                </span>
                                {isCompleted && (
                                    <svg className="w-3 h-3 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {isCurrent && (
                                    <div className="w-1.5 h-1.5 bg-neutral-900 shrink-0 ml-0.5" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Fade edges to indicate scrollability on mobile */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-50 to-transparent pointer-events-none sm:hidden" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Progress line */}
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-neutral-200" />
            <motion.div
                className="absolute left-3.5 top-4 w-px bg-neutral-900"
                initial={{ height: 0 }}
                animate={{ height: `${(normalizedIndex / (STAGES.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ bottom: "auto" }}
            />

            <div className="space-y-0">
                {STAGES.map((stage, index) => {
                    const isCompleted = index < normalizedIndex;
                    const isCurrent = index === normalizedIndex;
                    const isClickable = interactive && onStageChange;

                    return (
                        <div key={stage.id} className="relative flex items-start gap-4 py-2">
                            {/* Node */}
                            <motion.div
                                className={`
                                    relative z-10 w-7 h-7 shrink-0 flex items-center justify-center border-2 bg-white transition-all duration-300
                                    ${isCompleted ? "bg-neutral-900 border-neutral-900 text-white" : ""}
                                    ${isCurrent ? "border-neutral-900 text-neutral-900 shadow-[2px_2px_0px_#171717]" : ""}
                                    ${!isCompleted && !isCurrent ? "border-neutral-200 text-neutral-400" : ""}
                                    ${isClickable ? "cursor-pointer hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900" : ""}
                                `}
                                onClick={() => isClickable && onStageChange(stage.id)}
                                onKeyDown={(e) => {
                                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        onStageChange(stage.id);
                                    }
                                }}
                                role={isClickable ? "button" : undefined}
                                tabIndex={isClickable ? 0 : undefined}
                                aria-label={`Select ${stage.label} stage`}
                                aria-current={isCurrent ? "step" : undefined}
                                whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                            >
                                {isCompleted ? (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-[10px] font-jetbrains-mono font-bold">{index + 1}</span>
                                )}
                            </motion.div>

                            {/* Label */}
                            <div className="pt-0.5 min-w-0">
                                <div
                                    className={`
                                        font-space-grotesk text-xs font-medium
                                        ${isCurrent ? "text-neutral-900" : ""}
                                        ${isCompleted ? "text-neutral-600" : ""}
                                        ${!isCompleted && !isCurrent ? "text-neutral-400" : ""}
                                    `}
                                >
                                    {stage.label}
                                </div>
                                <div className="text-[10px] font-jetbrains-mono text-neutral-500 truncate">
                                    {stage.desc}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
