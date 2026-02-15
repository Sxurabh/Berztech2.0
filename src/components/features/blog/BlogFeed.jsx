"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import FeaturedPost from "./FeaturedPost";
import PostCard from "./PostCard";
export default function BlogFeed({ initialPosts = [], categories = ["All"] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 5;

  // Filter posts
  const filteredPosts = activeCategory === "All"
    ? initialPosts
    : initialPosts.filter(p => p.category === activeCategory);

  // Find featured post (only for 'All' view)
  const featuredPost = activeCategory === "All" ? initialPosts.find(p => p.featured) : null;

  // Exclude featured post from the list if we are showing it separately
  const postsToList = featuredPost
    ? filteredPosts.filter(p => p.id !== featuredPost.id)
    : filteredPosts;

  // Pagination Logic
  const totalPages = Math.ceil(postsToList.length / POSTS_PER_PAGE);
  const paginatedPosts = postsToList.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Reset page on category change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const scrollToTop = () => {
    const feedElement = document.getElementById('blog-feed');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    scrollToTop();
  };

  return (
    <div id="blog-feed" className="scroll-mt-24">
      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-2 mb-12"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
            className={`
              px-4 py-2 text-[10px] sm:text-[11px] font-jetbrains-mono uppercase tracking-widest transition-all duration-300 border rounded-sm
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
              ${activeCategory === category
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
              }
            `}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Featured Post */}
      {featuredPost && (
        <FeaturedPost post={featuredPost} />
      )}

      {/* Posts Grid - "Sleeker" single column or sparse grid for a specialized look? 
          User asked for "sleeker". A single column with wider cards or a 2-col? 
          Let's stick to grid but perhaps with more breathing room or different card style? 
          For now, keeping the grid but ensuring standard spacing.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {paginatedPosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {postsToList.length === 0 && (
        <div className="text-center py-20 text-neutral-500 font-jetbrains-mono text-xs uppercase tracking-widest">
          No posts found in this category.
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mt-16 sm:mt-24"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === i + 1
                    ? "bg-neutral-900 scale-125"
                    : "bg-neutral-200 hover:bg-neutral-400"
                  }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
          >
            Next →
          </button>
        </motion.div>
      )}
    </div>
  );
}
