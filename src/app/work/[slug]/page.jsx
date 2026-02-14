import { notFound } from "next/navigation";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";
import ProjectGallery from "@/components/features/work/ProjectGallery";
import { getProjectById } from "@/lib/data/projects";

// Color mappings matching the rest of the app
const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200" },
  neutral: { bg: "bg-neutral-500", text: "text-neutral-600", bgLight: "bg-neutral-50", border: "border-neutral-200" }
};

export async function generateMetadata({ params }) {
  const project = await getProjectById(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Berztech`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }) {
  const project = await getProjectById(params.slug);

  if (!project) {
    notFound();
  }

  const colors = colorSchemes[project.color] || colorSchemes.neutral;
  // Use gallery if available (from JSON or array column), otherwise fallback to main image
  const gallery = project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0
    ? project.gallery
    : (project.image ? [project.image] : []);

  // Parse stats if string
  const stats = typeof project.stats === 'string' ? JSON.parse(project.stats) : (project.stats || {});

  return (
    <main className="w-full bg-white relative">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-neutral-500">
            <Link href="/work" className="hover:text-neutral-900 transition-colors">Work</Link>
            <span>/</span>
            <span className="text-neutral-900">{project.client}</span>
          </div>

          {/* Header */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                {project.category}
              </span>
              <span className="text-[10px] font-jetbrains-mono text-neutral-400">{project.year}</span>
            </div>

            <h1 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-tight mb-6">
              {project.title}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Image / Gallery */}
      <section className="mb-12 sm:mb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ProjectGallery images={gallery} title={project.title} />
        </div>
      </section>

      {/* Project Details Grid */}
      <section className="py-12 sm:py-16 border-y border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: "Client", value: project.client },
              { label: "Year", value: project.year },
              { label: "Category", value: project.category },
              // Fallback duration if not in DB
              { label: "Status", value: "Completed" },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-1">
                  {item.label}
                </div>
                <div className="font-space-grotesk text-base sm:text-lg font-medium text-neutral-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Use description again as long description if no separate field */}
              <h2 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 mb-6">
                Project Overview
              </h2>
              <div className="text-neutral-600 leading-relaxed mb-8 text-lg whitespace-pre-line">
                {/* If long_description exists, use it. Else description. */}
                {project.long_description || project.description}
              </div>

              {/* Stats */}
              {Object.keys(stats).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                  {Object.entries(stats).map(([label, value], i) => (
                    <div key={label} className={`p-4 ${colors.bgLight} border ${colors.border}`}>
                      <div className="font-space-grotesk text-2xl font-medium text-neutral-900">{value}</div>
                      <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 mt-1">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Services */}
              {project.services && project.services.length > 0 && (
                <CornerFrame className="bg-neutral-50 border-neutral-200 p-4" bracketClassName="w-3 h-3 border-neutral-300">
                  <h4 className="text-[11px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Services
                  </h4>
                  <ul className="space-y-2">
                    {project.services.map((service) => (
                      <li key={service} className="text-sm text-neutral-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-neutral-400" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </CornerFrame>
              )}

              {/* CTA */}
              <div>
                <Link
                  href="/contact"
                  className="block w-full text-center px-5 py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Start Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <span>←</span>
              <span>All Projects</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}