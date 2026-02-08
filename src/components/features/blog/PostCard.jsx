"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { colorSchemes } from "@/data/blogPosts";

export default function PostCard({ post, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorSchemes[post.color];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        href={`/blog/${post.id}`}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-4 rounded-sm"
      >
        <CornerFrame
          className={`
            h-full flex flex-col bg-white border-neutral-200 transition-all duration-500
            ${isHovered ? 'border-neutral-400 shadow-lg' : 'shadow-sm'}
          `}
          bracketClassName="w-3 h-3 border-neutral-300 group-hover:border-neutral-500 transition-colors"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
            
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-[9px] font-jetbrains-mono uppercase tracking-wider bg-white/90 backdrop-blur-sm ${colors.text} border ${colors.border}`}>
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-jetbrains-mono text-neutral-600">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 tracking-tight mb-2 line-clamp-2 group-hover:text-neutral-700 transition-colors">
              {post.title}
            </h3>

            <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 mb-4 flex-1">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-neutral-100 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral-700">{post.author.charAt(0)}</span>
              </div>
              <span className="text-xs text-neutral-600">{post.author}</span>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${colors.bg}`}
          />
        </CornerFrame>
      </Link>
    </motion.article>
  );
}
