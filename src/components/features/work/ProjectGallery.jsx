"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default function ProjectGallery({ images = [], title }) {
    const [activeImage, setActiveImage] = useState(0);

    if (!images || images.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <CornerFrame
                className="bg-neutral-100 border-neutral-200 overflow-hidden"
                bracketClassName="w-4 h-4 sm:w-6 sm:h-6 border-neutral-300"
            >
                <div className="relative aspect-[16/9]">
                    <Image
                        src={images[activeImage]}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </CornerFrame>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`
                relative w-20 h-14 overflow-hidden border-2 transition-colors shrink-0
                ${activeImage === i ? `border-neutral-900` : 'border-neutral-200 hover:border-neutral-400'}
              `}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
