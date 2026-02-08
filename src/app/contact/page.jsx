"use client";

import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import { layoutConfig } from "@/config/layout";
import GridBackground from "@/components/ui/GridBackground";

const ContactPage = () => {
  return (
    <main className="w-full bg-white relative">
      {/* Grid Background - Fixed like homepage */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <GridBackground opacity={0.04} size={40} />
      </div>
      
      {/* Header */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-8 z-10">
        <div className={layoutConfig.maxWidth + " " + layoutConfig.padding.mobile + " " + layoutConfig.padding.tablet + " " + layoutConfig.padding.desktop + " mx-auto"}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-4 bg-neutral-300" />
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                Contact us
              </span>
            </div>
            
            <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-4">
              Let&apos;s work<br />
              <span className="text-neutral-400">together</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed">
              We cannot wait to hear from you. Tell us about your project and let&apos;s build something extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      <Container className="mt-16 sm:mt-20 lg:mt-24 pb-20 sm:pb-32 z-10 relative">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          
          <ContactForm />
        </div>
      </Container>
    </main>
  );
};

export default ContactPage;