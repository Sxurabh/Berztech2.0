import { motion } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default function DashboardRecentPosts({ posts, loading, onNewPost, onEditPost }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <CornerFrame
                className="bg-white border border-neutral-200 p-4 lg:p-5 h-full flex flex-col"
                bracketClassName="w-2.5 h-2.5 border-neutral-400"
            >
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                        Recent Blog Posts
                    </h3>
                    <Link href="/admin/blog" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-2 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-sm" />
                        ))}
                    </div>
                ) : !posts || posts.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-xs text-neutral-500 font-jetbrains-mono">No posts</p>
                        <button type="button" onClick={onNewPost} className="text-xs text-neutral-700 hover:text-neutral-900 underline mt-1 inline-block">
                            Write post
                        </button>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[148px] pr-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                        {posts.map((post) => (
                            <button
                                key={post.id}
                                type="button"
                                onClick={() => onEditPost(post.id)}
                                className="w-full flex items-center justify-between py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group text-left"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-space-grotesk text-neutral-900 truncate">
                                        {post.title}
                                    </div>
                                    <div className="text-[10px] font-jetbrains-mono text-neutral-500">
                                        {post.published ? "Published" : "Draft"} • {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`
                                    text-[9px] font-jetbrains-mono uppercase px-1.5 py-0.5 rounded shrink-0 ml-2
                                    border border-neutral-300
                                    ${post.published ? "bg-white text-neutral-700" : "bg-neutral-100 text-neutral-600"}
                                `}>
                                    {post.published ? "Live" : "Draft"}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </CornerFrame>
        </motion.div>
    );
}
