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

            {/* Header Section */}
            <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 bg-neutral-50/50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-widest ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                            {post.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                        <span className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                            {post.date}
                        </span>
                    </div>

                    <h1 className={`${typography.fontFamily.sans} text-3xl sm:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-tight mb-8`}>
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center rounded-sm">
                            <span className="font-space-grotesk text-sm font-bold text-neutral-700">
                                {post.author.charAt(0)}
                            </span>
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold text-neutral-900">{post.author}</div>
                            <div className="text-[10px] font-jetbrains-mono text-neutral-500">Author</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Image */}
            {post.image && (
                <section className="-mt-8 sm:-mt-12 mb-12 relative z-10 px-4">
                    <div className="mx-auto max-w-5xl">
                        <CornerFrame
                            className="bg-white p-2 sm:p-3 border-neutral-200 shadow-xl"
                            bracketClassName="w-4 h-4 border-neutral-400"
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

            {/* Content */}
            <section className="pb-20 sm:pb-32">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Article Content */}
                    <article className="prose prose-neutral prose-lg max-w-none font-light text-neutral-700 leading-relaxed">
                        <div className="whitespace-pre-wrap">{post.content}</div>
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
                        <CornerFrame className="bg-neutral-900 p-8 sm:p-12 text-center" bracketClassName="!border-neutral-700">
                            <div className="relative z-10">
                                <h3 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white mb-4">
                                    Enjoyed this article?
                                </h3>
                                <p className="text-neutral-400 mb-8 max-w-md mx-auto font-light">
                                    Subscribe to our newsletter for more insights on engineering, design, and product building.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        aria-label="Email address"
                                        className="bg-neutral-800 border-neutral-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-500 w-full font-space-grotesk placeholder:text-neutral-600"
                                    />
                                    <button className="px-6 py-3 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors whitespace-nowrap">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-800 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                        </CornerFrame>
                    </div>
                </div>
            </section>

            {/* Read Next */}
            <section className="py-20 bg-neutral-50 border-t border-neutral-200">
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
