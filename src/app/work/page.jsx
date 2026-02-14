import { getProjects } from "@/lib/data/projects";
import WorkHeader from "@/components/features/work/WorkHeader";
import WorkList from "@/components/features/work/WorkList";

export const metadata = {
  title: "Our Work",
  description: "Explore our portfolio of digital products and engineering solutions.",
};

export default async function WorkPage() {
  const projects = await getProjects();

  // Calculate dynamic filters from actual data
  const categories = new Set(projects.map((p) => p.category).filter(Boolean));
  const filters = ["All", ...Array.from(categories).sort()];

  return (
    <div className="w-full relative">
      <WorkHeader />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32 z-10">
        <WorkList initialProjects={projects} filters={filters} />
      </div>
    </div>
  );
}