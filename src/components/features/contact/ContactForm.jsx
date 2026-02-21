"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { CornerFrame } from "@/components/ui/CornerFrame";

const services = [
  "Web Development",
  "Mobile App",
  "UI/UX Design",
  "Brand Strategy",
  "Audit / Consulting",
  "Other"
];

const budgets = [
  "< $10k",
  "$10k - $25k",
  "$25k - $50k",
  "$50k +"
];

export default function ContactForm() {
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    services: [],
    budget: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Request sent! Please sign in to track your request.", { duration: 5000 });
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <CornerFrame
        className="h-full min-h-[400px] flex items-center justify-center"
        bracketClassName="w-4 h-4 border-neutral-900"
      >
        <div className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <h3 className="font-space-grotesk text-2xl font-medium text-neutral-900 mb-2">Message Received</h3>
          <p className="text-neutral-500 max-w-xs mx-auto mb-6">
            We've received your inquiry. Our team will review your requirements and get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-xs font-jetbrains-mono uppercase tracking-widest border-b border-neutral-900 pb-0.5 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
          >
            Send another message
          </button>
        </div>
      </CornerFrame>
    );
  }

  return (
    <CornerFrame
      className="!block p-6 sm:p-8 lg:p-10 mx-auto max-w-5xl"
      bracketClassName="w-5 h-5 border-neutral-300"
    >
      <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-3xl mx-auto">
        {error && (
          <div className="p-3 border border-red-200 bg-red-50 text-red-600 text-sm font-jetbrains-mono rounded-sm">
            {error}
          </div>
        )}

        {/* Personal Details Group */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label
                htmlFor="name"
                className={`
                  block text-[10px] font-jetbrains-mono uppercase tracking-widest mb-2 transition-colors
                  ${focusedField === 'name' ? 'text-neutral-900' : 'text-neutral-500'}
                `}
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className="w-full backdrop-blur-sm border-b border-neutral-200 py-3 px-2 font-space-grotesk text-lg text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-300"
                placeholder="John Doe"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="email"
                className={`
                  block text-[10px] font-jetbrains-mono uppercase tracking-widest mb-2 transition-colors
                  ${focusedField === 'email' ? 'text-neutral-900' : 'text-neutral-500'}
                `}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-white/50 backdrop-blur-sm border-b border-neutral-200 py-3 px-2 font-space-grotesk text-lg text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-300"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="company"
              className={`
                block text-[10px] font-jetbrains-mono uppercase tracking-widest mb-2 transition-colors
                ${focusedField === 'company' ? 'text-neutral-900' : 'text-neutral-500'}
              `}
            >
              Company / Website
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              onFocus={() => setFocusedField('company')}
              onBlur={() => setFocusedField(null)}
              className="w-full bg-white/50 backdrop-blur-sm border-b border-neutral-200 py-3 px-2 font-space-grotesk text-lg text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all placeholder:text-neutral-300"
              placeholder="acme.com"
            />
          </div>
        </div>

        {/* Services Selection */}
        <div>
          <span className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-4">
            I'm interested in...
          </span>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={`
                  px-3 py-2 text-xs font-jetbrains-mono border transition-all duration-200 backdrop-blur-sm
                  ${formData.services.includes(service)
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white/50 text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:bg-white'
                  }
                `}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Selection */}
        <div>
          <span className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-4">
            Project Budget
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {budgets.map((budget) => (
              <button
                key={budget}
                type="button"
                onClick={() => setFormData({ ...formData, budget })}
                className={`
                  px-2 py-2 text-xs font-jetbrains-mono border transition-all duration-200 text-center backdrop-blur-sm
                  ${formData.budget === budget
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white/50 text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:bg-white'
                  }
                `}
              >
                {budget}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="relative">
          <label
            htmlFor="message"
            className={`
              block text-[10px] font-jetbrains-mono uppercase tracking-widest mb-2 transition-colors
              ${focusedField === 'message' ? 'text-neutral-900' : 'text-neutral-500'}
            `}
          >
            Project Details
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
            className="w-full bg-white/50 backdrop-blur-sm border border-neutral-200 p-4 font-space-grotesk text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none placeholder:text-neutral-300"
            placeholder="Tell us about your goals, timeline, and requirements..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="font-jetbrains-mono text-xs uppercase tracking-widest font-semibold">
              {isSubmitting ? "Sending..." : "Send Request"}
            </span>
            {!isSubmitting && (
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            )}

            {/* Button Corners */}
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/30" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/30" />
          </button>
        </div>

      </form>
    </CornerFrame>
  );
}