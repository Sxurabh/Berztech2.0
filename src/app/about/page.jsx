"use client";
import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";
import { layoutConfig } from "@/config/layout";

const values = [
  {
    title: "Precision",
    description: "Every line of code is intentional. We measure twice, cut once, and never ship debt.",
    icon: "◈"
  },
  {
    title: "Transparency",
    description: "No black boxes. Our process is open, our communication clear, our intentions honest.",
    icon: "◉"
  },
  {
    title: "Partnership",
    description: "We don't have clients, we have collaborators. Your success is our success.",
    icon: "◆"
  },
  {
    title: "Innovation",
    description: "We stay ahead of the curve so you can lead the market. Continuous learning is our baseline.",
    icon: "◇"
  }
];

const team = [
  {
    name: "Alex Chen",
    role: "Founder & CTO",
    bio: "Former Google engineer. 12 years building scalable systems.",
    image: "/images/team/alex.jpg"
  },
  {
    name: "Sarah Miller",
    role: "Design Lead",
    bio: "Ex-Apple designer. Obsessed with pixel-perfect interfaces.",
    image: "/images/team/sarah.jpg"
  },
  {
    name: "James Wilson",
    role: "Engineering Lead",
    bio: "Full-stack architect. Open source contributor.",
    image: "/images/team/james.jpg"
  },
  {
    name: "Emma Davis",
    role: "Product Strategist",
    bio: "Former McKinsey. Translates business goals into roadmaps.",
    image: "/images/team/emma.jpg"
  }
];

const stats = [
  { value: 7, suffix: "+", label: "Years Active", sublabel: "Since 2017" },
  { value: 50, suffix: "+", label: "Projects", sublabel: "Delivered" },
  { value: 12, suffix: "", label: "Team Members", sublabel: "Engineers & Designers" },
  { value: 98, suffix: "%", label: "Retention", sublabel: "Client Rate" }
];

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) {
        setIsVisible(true);
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(easeOut * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    
    const element = document.getElementById(`counter-${value}`);
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [value, isVisible]);

  return (
    <span id={`counter-${value}`} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

function ValueCard({ value, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <CornerFrame
        className={`
          h-full p-5 sm:p-6 bg-neutral-50 border-neutral-200 transition-all duration-500
          ${isHovered ? 'border-neutral-400 shadow-lg' : ''}
        `}
        bracketClassName="w-3 h-3 border-neutral-300 group-hover:border-neutral-500 transition-colors"
      >
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0, scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl mb-4 text-neutral-300 group-hover:text-neutral-900 transition-colors"
        >
          {value.icon}
        </motion.div>
        
        <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mb-2">
          {value.title}
        </h3>
        
        <p className="text-sm text-neutral-600 leading-relaxed">
          {value.description}
        </p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 origin-left"
        />
      </CornerFrame>
    </motion.div>
  );
}

function TeamCard({ member, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <CornerFrame
        className={`
          overflow-hidden bg-white border-neutral-200 transition-all duration-500
          ${isHovered ? 'border-neutral-400 shadow-xl' : 'shadow-sm'}
        `}
        bracketClassName="w-3 h-3 border-neutral-300 group-hover:border-neutral-500 transition-colors"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                <span className="font-space-grotesk text-4xl font-bold text-neutral-400">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <p className="text-sm text-white/90 leading-relaxed">
              {member.bio}
            </p>
          </motion.div>
        </div>

        <div className="p-4">
          <h3 className="font-space-grotesk text-base font-medium text-neutral-900 mb-1">
            {member.name}
          </h3>
          <p className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-500">
            {member.role}
          </p>
        </div>
      </CornerFrame>
    </motion.div>
  );
}

export default function AboutPage() {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <main ref={containerRef} className="w-full bg-white relative">
      {/* Hero Section - FIXED: Reduced top spacing to match main Hero */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 overflow-hidden">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-100 via-white to-white" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }} />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-4 bg-neutral-300" />
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                About Us
              </span>
            </div>

            <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-6">
              Engineering
              <br />
              <span className="text-neutral-400">Excellence</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-2xl leading-relaxed">
              We are a boutique digital agency crafting high-performance web applications 
              for ambitious companies. No templates. No shortcuts. Just pure code.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 border-y border-neutral-100 bg-neutral-50/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 sm:p-6"
              >
                <div className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-neutral-900 mb-1">{stat.label}</div>
                <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-4 bg-neutral-300" />
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                  Our Story
                </span>
              </div>
              
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-medium text-neutral-900 tracking-tight mb-6 leading-tight">
                Built by engineers,
                <br />
                <span className="text-neutral-400">for innovators</span>
              </h2>

              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  Founded in 2017, Berztech began with a simple belief: that software should be 
                  built with the same care and precision as architecture. We rejected the 
                  template culture and quick-fix mentality pervasive in our industry.
                </p>
                <p>
                  Today, we're a tight-knit team of engineers and designers who treat every 
                  project as a craft. We've helped startups scale from zero to millions of users, 
                  and transformed legacy systems into modern, maintainable platforms.
                </p>
                <p>
                  Our approach is collaborative, transparent, and relentlessly focused on 
                  delivering measurable business value through technical excellence.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/process"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Our Process
                  <span>→</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Get in touch
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <CornerFrame
                className="bg-neutral-50 border-neutral-200 p-2"
                bracketClassName="w-4 h-4 border-neutral-300"
              >
                <div className="aspect-[4/3] bg-neutral-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-space-grotesk text-6xl font-bold text-neutral-300">B</span>
                  </div>
                  <div className="absolute top-4 right-4 w-20 h-20 border border-neutral-300/50" />
                  <div className="absolute bottom-4 left-4 w-32 h-32 border border-neutral-300/50" />
                </div>
              </CornerFrame>
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-neutral-900 text-white p-4 shadow-xl"
              >
                <div className="font-space-grotesk text-2xl font-medium">7+</div>
                <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400">Years</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-neutral-50/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-4 bg-neutral-300" />
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              Our Values
            </span>
          </div>
          
          <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight mb-12">
            Principles that guide <span className="text-neutral-400">our work</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <ValueCard key={value.title} value={value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-4 bg-neutral-300" />
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                  The Team
                </span>
              </div>
              <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight">
                Meet the <span className="text-neutral-400">builders</span>
              </h2>
            </div>
            <p className="text-sm text-neutral-600 max-w-sm">
              A small but mighty team of engineers, designers, and strategists passionate about craft.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-neutral-600 mb-4">Want to join the team?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-jetbrains-mono uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              View Open Positions
              <span className="w-4 h-px bg-neutral-900" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-neutral-950 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
              Ready to build <span className="text-neutral-500">together?</span>
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto mb-8">
              Let's discuss how we can help transform your digital presence with precision engineering.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors"
            >
              Start a Project
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}