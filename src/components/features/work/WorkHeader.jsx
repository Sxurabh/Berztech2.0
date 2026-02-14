"use client";

import { motion } from "framer-motion";

export default function WorkHeader() {
    return (
        <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-8 z-10">
            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-px w-4 bg-neutral-300" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
                            Our Work
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <h1 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-tight">
                            Proven solutions for<br />
                            <span className="text-neutral-500">real-world problems</span>
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-sm">
                            We partner with ambitious companies to build digital products that matter.
                            Each project is a testament to our commitment to engineering excellence.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
