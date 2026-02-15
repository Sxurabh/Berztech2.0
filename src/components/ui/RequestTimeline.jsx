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
            <div className="flex items-center gap-0.5">
                {STAGES.map((stage, index) => {
                    const isCompleted = index < normalizedIndex;
                    const isCurrent = index === normalizedIndex;
                    return (
                        <motion.button
                            key={stage.id}
                            type="button"
                            onClick={() => isClickable && onStageChange(stage.id)}
                            className={`
                                relative flex flex-col items-center flex-1 min-w-0 py-1.5 px-0.5
                                ${isClickable ? "cursor-pointer" : "cursor-default"}
                            `}
                            whileHover={isClickable ? { scale: 1.02 } : {}}
                        >
                            <div
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1
                                    border-2 transition-colors
                                    ${isCompleted ? "bg-neutral-900 border-neutral-900 text-white" : ""}
                                    ${isCurrent ? "bg-white border-neutral-900 text-neutral-900" : ""}
                                    ${!isCompleted && !isCurrent ? "bg-white border-neutral-200 text-neutral-400" : ""}
                                `}
                            >
                                {isCompleted ? (
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-[8px] font-jetbrains-mono font-bold">{index + 1}</span>
                                )}
                            </div>
                            <span className={`text-[8px] font-jetbrains-mono uppercase truncate w-full text-center ${isCurrent ? "text-neutral-900 font-medium" : isCompleted ? "text-neutral-600" : "text-neutral-400"}`}>
                                {stage.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Progress line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-neutral-200" />
            <motion.div
                className="absolute left-4 top-4 w-px bg-neutral-900"
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
                            {/* Dot */}
                            <motion.div
                                className={`
                                    relative z-10 w-8 h-8 shrink-0 flex items-center justify-center rounded-full border-2 transition-colors
                                    ${isCompleted ? "bg-neutral-900 border-neutral-900 text-white" : ""}
                                    ${isCurrent ? "bg-white border-neutral-900 text-neutral-900" : ""}
                                    ${!isCompleted && !isCurrent ? "bg-white border-neutral-200 text-neutral-400" : ""}
                                    ${isClickable ? "cursor-pointer hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900" : ""}
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
                                whileHover={isClickable ? { scale: 1.05 } : {}}
                                whileTap={isClickable ? { scale: 0.98 } : {}}
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
