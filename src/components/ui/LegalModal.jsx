import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { CornerFrame } from '@/components/ui/CornerFrame';

export default function LegalModal({ isOpen, onClose, type }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const content = type === 'privacy' ? (
        <>
            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you submit a contact form, subscribe to our newsletter, or communicate with us. This may include your name, email address, company name, and project details.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">2. How We Use Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and process your requests.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">3. Information Sharing</h3>
            <p>We do not share, sell, or rent your personal information to third parties without your consent, except as required by law or to protect our rights.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">4. Data Security</h3>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at hello@berztech.com.</p>
        </>
    ) : (
        <>
            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">1. Acceptance of Terms</h3>
            <p>By accessing and using Berztech's services, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">2. Description of Service</h3>
            <p>Berztech provides web development, design, and consulting services. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">3. Intellectual Property</h3>
            <p>All content, features, and functionality of our deliverables are owned by Berztech or our clients as per individual service agreements. Unauthorized use or reproduction is strictly prohibited.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">4. Client Responsibilities</h3>
            <p>Clients agree to provide timely feedback, necessary assets, and clear communication to facilitate project timelines. Delays on the client's end may affect project delivery dates.</p>

            <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mt-6 mb-2">5. Limitation of Liability</h3>
            <p>In no event shall Berztech be liable for any indirect, incidental, special, consequential or punitive damages arising out of or relating to your use of our services.</p>
        </>
    );

    const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-sm shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-white z-10">
                        <h2 className="font-space-grotesk text-2xl font-medium text-neutral-900">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto font-jetbrains-mono text-sm text-neutral-600 leading-relaxed relative bg-neutral-50">
                        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
                        <p className="mb-4 text-xs tracking-widest uppercase text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
                        {content}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
