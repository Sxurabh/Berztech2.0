"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";
import { layoutConfig } from "@/config/layout";
import GridBackground from "@/components/GridBackground";

const phases = [
  {
    id: "discover",
    number: "01",
    title: "Discover",
    subtitle: "Understanding the landscape",
    description: "We immerse ourselves in your business, users, and technical requirements. Through workshops, audits, and research, we map the territory before building.",
    duration: "2-3 weeks",
    color: "blue",
    steps: [
      { title: "Stakeholder Interviews", desc: "Deep-dive sessions with key decision makers" },
      { title: "Technical Audit", desc: "Review existing systems and infrastructure" },
      { title: "User Research", desc: "Interviews, surveys, and behavior analysis" },
      { title: "Competitive Analysis", desc: "Market positioning and opportunity mapping" }
    ],
    deliverables: ["Technical Audit Report", "User Research Findings", "Project Roadmap", "Architecture Plan"],
    tools: ["Figma", "Miro", "Notion", "Lookback"]
  },
  {
    id: "define",
    number: "02",
    title: "Define",
    subtitle: "Charting the course",
    description: "We synthesize research into actionable strategy. Information architecture, user flows, and technical specifications take shape.",
    duration: "2-3 weeks",
    color: "purple",
    steps: [
      { title: "Information Architecture", desc: "Site maps and content hierarchies" },
      { title: "User Flows", desc: "Journey mapping and interaction design" },
      { title: "Wireframing", desc: "Low-fidelity interface concepts" },
      { title: "Tech Specs", desc: "Database design and API contracts" }
    ],
    deliverables: ["Wireframes", "User Flow Diagrams", "Technical Specifications", "Project Timeline"],
    tools: ["Figma", "Whimsical", "Swagger", "Jira"]
  },
  {
    id: "design",
    number: "03",
    title: "Design",
    subtitle: "Crafting the experience",
    description: "Visual design comes alive with your brand identity. We create high-fidelity mockups, prototypes, and design systems.",
    duration: "3-4 weeks",
    color: "emerald",
    steps: [
      { title: "Visual Design", desc: "UI mockups and component libraries" },
      { title: "Prototyping", desc: "Interactive click-through prototypes" },
      { title: "Design System", desc: "Tokens, components, and documentation" },
      { title: "User Testing", desc: "Validation with real users" }
    ],
    deliverables: ["High-Fidelity Mockups", "Interactive Prototype", "Design System", "Accessibility Audit"],
    tools: ["Figma", "Principle", "Storybook", "Stark"]
  },
  {
    id: "develop",
    number: "04",
    title: "Develop",
    subtitle: "Building with precision",
    description: "Engineering sprints bring designs to life. We write clean, tested code with continuous integration and deployment.",
    duration: "8-12 weeks",
    color: "amber",
    steps: [
      { title: "Sprint Planning", desc: "Agile ceremonies and task breakdown" },
      { title: "Frontend Development", desc: "React/Next.js component implementation" },
      { title: "Backend Development", desc: "APIs, databases, and integrations" },
      { title: "Quality Assurance", desc: "Automated and manual testing" }
    ],
    deliverables: ["Production Code", "Test Suite", "Documentation", "Staging Environment"],
    tools: ["React", "Next.js", "Node.js", "PostgreSQL", "AWS"]
  },
  {
    id: "deliver",
    number: "05",
    title: "Deliver",
    subtitle: "Launch and beyond",
    description: "Rigorous testing, smooth deployment, and knowledge transfer. We ensure your team is equipped for long-term success.",
    duration: "2-4 weeks",
    color: "rose",
    steps: [
      { title: "Performance Optimization", desc: "Core Web Vitals and load testing" },
      { title: "Security Audit", desc: "Vulnerability scanning and hardening" },
      { title: "Deployment", desc: "Production release and monitoring" },
      { title: "Handoff", desc: "Training and documentation transfer" }
    ],
    deliverables: ["Production Release", "Team Training", "Support Documentation", "Warranty Period"],
    tools: ["Vercel", "Docker", "GitHub Actions", "DataDog"]
  },
  {
    id: "maintain",
    number: "06",
    title: "Maintain",
    subtitle: "Continuous improvement",
    description: "Ongoing support, monitoring, and iterative improvements. We stay with you to ensure sustained success and growth.",
    duration: "Ongoing",
    color: "cyan",
    steps: [
      { title: "24/7 Monitoring", desc: "Real-time performance and error tracking" },
      { title: "Security Updates", desc: "Regular patches and vulnerability fixes" },
      { title: "Feature Iteration", desc: "Continuous improvement and new features" },
      { title: "Performance Tuning", desc: "Ongoing optimization and scaling" }
    ],
    deliverables: ["Monthly Reports", "SLA Support", "Feature Releases", "Technical Consultation"],
    tools: ["Sentry", "Datadog", "GitHub", "Slack"]
  }
];

const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200", gradient: "from-blue-500/20" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200", gradient: "from-purple-500/20" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200", gradient: "from-emerald-500/20" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200", gradient: "from-amber-500/20" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", bgLight: "bg-rose-50", border: "border-rose-200", gradient: "from-rose-500/20" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", bgLight: "bg-cyan-50", border: "border-cyan-200", gradient: "from-cyan-500/20" }
};

function PhaseCard({ phase, index, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorSchemes[phase.color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <CornerFrame
        className={`
          p-4 sm:p-5 transition-all duration-500
          ${isActive ? `${colors.bgLight} ${colors.border} border-2` : 'bg-white border-neutral-200 hover:border-neutral-300'}
        `}
        bracketClassName={`w-3 h-3 transition-colors ${isActive ? colors.border.replace('border-', 'border-') : 'border-neutral-300'}`}
      >
        <div className="flex items-start gap-4">
          <div className={`
            font-space-grotesk text-3xl sm:text-4xl font-medium transition-colors
            ${isActive ? colors.text : 'text-neutral-200'}
          `}>
            {phase.number}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-space-grotesk text-lg font-medium ${isActive ? 'text-neutral-900' : 'text-neutral-600'}`}>
                {phase.title}
              </h3>
              {isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-2 h-2 rounded-full ${colors.bg}`}
                />
              )}
            </div>
            <p className="text-sm text-neutral-500 mb-2">{phase.subtitle}</p>
            
            <span className={`
              inline-block px-2 py-0.5 text-[9px] font-jetbrains-mono uppercase tracking-wider
              ${isActive ? `bg-white ${colors.text} border ${colors.border}` : 'bg-neutral-100 text-neutral-500'}
            `}>
              {phase.duration}
            </span>
          </div>

          <motion.div
            animate={{ rotate: isActive ? 90 : 0, x: isHovered && !isActive ? 3 : 0 }}
            transition={{ duration: 0.3 }}
            className={`text-neutral-400 ${isActive ? colors.text : ''}`}
          >
            →
          </motion.div>
        </div>
      </CornerFrame>

      {isActive && (
        <motion.div
          layoutId="activePhase"
          className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg}`}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.div>
  );
}

function PhaseDetail({ phase }) {
  const colors = colorSchemes[phase.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <CornerFrame
        className={`bg-white border-neutral-200 p-5 sm:p-6 lg:p-8 h-full`}
        bracketClassName="w-4 h-4 sm:w-5 sm:h-5 border-neutral-300"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`font-space-grotesk text-4xl sm:text-5xl font-medium ${colors.text}`}>
                {phase.number}
              </span>
              <div className={`h-12 w-px ${colors.bg}`} />
              <div>
                <h2 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900">
                  {phase.title}
                </h2>
                <p className="text-sm text-neutral-500">{phase.subtitle}</p>
              </div>
            </div>
          </div>
          <span className={`
            px-3 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider
            ${colors.bgLight} ${colors.text} border ${colors.border}
          `}>
            {phase.duration}
          </span>
        </div>

        <p className="text-base text-neutral-600 leading-relaxed mb-8">
          {phase.description}
        </p>

        <div className="mb-8">
          <h4 className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-4">
            Key Activities
          </h4>
          <div className="space-y-3">
            {phase.steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-100"
              >
                <div className={`w-1.5 h-1.5 mt-2 ${colors.bg} shrink-0`} />
                <div>
                  <h5 className="font-medium text-neutral-900 text-sm mb-1">{step.title}</h5>
                  <p className="text-xs text-neutral-500">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-3">
              Deliverables
            </h4>
            <ul className="space-y-2">
              {phase.deliverables.map((item, i) => (
                <li key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                  <span className={`w-1 h-1 ${colors.bg}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-3">
              Tools We Use
            </h4>
            <div className="flex flex-wrap gap-2">
              {phase.tools.map((tool) => (
                <span
                  key={tool}
                  className={`px-2 py-1 text-[10px] font-jetbrains-mono border ${colors.border} ${colors.bgLight} ${colors.text}`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-2">
            <span>Phase Progress</span>
            <span>{parseInt(phase.number) * 16}%</span>
          </div>
          <div className="h-1 bg-neutral-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${parseInt(phase.number) * 16}%` }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className={`h-full ${colors.bg}`}
            />
          </div>
        </div>
      </CornerFrame>
    </motion.div>
  );
}

export default function ProcessPage() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <main className="w-full bg-white relative">
      {/* Header */}
      <section className="pt-8 sm:pt-12 lg:pt-16 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-4 bg-neutral-300" />
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                Our Process
              </span>
            </div>
            
            <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-4">
              How we work
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
              A battle-tested methodology refined over 50+ projects. Transparent, 
              collaborative, and relentlessly focused on delivering value.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Overview - Now 6 items in horizontal bar */}
      <section className="py-12 sm:py-16 border-y border-neutral-100 bg-neutral-50/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <button
                  onClick={() => setActivePhase(index)}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 flex items-center justify-center
                    font-space-grotesk text-sm sm:text-base font-medium transition-all duration-300
                    ${index <= activePhase ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-400 border border-neutral-200 hover:border-neutral-400'}
                  `}
                >
                  {phase.number}
                </button>
                <div className="hidden sm:block text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500">
                  {phase.title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Process - FIXED: Equal width columns */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* FIXED: Changed from lg:grid-cols-12 to equal 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Phase Cards */}
            <div className="space-y-3">
              {phases.map((phase, index) => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  index={index}
                  isActive={activePhase === index}
                  onClick={() => setActivePhase(index)}
                />
              ))}
            </div>

            {/* Right: Phase Detail - Now equal width */}
            <div className="lg:sticky lg:top-24 h-fit">
              <AnimatePresence mode="wait">
                <PhaseDetail key={activePhase} phase={phases[activePhase]} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section - CHANGED TO WHITE BACKGROUND */}
      <section className="py-16 sm:py-24 bg-white border-t border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-4 bg-neutral-300" />
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                  Our Principles
                </span>
              </div>
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-medium text-neutral-900 tracking-tight mb-6">
                Collaboration by <span className="text-neutral-400">design</span>
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                We believe the best work happens when teams align. Our process is designed 
                to keep you informed, involved, and in control at every stage.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
              >
                Start Your Project
                <span>→</span>
              </Link>
            </div>

            <div className="space-y-6">
              {[
                { title: "Weekly Sprints", desc: "Regular check-ins and demos keep momentum high" },
                { title: "Transparent Communication", desc: "Slack access, Notion docs, no black boxes" },
                { title: "Flexible Scope", desc: "Agile methodology adapts to changing needs" },
                { title: "Quality Gates", desc: "Rigorous review at every phase boundary" }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 border border-neutral-200 hover:border-neutral-300 transition-colors bg-white"
                >
                  <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center shrink-0">
                    <span className="text-neutral-500 text-sm">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-neutral-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-neutral-50/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 mb-4">
              Common Questions
            </h2>
            <p className="text-neutral-600">Everything you need to know about working with us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { q: "How long does a typical project take?", a: "Most projects range from 12-16 weeks, depending on scope and complexity." },
              { q: "What is your pricing model?", a: "We work on fixed-price contracts based on detailed scope, or time-and-materials for ongoing work." },
              { q: "Do you provide ongoing support?", a: "Yes, we offer maintenance retainers and can train your team for handoff." },
              { q: "What technologies do you specialize in?", a: "React, Next.js, Node.js, PostgreSQL, and cloud infrastructure on AWS/Vercel." }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-5 bg-white border border-neutral-200"
              >
                <h4 className="font-medium text-neutral-900 mb-2 text-sm">{faq.q}</h4>
                <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}