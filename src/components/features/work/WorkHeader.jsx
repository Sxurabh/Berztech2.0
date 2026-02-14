"use client";

import { motion } from "framer-motion";
import { typography, spacing } from "@/lib/design-tokens";

export default function WorkHeader() {
    return (
        <section className={`relative z-10 ${spacing.section.paddingSm}`}>
            <div className={`relative z-10 ${spacing.container.wrapper}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-px w-4 bg-neutral-300" />
                        <span className={`${typography.fontSize.xs} ${typography.fontFamily.mono} uppercase ${typography.tracking.widest} text-neutral-600`}>
                            Our Work
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <h1 className={`${typography.fontFamily.sans} ${typography.fontSize["3xl"]} sm:${typography.fontSize["4xl"]} lg:${typography.fontSize["5xl"]} ${typography.fontWeight.medium} text-neutral-900 ${typography.tracking.tight} leading-tight`}>
                            Proven solutions for<br />
                            <span className="text-neutral-500">real-world problems</span>
                        </h1>
                        <p className={`${typography.fontSize.sm} sm:${typography.fontSize.base} text-neutral-600 leading-relaxed max-w-sm`}>
                            We partner with ambitious companies to build digital products that matter.
                            Each project is a testament to our commitment to engineering excellence.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
