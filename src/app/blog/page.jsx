// src/app/blog/page.jsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { CornerFrame } from "@/components/CornerFrame";

const categories = ["All", "Engineering", "Design", "Strategy", "Culture"];

const posts = [
  {
    id: 1,
    title: "Why We Chose Next.js for Enterprise Applications",
    excerpt: "A deep dive into our decision-making process and the technical benefits that convinced us to standardize on Next.js for client projects.",
    category: "Engineering",
    author: "Alex Chen",
    date: "Jan 15, 2024",
    readTime: "8 min read",
    image: "/images/laptop.jpg",
    featured: true,
    color: "blue"
  },
  {
    id: 2,
    title: "The Art of Minimalist Interface Design",
    excerpt: "How restraint and intentionality create more powerful user experiences than feature-heavy alternatives.",
    category: "Design",
    author: "Sarah Miller",
    date: "Jan 10, 2024",
    readTime: "6 min read",
    image: "/images/whiteboard.jpg",
    featured: false,
    color: "purple"
  },
  {
    id: 3,
    title: "Building Design Systems That Scale",
    excerpt: "Lessons learned from creating component libraries for fast-growing startups and enterprise teams.",
    category: "Design",
    author: "James Wilson",
    date: "Jan 5, 2024",
    readTime: "10 min read",
    image: "/images/meeting.jpg",
    featured: false,
    color: "emerald"
  },
  {
    id: 4,
    title: "Technical Debt: A Strategic Perspective",
    excerpt: "When to pay it down, when to leverage it, and how to communicate about it with non-technical stakeholders.",
    category: "Strategy",
    author: "Alex Chen",
    date: "Dec 28, 2023",
    readTime: "7 min read",
    image: "/images/laptop.jpg",
    featured: false,
    color: "amber"
  },
  {
    id: 5,
    title: "Remote Collaboration: Our Playbook",
    excerpt: "Tools, rituals, and mindsets that keep our distributed team aligned and productive.",
    category: "Culture",
    author: "Emma Davis",
    date: "Dec 20, 2023",
    readTime: "5 min read",
    image: "/images/meeting.jpg",
    featured: false,
    color: "rose"
  },
  {
    id: 6,
    title: "TypeScript at Scale: Best Practices",
    excerpt: "Advanced patterns and architectural decisions for maintaining type safety in large codebases.",
    category: "Engineering",
    author: "James Wilson",
    date: "Dec 15, 2023",
    readTime: "12 min read",
    image: "/images/whiteboard.jpg",
    featured: false,
    color: "blue"
  }
];

const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", bgLight: "bg-rose-50", border: "border-rose-200" }
};

function FeaturedPost({ post }) {
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
      <Link href={`/blog/${post.id}`}>
        <CornerFrame
          className={`
            relative overflow-hidden bg-white border-neutral-200 transition-all duration-500
            ${isHovered ? 'border-neutral-400 shadow-xl' : 'shadow-lg'}
          `}
          bracketClassName="w-5 h-5 sm:w-6 sm:h-6 border-neutral-300 group-hover:border-neutral-500 transition-colors"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
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
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 lg:to-white/50" />
              
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider font-semibold bg-white ${colors.text} border ${colors.border}`}>
                  Featured
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                  {post.category}
                </span>
                <span className="text-[10px] font-jetbrains-mono text-neutral-400">{post.readTime}</span>
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
                    <span className="font-space-grotesk text-sm font-bold text-neutral-500">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{post.author}</div>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-400">{post.date}</div>
                  </div>
                </div>

                <motion.span
                  animate={{ x: isHovered ? [0, 4, 0] : 0 }}
                  transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                  className="text-neutral-400 group-hover:text-neutral-900 transition-colors"
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

function PostCard({ post, index }) {
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
      <Link href={`/blog/${post.id}`}>
        <CornerFrame
          className={`
            h-full flex flex-col bg-white border-neutral-200 transition-all duration-500
            ${isHovered ? 'border-neutral-400 shadow-lg' : 'shadow-sm'}
          `}
          bracketClassName="w-3 h-3 border-neutral-300 group-hover:border-neutral-500 transition-colors"
        >
          {/* Image */}
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
              />
            </motion.div>
            
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-[9px] font-jetbrains-mono uppercase tracking-wider bg-white/90 backdrop-blur-sm ${colors.text} border ${colors.border}`}>
                {post.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-jetbrains-mono text-neutral-400">
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
                <span className="text-xs font-bold text-neutral-500">{post.author.charAt(0)}</span>
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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(p => p.category === activeCategory);
    
  const featuredPost = posts.find(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  return (
    <main className="w-full bg-white relative">
      <PageIntro
        eyebrow="Blog"
        title="The latest articles and insights"
        centered
      >
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Thoughts on engineering, design, and building digital products that matter. 
          No fluff, just lessons from the trenches.
        </p>
      </PageIntro>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
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
              className={`
                px-4 py-2 text-[11px] font-jetbrains-mono uppercase tracking-wider transition-all duration-300 border
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {regularPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20"
        >
          <CornerFrame className="bg-neutral-950 text-white p-6 sm:p-8 lg:p-10" bracketClassName="w-4 h-4 border-neutral-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div>
                <h3 className="font-space-grotesk text-2xl sm:text-3xl font-medium mb-3">
                  Stay in the loop
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Get our latest articles delivered to your inbox. No spam, just insights on building better digital products.
                </p>
              </div>
              
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 text-white text-sm font-jetbrains-mono placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-white text-neutral-950 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </CornerFrame>
        </motion.div>
      </div>
    </main>
  );
}