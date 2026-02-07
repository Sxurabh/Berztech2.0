// src/app/work/[slug]/page.jsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CornerFrame } from "@/components/CornerFrame";
import Container from "@/components/Container";

// This would typically come from a CMS or API
const projectsData = {
  "family-fund": {
    client: "Family Fund",
    title: "Skip the bank, borrow from those you trust",
    description: "A crowdfunding platform enabling friends and family to lend without traditional banking friction.",
    longDescription: "Family Fund approached us with a unique challenge: formalize personal lending between friends and family while maintaining the trust and flexibility that makes these arrangements work. We built a comprehensive platform handling $2M+ monthly volume with bank-level security.",
    image: "/images/laptop.jpg",
    gallery: ["/images/laptop.jpg", "/images/meeting.jpg", "/images/whiteboard.jpg"],
    category: "Fintech",
    year: "2023",
    duration: "14 weeks",
    team: ["2 Engineers", "1 Designer", "1 PM"],
    services: ["Strategy", "UX/UI Design", "Web Development", "Payment Integration"],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Stripe Connect", "Plaid"],
    stats: [
      { label: "Active Users", value: "1.5M" },
      { label: "Monthly Volume", value: "$2M+" },
      { label: "App Store Rating", value: "4.9" },
      { label: "Default Rate", value: "<2%" }
    ],
    color: "blue",
    testimonial: {
      quote: "They didn't just build our platform—they redefined how we think about financial products. The engineering quality is exceptional.",
      author: "Debra Fiscal",
      role: "CEO, Family Fund"
    },
    results: [
      "Processed $24M in loans in first year",
      "99.99% uptime with zero security incidents",
      "Featured in TechCrunch and Forbes",
      "Series A funding secured based on MVP"
    ]
  }
  // Add more projects as needed
};

const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200" }
};

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.slug;
  const project = projectsData[slug] || projectsData["family-fund"];
  const colors = colorSchemes[project.color];
  const [activeImage, setActiveImage] = useState(0);

  return (
    <main className="w-full bg-white relative">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-8 text-sm text-neutral-500"
          >
            <Link href="/work" className="hover:text-neutral-900 transition-colors">Work</Link>
            <span>/</span>
            <span className="text-neutral-900">{project.client}</span>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                {project.category}
              </span>
              <span className="text-[10px] font-jetbrains-mono text-neutral-400">{project.year}</span>
            </div>
            
            <h1 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-tight mb-6">
              {project.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed">
              {project.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Image */}
      <section className="mb-12 sm:mb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
                  src={project.gallery[activeImage]}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CornerFrame>
            
            {/* Thumbnail Navigation */}
            {project.gallery.length > 1 && (
              <div className="flex gap-2 mt-4">
                {project.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`
                      relative w-20 h-14 overflow-hidden border-2 transition-colors
                      ${activeImage === i ? `border-neutral-900` : 'border-neutral-200 hover:border-neutral-400'}
                    `}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Project Details Grid */}
      <section className="py-12 sm:py-16 border-y border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: "Duration", value: project.duration },
              { label: "Team", value: project.team.join(", ") },
              { label: "Year", value: project.year },
              { label: "Category", value: project.category }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-1">
                  {item.label}
                </div>
                <div className="font-space-grotesk text-base sm:text-lg font-medium text-neutral-900">
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 mb-6">
                  The Challenge
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-8 text-lg">
                  {project.longDescription}
                </p>

                <h3 className="font-space-grotesk text-xl font-medium text-neutral-900 mb-4">
                  Key Results
                </h3>
                <ul className="space-y-3 mb-8">
                  {project.results.map((result, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className={`w-1.5 h-1.5 mt-2 ${colors.bg} shrink-0`} />
                      <span className="text-neutral-700">{result}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
              >
                {project.stats.map((stat, i) => (
                  <div key={stat.label} className={`p-4 ${colors.bgLight} border ${colors.border}`}>
                    <div className="font-space-grotesk text-2xl font-medium text-neutral-900">{stat.value}</div>
                    <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Services */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <CornerFrame className="bg-neutral-50 border-neutral-200 p-4" bracketClassName="w-3 h-3 border-neutral-300">
                  <h4 className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Services
                  </h4>
                  <ul className="space-y-2">
                    {project.services.map((service) => (
                      <li key={service} className="text-sm text-neutral-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-neutral-400" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </CornerFrame>
              </motion.div>

              {/* Technologies */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <CornerFrame className="bg-neutral-50 border-neutral-200 p-4" bracketClassName="w-3 h-3 border-neutral-300">
                  <h4 className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-[10px] font-jetbrains-mono bg-white border border-neutral-200 text-neutral-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CornerFrame>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  href="/contact"
                  className="block w-full text-center px-5 py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Start Similar Project
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 sm:py-24 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="text-4xl text-neutral-300 mb-6">"</div>
            <blockquote className="font-space-grotesk text-xl sm:text-2xl text-neutral-900 leading-relaxed mb-6">
              {project.testimonial.quote}
            </blockquote>
            <div className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">{project.testimonial.author}</span>
              <span className="mx-2">·</span>
              <span>{project.testimonial.role}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Project */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <span>←</span>
              <span>All Projects</span>
            </Link>
            
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
            >
              Start Your Project
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}