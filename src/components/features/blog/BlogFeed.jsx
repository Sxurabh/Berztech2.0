"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import FeaturedPost from "./FeaturedPost";
import PostCard from "./PostCard";
export default function BlogFeed({ initialPosts = [], categories = ["All"] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All"
    ? initialPosts
    : initialPosts.filter(p => p.category === activeCategory);

  // Find dedicated featured post, or use the first post if none featured
  const featuredPost = initialPosts.find(p => p.featured);

  // Regular posts exclude the featured one to avoid duplication
  const regularPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  return (
    <>
      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-2 mb-12 sm:mb-16"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
            className={`
              px-4 py-2 text-[11px] font-jetbrains-mono uppercase tracking-wider transition-all duration-300 border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
              ${activeCategory === category
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }
            `}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Featured Post (Only show on 'All' tab or if it matches category) */}
      {/* Logic: If activeCategory is 'All', show featured. If activeCategory matches featured post's category, show it? */}
      {/* Original logic: activeCategory === "All" && featuredPost */}
      {activeCategory === "All" && featuredPost && (
        <FeaturedPost post={featuredPost} />
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {regularPosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {initialPosts.length === 0 && (
        <div className="text-center py-20 text-neutral-500 font-jetbrains-mono text-sm">
          No posts found.
        </div>
      )}
    </>
  );
}
