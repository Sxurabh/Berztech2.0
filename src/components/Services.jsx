import React, { useState } from "react";
import Container from "./Container";
import FadeIn from "./FadeIn";
import { CornerFrame } from "./CornerFrame";
import clsx from "clsx";

/* --- Service Card Component --- */
const ServiceCard = ({ number, title, description, features, isActive, onHover }) => {
  return (
    <div
      className={clsx(
        "group relative p-6 sm:p-8 border border-neutral-200 transition-all duration-500 cursor-default",
        isActive ? "bg-neutral-950 text-white" : "bg-white hover:border-neutral-400"
      )}
      onMouseEnter={onHover}
    >
      {/* Number */}
      <span className={clsx(
        "font-jetbrains-mono text-xs font-bold mb-6 block",
        isActive ? "text-neutral-500" : "text-neutral-300"
      )}>
        {number}
      </span>

      {/* Title */}
      <h3 className={clsx(
        "font-space-grotesk text-xl sm:text-2xl font-medium mb-3 transition-colors",
        isActive ? "text-white" : "text-neutral-900"
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={clsx(
        "font-jetbrains-mono text-sm leading-relaxed mb-6",
        isActive ? "text-neutral-400" : "text-neutral-600"
      )}>
        {description}
      </p>

      {/* Features List */}
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={clsx(
              "w-1 h-1 rounded-full",
              isActive ? "bg-emerald-400" : "bg-neutral-400"
            )} />
            <span className={clsx(
              "font-jetbrains-mono text-xs",
              isActive ? "text-neutral-300" : "text-neutral-500"
            )}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Hover Arrow */}
      <div className={clsx(
        "absolute bottom-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
        isActive ? "bg-white text-neutral-950" : "bg-neutral-100 text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white"
      )}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );
};

/* --- Process Step --- */
const ProcessStep = ({ number, title, description }) => (
  <div className="flex gap-4 sm:gap-6">
    <span className="font-jetbrains-mono text-xs text-neutral-400 font-bold shrink-0 pt-1">
      {number}
    </span>
    <div>
      <h4 className="font-space-grotesk text-base font-medium text-neutral-900 mb-1">
        {title}
      </h4>
      <p className="font-jetbrains-mono text-xs text-neutral-500 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const Services = () => {
  const [activeService, setActiveService] = useState(null);

  const services = [
    {
      number: "01",
      title: "Web Development",
      description: "Custom websites and web applications built for performance, scalability, and conversion.",
      features: ["Next.js & React", "Headless CMS", "SEO Optimization", "Performance Tuning"]
    },
    {
      number: "02",
      title: "Mobile Apps",
      description: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
      features: ["iOS & Android", "React Native", "Flutter", "App Store Optimization"]
    },
    {
      number: "03",
      title: "Brand Identity",
      description: "Strategic brand development and visual identity systems that communicate your value.",
      features: ["Logo Design", "Brand Guidelines", "Visual Systems", "Print & Digital"]
    },
    {
      number: "04",
      title: "Digital Marketing",
      description: "Data-driven marketing strategies that drive growth and measurable business results.",
      features: ["SEO Strategy", "Content Marketing", "Paid Advertising", "Analytics & Reporting"]
    }
  ];

  return (
    <section className="py-20 sm:py-32 bg-white" id="services">
      <Container>
        {/* Section Header */}
        <FadeIn>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4 block">
              What We Do
            </span>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 leading-tight mb-4">
              Services built for{" "}
              <span className="text-neutral-400">modern businesses.</span>
            </h2>
            <p className="font-jetbrains-mono text-sm sm:text-base text-neutral-600 leading-relaxed">
              From concept to launch, we provide end-to-end digital solutions 
              that help your business grow and succeed online.
            </p>
          </div>
        </FadeIn>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-20 sm:mb-32">
          {services.map((service, index) => (
            <FadeIn key={service.number} delay={index * 0.1}>
              <ServiceCard
                {...service}
                isActive={activeService === index}
                onHover={() => setActiveService(index)}
              />
            </FadeIn>
          ))}
        </div>

        {/* How We Work */}
        <div className="border-t border-neutral-200 pt-16 sm:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Process Description */}
            <FadeIn>
              <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4 block">
                How We Work
              </span>
              <h3 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight mb-6">
                A proven process that delivers{" "}
                <span className="text-neutral-400">results.</span>
              </h3>
              <p className="font-jetbrains-mono text-sm text-neutral-600 leading-relaxed mb-8">
                Every project follows our refined methodology, ensuring 
                transparency, efficiency, and outcomes that exceed expectations.
              </p>
              
              {/* CTA */}
              <a 
                href="/process" 
                className="inline-flex items-center gap-2 font-jetbrains-mono text-sm text-neutral-900 hover:text-neutral-600 transition-colors group"
              >
                Learn more about our process
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </FadeIn>

            {/* Right: Process Steps */}
            <div className="space-y-8">
              <FadeIn>
                <ProcessStep 
                  number="01"
                  title="Discovery"
                  description="We understand your goals, audience, and competition to define the right strategy."
                />
              </FadeIn>
              <FadeIn delay={0.1}>
                <ProcessStep 
                  number="02"
                  title="Design"
                  description="Wireframes and visual design that align with your brand and user needs."
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <ProcessStep 
                  number="03"
                  title="Development"
                  description="Clean, scalable code with rigorous testing and quality assurance."
                />
              </FadeIn>
              <FadeIn delay={0.3}>
                <ProcessStep 
                  number="04"
                  title="Launch & Support"
                  description="Deployment, training, and ongoing maintenance to ensure long-term success."
                />
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <FadeIn>
          <div className="mt-20 sm:mt-32 text-center">
            <div className="inline-block">
              <CornerFrame className="p-8 sm:p-12 bg-neutral-50" bracketClassName="w-6 h-6">
                <p className="font-jetbrains-mono text-xs text-neutral-500 mb-3 uppercase tracking-widest">
                  Ready to start?
                </p>
                <h3 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 mb-6">
                  Let's discuss your project.
                </h3>
                <a 
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white font-jetbrains-mono text-sm rounded hover:bg-neutral-800 transition-colors"
                >
                  Get in touch
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </CornerFrame>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
};

export default Services;