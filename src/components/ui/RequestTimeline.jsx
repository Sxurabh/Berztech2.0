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
            <div className="w-full">
                <div className="flex items-center w-full max-w-sm">
                    {STAGES.map((stage, index) => {
                        const isCompleted = index < normalizedIndex;
                        const isCurrent = index === normalizedIndex;
                        const isLast = index === STAGES.length - 1;

                        return (
                            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                                <motion.button
                                    type="button"
                                    onClick={() => isClickable && onStageChange(stage.id)}
                                    className={`
                                        relative flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-300 shrink-0
                                        ${isClickable ? "cursor-pointer" : "cursor-default"}
                                        ${isCompleted ? "bg-neutral-900 border-neutral-900 text-white" : ""}
                                        ${isCurrent ? "bg-white border-neutral-900 text-neutral-900 shadow-sm" : ""}
                                        ${!isCompleted && !isCurrent ? "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:bg-neutral-50" : ""}
                                    `}
                                    whileHover={isClickable && !isCurrent ? { scale: 1.1 } : {}}
                                    whileTap={isClickable ? { scale: 0.95 } : {}}
                                >
                                    {isCompleted ? (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : isCurrent ? (
                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                                    ) : null}
                                </motion.button>

                                {/* Connecting Line */}
                                {!isLast && (
                                    <div className={`
                                        h-[1px] w-full transition-colors duration-300 mx-1
                                        ${isCompleted ? "bg-neutral-900" : "bg-neutral-200"}
                                    `} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Status text display below the diagram */}
                <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-space-grotesk font-bold text-neutral-900 uppercase tracking-widest">
                        {STAGES[normalizedIndex]?.label}
                    </span>
                    <span className="text-[9px] font-jetbrains-mono text-neutral-500">
                        {STAGES[normalizedIndex]?.desc}
                    </span>
                </div>
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
