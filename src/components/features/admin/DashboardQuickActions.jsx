import { motion } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { FiPlus, FiArrowRight } from "react-icons/fi";

function QuickActionCard({ onClick, title, subtitle, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
        >
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left"
            >
                <CornerFrame
                    className="p-4 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 group h-full"
                    bracketClassName="w-2 h-2 border-neutral-400"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-sm">
                            <FiPlus className="w-3.5 h-3.5 text-neutral-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-space-grotesk text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                                {title}
                            </div>
                            <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                {subtitle}
                            </div>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0" />
                    </div>
                </CornerFrame>
            </button>
        </motion.div>
    );
}

export default function DashboardQuickActions({ onNewProject, onNewTestimonial, onNewBlogPost }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
            <QuickActionCard onClick={onNewProject} title="New Project" subtitle="Add case study" index={0} />
            <QuickActionCard onClick={onNewTestimonial} title="New Testimonial" subtitle="Add client review" index={1} />
            <QuickActionCard onClick={onNewBlogPost} title="New Blog Post" subtitle="Write article" index={2} />
        </div>
    );
}
