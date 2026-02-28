import { motion } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { FiArrowRight } from "react-icons/fi";

export default function DashboardRecentProjects({ projects, loading, onNewProject, onEditProject }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <CornerFrame
                className="bg-white border border-neutral-200 p-4 lg:p-5 h-full flex flex-col"
                bracketClassName="w-2.5 h-2.5 border-neutral-400"
            >
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                        Recent Projects
                    </h3>
                    <Link href="/admin/projects" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-2 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-sm" />
                        ))}
                    </div>
                ) : !projects || projects.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-xs text-neutral-500 font-jetbrains-mono">No projects</p>
                        <button type="button" onClick={onNewProject} className="text-xs text-neutral-700 hover:text-neutral-900 underline mt-1 inline-block">
                            Add project
                        </button>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[148px] pr-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => onEditProject(project.id)}
                                className="w-full flex items-center justify-between py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group text-left"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-space-grotesk text-neutral-900 truncate">
                                        {project.client || project.title}
                                    </div>
                                    <div className="text-[10px] font-jetbrains-mono text-neutral-500">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0 ml-2" />
                            </button>
                        ))}
                    </div>
                )}
            </CornerFrame>
        </motion.div>
    );
}
