import { motion } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { FiBriefcase, FiFileText, FiMessageSquare } from "react-icons/fi";

function StatCard({ icon: Icon, label, value, href, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={href}>
                <CornerFrame
                    className="p-3 sm:p-4 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 h-full"
                    bracketClassName="w-2 h-2 border-neutral-400"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-sm">
                            <Icon className="w-3.5 h-3.5 text-neutral-700" />
                        </div>
                    </div>
                    <div className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900 mb-0.5">
                        {value ?? "—"}
                    </div>
                    <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                        {label}
                    </div>
                </CornerFrame>
            </Link>
        </motion.div>
    );
}

export default function DashboardStats({ stats }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
            <StatCard icon={FiBriefcase} label="Projects" value={stats?.projects} href="/admin/projects" index={0} />
            <StatCard icon={FiMessageSquare} label="Testimonials" value={stats?.testimonials} href="/admin/testimonials" index={2} />
            <StatCard icon={FiFileText} label="Posts" value={stats?.posts} href="/admin/blog" index={1} />
        </div>
    );
}
