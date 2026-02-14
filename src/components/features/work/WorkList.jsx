"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { colorSchemes } from "@/data/projects";
import { typography, spacing } from "@/lib/design-tokens";

function ProjectCard({ project, index }) {
    const [isHovered, setIsHovered] = useState(false);
    const colors = colorSchemes[project.color] || colorSchemes.neutral;

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group"
        >
            <Link href={`/work/${project.id}`}>
                <CornerFrame
                    className={`
            relative overflow-hidden bg-white border-neutral-200 
            transition-all duration-500 h-full flex flex-col
            ${isHovered ? 'border-neutral-400 shadow-xl' : 'shadow-sm'}
          `}
                    bracketClassName="w-4 h-4 border-neutral-300 group-hover:border-neutral-500 transition-colors duration-300"
                >
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                        <motion.div
                            animate={{ scale: isHovered ? 1.05 : 1 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute inset-0"
                        >
                            {project.image && (
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent"
                        />

                        <div className="absolute top-3 left-3">
                            <span className={`
                px-2 py-1 ${typography.fontSize.tiny} ${typography.fontFamily.mono} uppercase ${typography.tracking.wider}
                bg-white/90 backdrop-blur-sm border ${colors.border} ${colors.text}
              `}>
                                {project.category}
                            </span>
                        </div>

                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 text-[10px] font-jetbrains-mono text-neutral-500 bg-white/90 backdrop-blur-sm border border-neutral-200">
                                {project.year}
                            </span>
                        </div>

                        <AnimatePresence>
                            {isHovered && project.stats && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute bottom-3 left-3 right-3 flex gap-3"
                                >
                                    {Object.entries(project.stats).slice(0, 3).map(([key, value], i) => (
                                        <div key={key} className="bg-white/95 backdrop-blur-sm px-3 py-2 border border-neutral-200">
                                            <div className="font-space-grotesk text-sm font-medium text-neutral-900">{value}</div>
                                            <div className="text-[9px] font-jetbrains-mono uppercase tracking-wider text-neutral-500">{key}</div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-600">
                                {project.client}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span className="text-[10px] font-jetbrains-mono text-neutral-600">{project.year}</span>
                        </div>

                        <h3 className={`${typography.fontFamily.sans} ${typography.fontSize.lg} sm:${typography.fontSize.xl} ${typography.fontWeight.medium} text-neutral-900 ${typography.tracking.tight} mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2`}>
                            {project.title}
                        </h3>

                        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 mb-4 flex-1">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                            {project.services?.map((service, i) => (
                                <motion.span
                                    key={service}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="px-2 py-1 text-[9px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 bg-neutral-50 border border-neutral-200"
                                >
                                    {service}
                                </motion.span>
                            ))}
                        </div>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${colors.bg}`}
                        />
                    </div>
                </CornerFrame>
            </Link>
        </motion.article>
    );
}

function FeaturedProject({ project }) {
    const [isHovered, setIsHovered] = useState(false);
    const colors = colorSchemes[project.color] || colorSchemes.neutral;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 sm:mb-16"
        >
            <Link href={`/work/${project.id}`} className="group block">
                <CornerFrame
                    className={`
            relative overflow-hidden bg-neutral-50 border-neutral-200
            transition-all duration-500
            ${isHovered ? 'border-neutral-400 shadow-2xl' : 'shadow-lg'}
          `}
                    bracketClassName="w-5 h-5 sm:w-6 sm:h-6 border-neutral-300 group-hover:border-neutral-500 transition-colors"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-neutral-100">
                            <motion.div
                                animate={{ scale: isHovered ? 1.05 : 1 }}
                                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute inset-0"
                            >
                                {project.image && (
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                    />
                                )}
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-50/20 lg:to-neutral-50/50" />

                            <div className="absolute top-4 left-4">
                                <span className={`
                  px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider font-semibold
                  ${colors.bgLight} ${colors.text} border ${colors.border}
                `}>
                                    Featured Project
                                </span>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-600">
                                    {project.client}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                                <span className="text-[11px] font-jetbrains-mono text-neutral-600">{project.year}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                                <span className={`text-[11px] font-jetbrains-mono uppercase tracking-wider ${colors.text}`}>
                                    {project.category}
                                </span>
                            </div>

                            <h2 className={`${typography.fontFamily.sans} ${typography.fontSize["2xl"]} sm:${typography.fontSize["3xl"]} lg:${typography.fontSize["4xl"]} ${typography.fontWeight.medium} text-neutral-900 ${typography.tracking.tight} mb-4 leading-tight`}>
                                {project.title}
                            </h2>

                            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-6 max-w-lg">
                                {project.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {project.stats && Object.entries(project.stats).map(([key, value], i) => (
                                    <div key={key} className={`p-3 border ${colors.border} ${colors.bgLight}`}>
                                        <div className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900">{value}</div>
                                        <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 mt-1">{key}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.services?.map((service) => (
                                    <span key={service} className="px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 bg-white border border-neutral-200">
                                        {service}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 text-sm font-jetbrains-mono uppercase tracking-widest text-neutral-900 group-hover:text-neutral-600 transition-colors">
                                <span>View Case Study</span>
                                <motion.span
                                    animate={{ x: isHovered ? [0, 4, 0] : 0 }}
                                    transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                                >
                                    →
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${colors.bg}`}
                    />
                </CornerFrame>
            </Link>
        </motion.div>
    );
}

export default function WorkList({ initialProjects = [], filters = [] }) {
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredProjects = activeFilter === "All"
        ? initialProjects
        : initialProjects.filter(p => p.category === activeFilter);

    const featuredProjects = initialProjects.filter(p => p.featured);
    const regularProjects = filteredProjects.filter(p => !p.featured);

    return (
        <div className="relative z-10">
            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16 pt-8 border-t border-neutral-100"
            >
                {[
                    { value: initialProjects.length || "0", label: "Projects Delivered" },
                    { value: new Set(initialProjects.map(p => p.category)).size || "0", label: "Industries Served" },
                    { value: "100%", label: "Client Retention" },
                    { value: "5.0", label: "Avg. Rating" }
                ].map((stat, i) => (
                    <div key={stat.label} className="text-center p-4 bg-neutral-50 border border-neutral-100">
                        <div className={`${typography.fontFamily.sans} ${typography.fontSize["2xl"]} sm:${typography.fontSize["3xl"]} ${typography.fontWeight.medium} text-neutral-900`}>{stat.value}</div>
                        <div className={`${typography.fontSize.tiny} ${typography.fontFamily.mono} uppercase ${typography.tracking.wider} text-neutral-500 mt-1`}>{stat.label}</div>
                    </div>
                ))}
            </motion.div>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
                <div className="mb-16 sm:mb-20">
                    <div className="flex items-center gap-2 mb-6 sm:mb-8">
                        <div className="h-px w-4 bg-neutral-300" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
                            Featured Work
                        </span>
                    </div>
                    {featuredProjects.map((project) => (
                        <FeaturedProject key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-8 sm:mb-10">
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <motion.button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                px-4 py-2 text-[11px] ${typography.fontFamily.mono} uppercase ${typography.tracking.wider} transition-all duration-300 border
                ${activeFilter === filter
                                    ? 'bg-neutral-900 text-white border-neutral-900'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                                }
              `}
                        >
                            {filter}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {regularProjects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </AnimatePresence>
            </motion.div>

            {regularProjects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <p className="text-neutral-500 font-jetbrains-mono text-sm">No projects found in this category.</p>
                </motion.div>
            )}

            {/* Bottom CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 sm:mt-20 pt-8 border-t border-neutral-100 text-center"
            >
                <p className="text-neutral-600 mb-4">Have a project in mind?</p>
                <Link
                    href="/contact"
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white ${typography.fontFamily.mono} ${typography.fontSize.xs} uppercase ${typography.tracking.widest} ${typography.fontWeight.semibold} hover:bg-neutral-800 transition-colors`}
                >
                    Start a Conversation
                    <span>→</span>
                </Link>
            </motion.div>
        </div>
    );
}
