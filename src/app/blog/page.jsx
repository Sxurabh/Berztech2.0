import { layoutConfig } from "@/config/layout";
import BlogHeader from "@/components/features/blog/BlogHeader";
import BlogFeed from "@/components/features/blog/BlogFeed";
import Newsletter from "@/components/features/blog/Newsletter";
import { getPosts, getBlogCategories } from "@/lib/data/blogPosts";

export const metadata = {
  title: "Blog",
  description: "Thoughts on engineering, design, and building digital products that matter.",
};

export const revalidate = 86400; // 24 hours


export default async function BlogPage() {
  const posts = await getPosts();
  let categories = await getBlogCategories();

  // Ensure "All" is present
  if (categories && !categories.includes("All")) {
    categories = ["All", ...categories];
  }

  return (
    <div className="w-full  relative">
      {/* Header */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-8 z-10">
        <div className={layoutConfig.maxWidth + " " + layoutConfig.padding.mobile + " " + layoutConfig.padding.tablet + " " + layoutConfig.padding.desktop + " mx-auto"}>
          <BlogHeader />
        </div>
      </section>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32 z-10">
        <BlogFeed initialPosts={posts} categories={categories} />
        <Newsletter />
      </div>
    </div>
  );
}
