import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";
import ProjectGallery from "@/components/features/work/ProjectGallery";
import { getProjectById } from "@/lib/data/projects";
import { typography, spacing, serviceColors } from "@/lib/design-tokens";

export async function generateMetadata(props) {
  const params = await props.params;
  const project = await getProjectById(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Berztech`,
    description: project.description,
  };
}

export default async function ProjectPage(props) {
  const params = await props.params;
  const project = await getProjectById(params.slug);

  if (!project) {
    notFound();
  }

  const colors = serviceColors[project.color] || serviceColors.blue;

  // Combine cover image and gallery images
  const gallery = [
    project.image,
    ...(project.gallery || [])
  ].filter(Boolean);

  // Parse stats safely
  let stats = {};
  if (typeof project.stats === 'string') {
    try {
      stats = JSON.parse(project.stats);
    } catch (e) {
      console.error("Failed to parse project stats:", e);
    }
  } else {
    stats = project.stats || {};
  }

  return (
    <main className="w-full relative">
      {/* Navigation / Breadcrumb */}
      <div className="border-b border-neutral-200 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className={`${spacing.container.wrapper} h-14 flex items-center justify-between`}>
          <Link
            href="/work"
            className="flex items-center gap-2 text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <span>←</span>
            <span>Back to Work</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-xs font-jetbrains-mono text-neutral-400">
              {project.year}
            </span>
            <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-widest ${colors.bgLight} ${colors.text} border ${colors.border}`}>
              {project.category}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-neutral-100 bg-neutral-50/30">
        <div className={spacing.container.wrapper}>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6 sm:hidden">
              <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-widest ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                {project.category}
              </span>
              <span className="text-[10px] font-jetbrains-mono text-neutral-400">{project.year}</span>
            </div>

            <h1 className={`${typography.fontFamily.sans} text-4xl sm:text-5xl lg:text-7xl font-medium text-neutral-900 tracking-tight leading-[0.9] mb-8`}>
              {project.title}
            </h1>

            <p className="text-lg sm:text-2xl text-neutral-600 leading-relaxed max-w-3xl font-light">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Image / Gallery */}
      <section className="py-8 sm:py-12 bg-white">
        <div className={spacing.container.wrapper}>
          <CornerFrame
            className="bg-white p-2 sm:p-3 border-neutral-200 shadow-xl"
            bracketClassName={`w-6 h-6 ${colors.bracket}`}
          >
            <ProjectGallery images={gallery} title={project.title} />
          </CornerFrame>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12 sm:py-20">
        <div className={spacing.container.wrapper}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

            {/* Sidebar (Sticky) */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="sticky top-24 space-y-8">
                {/* Client Info */}
                <CornerFrame className="bg-neutral-50 border-neutral-200 p-6" bracketClassName="w-3 h-3 border-neutral-300">
                  <h3 className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-6 pb-2 border-b border-neutral-200">
                    Project Metadata
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Client</div>
                      <div className="text-base font-medium text-neutral-900">{project.client}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Year</div>
                      <div className="text-base font-medium text-neutral-900">{project.year}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Category</div>
                      <div className="text-base font-medium text-neutral-900">{project.category}</div>
                    </div>
                  </div>
                </CornerFrame>

                {/* Services */}
                {project.services && project.services.length > 0 && (
                  <div className="bg-white border border-neutral-200 p-6">
                    <h3 className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-4">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <span key={service} className="px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-700 bg-neutral-100 border border-neutral-200">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href="/contact"
                  className="block w-full text-center px-6 py-4 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/10"
                >
                  Start Similar Project
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <h2 className={`${typography.fontFamily.sans} text-2xl sm:text-3xl font-medium text-neutral-900 mb-8 flex items-center gap-3`}>
                <span className={`w-8 h-1 ${colors.bg}`}></span>
                Project Overview
              </h2>

              <div className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed font-light">
                <div className="whitespace-pre-line">
                  {project.long_description || project.description}
                </div>
              </div>

              {/* Stats Grid */}
              {Object.keys(stats).length > 0 && (
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(stats).map(([label, value], i) => (
                    <CornerFrame
                      key={label}
                      className={`p-6 ${colors.bgLight} border ${colors.border} flex flex-col justify-between min-h-[140px]`}
                      bracketClassName={`w-3 h-3 ${colors.bracket}`}
                    >
                      <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                        {label}
                      </div>
                      <div className={`${typography.fontFamily.sans} text-4xl sm:text-5xl font-medium text-neutral-900 tracking-tight`}>
                        {value}
                      </div>
                    </CornerFrame>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Next Project Navigation */}
      <section className="py-12 border-t border-neutral-100 bg-neutral-50">
        <div className={spacing.container.wrapper}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400">Next Case Study</span>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-900 font-medium hover:text-neutral-600 transition-colors"
            >
              View All Projects
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}