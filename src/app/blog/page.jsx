import { layoutConfig } from "@/config/layout";
import GridBackground from "@/components/ui/GridBackground";
import BlogHeader from "@/components/features/blog/BlogHeader";
import BlogFeed from "@/components/features/blog/BlogFeed";
import Newsletter from "@/components/features/blog/Newsletter";

export const metadata = {
  title: "Blog | Berztech",
  description: "Thoughts on engineering, design, and building digital products that matter.",
};

export default function BlogPage() {
  return (
    <div className="w-full bg-white relative">
      {/* Grid Background - Fixed like homepage */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <GridBackground opacity={0.04} size={40} />
      </div>
      
      {/* Header */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-8 z-10">
        <div className={layoutConfig.maxWidth + " " + layoutConfig.padding.mobile + " " + layoutConfig.padding.tablet + " " + layoutConfig.padding.desktop + " mx-auto"}>
          <BlogHeader />
        </div>
      </section>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32 z-10">
        <BlogFeed />
        <Newsletter />
      </div>
    </div>
  );
}
