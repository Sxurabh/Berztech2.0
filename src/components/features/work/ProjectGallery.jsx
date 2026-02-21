"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { spacing } from "@/lib/design-tokens";

export default function ProjectGallery({ images = [], title }) {
    const [activeImage, setActiveImage] = useState(0);

    if (!images || images.length === 0) return null;

    // derived safe index
    const displayIndex = (images.length > 0 && activeImage < images.length) ? activeImage : 0;

    const nextImage = () => {
        setActiveImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
        >
            <CornerFrame
                className="bg-neutral-100 border-neutral-200 overflow-hidden"
                bracketClassName="w-4 h-4 sm:w-6 sm:h-6 border-neutral-300"
            >
                <div className="relative aspect-[16/9] bg-neutral-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayIndex}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[displayIndex]}
                                alt={`${title} - Gallery Image ${displayIndex + 1}`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CornerFrame>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        aria-label="Previous image"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${displayIndex === i ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
}
