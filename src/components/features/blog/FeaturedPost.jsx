"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { colorSchemes } from "@/data/blogPosts";

export default function FeaturedPost({ post }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorSchemes[post.color];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-12 sm:mb-16"
    >
      <Link 
        href={`/blog/${post.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-4 rounded-sm"
      >
        <CornerFrame
          className={`
            relative overflow-hidden bg-white border-neutral-200 transition-all duration-500
            ${isHovered ? 'border-neutral-400 shadow-xl' : 'shadow-lg'}
          `}
          bracketClassName="w-5 h-5 sm:w-6 sm:h-6 border-neutral-300 group-hover:border-neutral-500 transition-colors"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-neutral-100">
              <motion.div
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 lg:to-white/50" />
              
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider font-semibold bg-white ${colors.text} border ${colors.border}`}>
                  Featured
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                  {post.category}
                </span>
                <span className="text-[10px] font-jetbrains-mono text-neutral-600">{post.readTime}</span>
              </div>

              <h2 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight mb-4 leading-tight group-hover:text-neutral-700 transition-colors">
                {post.title}
              </h2>

              <p className="text-neutral-600 leading-relaxed mb-6 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center">
                    <span className="font-space-grotesk text-sm font-bold text-neutral-700">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{post.author}</div>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-600">{post.date}</div>
                  </div>
                </div>

                <motion.span
                  animate={{ x: isHovered ? [0, 4, 0] : 0 }}
                  transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                  className="text-neutral-600 group-hover:text-neutral-900 transition-colors"
                >
                  →
                </motion.span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${colors.bg}`}
          />
        </CornerFrame>
      </Link>
    </motion.article>
  );
}
