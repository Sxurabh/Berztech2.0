import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";
import ProjectGallery from "@/components/features/work/ProjectGallery";
import { getProjectById, getProjects } from "@/lib/data/projects";
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

  // Next Case Study Logic
  const allProjects = await getProjects();
  const currentIndex = allProjects.findIndex(p => p.id === project.id);
  const nextProject = allProjects.length > 1
    ? allProjects[(currentIndex + 1) % allProjects.length]
    : null;

  return (
    <main className="w-full relative bg-transparent overflow-hidden">
      {/* Navigation / Breadcrumb - Minimal Floating Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-6 sm:pt-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/work"
            className="group flex items-center gap-3 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <span className="w-8 h-[1px] bg-neutral-300 group-hover:bg-neutral-500 group-hover:w-12 transition-all duration-300"></span>
            <span>Back to Work</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-xs font-jetbrains-mono text-neutral-500">
              {project.year}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Hero Section */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-end pb-12 sm:pb-16 pt-32 bg-transparent z-0">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-6xl relative z-20">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className={`px-3 py-1 text-xs font-jetbrains-mono uppercase tracking-widest bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-full`}>
                {project.category}
              </span>
            </div>

            <h1 className={`${typography.fontFamily.sans} text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-medium text-neutral-900 tracking-tight leading-[0.9] mb-8 sm:mb-12`}>
              {project.title}
            </h1>

            <p className="text-xl sm:text-3xl text-neutral-600 leading-relaxed max-w-3xl font-light">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Image / Gallery */}
      <section className="py-8 sm:py-12 bg-transparent relative z-10 px-4">
        <div className="max-w-6xl mx-auto">
          <CornerFrame
            className="bg-white p-2 sm:p-3 border-neutral-200 shadow-xl"
            bracketClassName={`w-6 h-6 ${colors.bracket}`}
          >
            <ProjectGallery images={gallery} title={project.title} />
          </CornerFrame>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12 sm:py-20 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h2 className={`${typography.fontFamily.sans} text-2xl sm:text-4xl font-medium text-neutral-900 mb-8 sm:mb-12 flex items-center gap-4`}>
                <span className={`w-12 h-[2px] ${colors.bg}`}></span>
                Project Overview
              </h2>

              <div className="prose prose-neutral prose-lg lg:prose-xl max-w-none text-neutral-600 leading-relaxed font-light">
                <div className="whitespace-pre-line first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-4 first-letter:text-neutral-900 first-letter:font-medium">
                  {project.long_description || project.description}
                </div>
              </div>

              {/* Stats Grid - Immersive Style */}
              {Object.keys(stats).length > 0 && (
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
                  {Object.entries(stats).map(([label, value], i) => (
                    <div
                      key={label}
                      className="p-8 sm:p-12 bg-white hover:bg-neutral-50 transition-colors flex flex-col justify-between min-h-[200px]"
                    >
                      <div className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400 mb-8">
                        {label}
                      </div>
                      <div className={`${typography.fontFamily.sans} text-5xl sm:text-6xl font-medium text-neutral-900 tracking-tight`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Next Project Navigation */}
      <section className="py-24 sm:py-32 bg-transparent relative overflow-hidden group border-t border-neutral-100">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10 text-center">
          <span className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-6 block">Next Case Study</span>

          <Link
            href={nextProject ? `/work/${nextProject.slug}` : "/work"}
            className="inline-block"
          >
            <h2 className={`${typography.fontFamily.sans} text-4xl sm:text-6xl lg:text-8xl font-medium text-neutral-900 tracking-tight hover:text-neutral-500 transition-colors duration-500`}>
              {nextProject ? nextProject.title : "View All Projects"}
            </h2>
          </Link>

          <div className="mt-12 flex justify-center">
            <Link
              href="/work"
              className="group/btn flex items-center gap-3 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <span>View Project Index</span>
              <span className="w-8 h-[1px] bg-neutral-400 group-hover/btn:bg-neutral-900 group-hover/btn:w-12 transition-all duration-300"></span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}