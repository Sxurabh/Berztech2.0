import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { getPostById, getPosts } from "@/lib/data/blogPosts";
import { colorSchemes } from "@/data/blogPosts";
import { typography, spacing } from "@/lib/design-tokens";
import PostCard from "@/components/features/blog/PostCard";

export async function generateMetadata(props) {
    const params = await props.params;
    const post = await getPostById(params.id);
    if (!post) return { title: "Post Not Found" };
    return {
        title: `${post.title} | Berztech Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage(props) {
    const params = await props.params;
    const post = await getPostById(params.id);

    if (!post) {
        notFound();
    }

    // Fetch recent posts for "Read Next"
    const allPosts = await getPosts();
    const relatedPosts = allPosts
        .filter(p => p.id !== post.id) // Exclude current
        .slice(0, 3); // Take 3

    const colors = colorSchemes[post.color] || colorSchemes.neutral;

    return (
        <main className="w-full relative">
            {/* Navigation Bar */}
            <div className="border-b border-neutral-200 sticky top-0 bg-white/90 backdrop-blur-md z-40">
                <div className={`${spacing.container.wrapper} h-14 flex items-center justify-between`}>
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <span>←</span>
                        <span>Back to Blog</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                            {post.readTime} Read
                        </span>
                    </div>
                </div>
            </div>

            {/* Clean Blog Hero Section */}
            <section className="relative pt-32 pb-8 bg-transparent z-0">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-6xl relative z-20 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                        <span className={`px-3 py-1 text-xs font-jetbrains-mono uppercase tracking-widest bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-full`}>
                            {post.category}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                        <span className="text-xs font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                            {post.date}
                        </span>
                    </div>

                    <h1 className={`${typography.fontFamily.sans} text-4xl sm:text-6xl lg:text-7xl font-medium text-neutral-900 tracking-tight leading-[1.1] mb-10`}>
                        {post.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center rounded-full border border-neutral-200 shadow-sm">
                                <span className="font-space-grotesk text-sm font-medium text-neutral-700">
                                    {post.author.charAt(0)}
                                </span>
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-neutral-900">{post.author}</div>
                                <div className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-wider">Author</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Cover Image */}
            {post.image && (
                <section className="py-8 sm:py-12 bg-transparent relative z-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <CornerFrame
                            className="bg-white p-2 sm:p-3 border-neutral-200 shadow-xl"
                            bracketClassName="w-6 h-6 border-neutral-300"
                        >
                            <div className="relative aspect-[21/9] w-full overflow-hidden bg-neutral-100">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1200px) 100vw, 1200px"
                                />
                            </div>
                        </CornerFrame>
                    </div>
                </section>
            )}

            {/* Content & Editorial Layout */}
            <section className="relative z-10 py-12 sm:py-20 bg-transparent">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto relative">

                        {/* Floating Social Share (Desktop Only placeholder for structure) */}
                        <div className="hidden lg:flex absolute -left-20 top-0 flex-col gap-4 text-neutral-400">
                            <div className="w-[1px] h-12 bg-neutral-200 mx-auto"></div>
                            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</span>
                            <div className="w-[1px] h-24 bg-neutral-200 mx-auto"></div>
                        </div>

                        {/* Article Content - Upgraded Typography */}
                        <article className="prose prose-neutral prose-lg lg:prose-xl max-w-none font-light text-neutral-700 leading-relaxed selection:bg-neutral-900 selection:text-white">
                            <div className="whitespace-pre-wrap first-letter:text-7xl first-letter:font-serif first-letter:float-left first-letter:mr-6 first-letter:mt-2 first-letter:text-neutral-900 first-letter:font-medium">{post.content}</div>
                        </article>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-wrap gap-2">
                                <span className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400 mr-2 py-1">Tags:</span>
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-neutral-50 border border-neutral-200 text-neutral-600 text-[10px] font-jetbrains-mono uppercase tracking-wider rounded-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* CTA Box */}
                        <div className="mt-16 relative overflow-hidden">
                            <CornerFrame className="bg-white border border-neutral-200 p-8 sm:p-12 text-center shadow-lg" bracketClassName="!border-neutral-300">
                                <div className="relative z-10">
                                    <h3 className="font-space-grotesk text-3xl sm:text-4xl font-medium text-neutral-900 mb-4">
                                        Engineering & Design Insights
                                    </h3>
                                    <p className="text-neutral-600 mb-8 max-w-md mx-auto font-light text-lg">
                                        Subscribe to our newsletter for more monthly deep-dives on product building.
                                    </p>
                                    {/* TODO: Implement client-side form wrapper, state, and onSubmit handler for newsletter subscription later */}
                                    <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            aria-label="Email address"
                                            className="bg-neutral-50 border border-neutral-200 text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:border-neutral-500 w-full font-space-grotesk placeholder:text-neutral-500"
                                        />
                                        <button className="px-6 py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors whitespace-nowrap">
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            </CornerFrame>
                        </div>
                    </div>
                </div>
            </section>

            {/* Read Next */}
            <section className="py-20 bg-transparent border-t border-neutral-200">
                <div className={spacing.container.wrapper}>
                    <h3 className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-8">
                        Read Next
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedPosts.map((relatedPost, index) => (
                            <PostCard key={relatedPost.id} post={relatedPost} index={index} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
