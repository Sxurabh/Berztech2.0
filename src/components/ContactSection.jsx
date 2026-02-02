import React, { useState } from "react";
import Container from "./Container";
import FadeIn from "./FadeIn";
import { CornerFrame } from "./CornerFrame";
import clsx from "clsx";

/* --- Contact Method Card --- */
const ContactMethod = ({ title, value, href, icon, external = false }) => (
  <a
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    className="group flex items-start gap-4 p-4 sm:p-5 bg-white border border-neutral-200 hover:border-neutral-400 transition-all duration-300"
  >
    <div className="w-10 h-10 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <span className="block font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
        {title}
      </span>
      <span className="block font-space-grotesk text-sm sm:text-base font-medium text-neutral-900 truncate group-hover:text-neutral-600 transition-colors">
        {value}
      </span>
    </div>
    <svg 
      className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all ml-auto shrink-0 mt-1" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  </a>
);

/* --- Office Location --- */
const OfficeLocation = ({ city, address, timezone }) => (
  <div className="group">
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      <h4 className="font-space-grotesk text-sm font-medium text-neutral-900">
        {city}
      </h4>
    </div>
    <p className="font-jetbrains-mono text-xs text-neutral-500 leading-relaxed mb-1">
      {address}
    </p>
    <span className="font-jetbrains-mono text-[10px] text-neutral-400">
      {timezone}
    </span>
  </div>
);

/* --- Quick Form --- */
const QuickForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project: ""
  });
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("submitting");
    // Simulate submission
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", project: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  const projectTypes = [
    "Web Development",
    "Mobile App",
    "Brand Identity",
    "Digital Marketing",
    "Other"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
            Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 font-jetbrains-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 font-jetbrains-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
            placeholder="john@company.com"
          />
        </div>
      </div>

      <div>
        <label className="block font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
          Project Type
        </label>
        <div className="flex flex-wrap gap-2">
          {projectTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, project: type })}
              className={clsx(
                "px-3 py-1.5 font-jetbrains-mono text-[10px] border transition-all",
                formData.project === type
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || status === "success"}
        className={clsx(
          "w-full py-4 font-jetbrains-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
          status === "success"
            ? "bg-emerald-500 text-white"
            : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
        )}
      >
        {status === "submitting" ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : status === "success" ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Message Sent
          </>
        ) : (
          "Send Message"
        )}
      </button>

      <p className="font-jetbrains-mono text-[10px] text-neutral-400 text-center">
        We typically respond within 24 hours.
      </p>
    </form>
  );
};

const ContactSection = () => {
  return (
    <section className="py-20 sm:py-32 bg-white" id="contact">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Content & Contact Methods */}
          <FadeIn>
            <div className="max-w-lg">
              <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4 block">
                Get in Touch
              </span>
              <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 leading-tight mb-4">
                Let's build something{" "}
                <span className="text-neutral-400">great together.</span>
              </h2>
              <p className="font-jetbrains-mono text-sm text-neutral-600 leading-relaxed mb-8">
                Have a project in mind? We'd love to hear about it. Send us a 
                message and we'll get back to you within 24 hours.
              </p>

              {/* Contact Methods */}
              <div className="space-y-3 mb-10">
                <ContactMethod
                  title="Email"
                  value="hello@berztech.com"
                  href="mailto:hello@berztech.com"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <ContactMethod
                  title="Phone"
                  value="+1 (555) 123-4567"
                  href="tel:+15551234567"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
                <ContactMethod
                  title="Schedule a Call"
                  value="Book a free consultation"
                  href="https://calendly.com"
                  external
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              {/* Office Locations */}
              <div>
                <h3 className="font-jetbrains-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
                  Our Offices
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <OfficeLocation 
                    city="New York"
                    address="123 Broadway, Suite 1000"
                    timezone="EST (UTC-5)"
                  />
                  <OfficeLocation 
                    city="London"
                    address="45 Old Street, EC1V 9AE"
                    timezone="GMT (UTC+0)"
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: Quick Form */}
          <FadeIn delay={0.2}>
            <div className="lg:pl-8">
              <CornerFrame 
                className="bg-white p-6 sm:p-8 border border-neutral-200" 
                bracketClassName="w-4 h-4"
              >
                <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mb-6">
                  Send us a message
                </h3>
                <QuickForm />
              </CornerFrame>

              {/* Trust Indicators */}
              <div className="mt-6 flex items-center justify-center gap-6 text-neutral-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-jetbrains-mono text-[10px]">SSL Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-jetbrains-mono text-[10px]">No spam, ever</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
};

export default ContactSection;