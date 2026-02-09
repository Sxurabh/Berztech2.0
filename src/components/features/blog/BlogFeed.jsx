"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import FeaturedPost from "./FeaturedPost";
import PostCard from "./PostCard";
import { categories, posts } from "@/data/blogPosts";

export default function BlogFeed() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(p => p.category === activeCategory);
    
  const featuredPost = posts.find(p => p.featured);
  // If active category doesn't contain the featured post, we just show regular posts
  // But wait, the original logic was:
  // const regularPosts = filteredPosts.filter(p => !p.featured);
  // So if activeCategory is "All", regularPosts excludes featured.
  // If activeCategory is "Engineering" (and featured IS Engineering), regularPosts excludes featured.
  // If activeCategory is "Design" (and featured IS Engineering), filteredPosts is Design posts. Featured is NOT in filteredPosts. regularPosts = filteredPosts.
  
  const regularPosts = filteredPosts.filter(p => !p.featured);

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

      {/* Featured Post */}
      {activeCategory === "All" && featuredPost && (
        <FeaturedPost post={featuredPost} />
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {regularPosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </>
  );
}
