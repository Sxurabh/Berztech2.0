export const categories = ["All", "Engineering", "Design", "Strategy", "Culture"];

export const posts = [
  {
    id: 1,
    title: "Why We Chose Next.js for Enterprise Applications",
    excerpt: "A deep dive into our decision-making process and the technical benefits that convinced us to standardize on Next.js for client projects.",
    category: "Engineering",
    author: "Alex Chen",
    date: "Jan 15, 2024",
    readTime: "8 min read",
    image: "/images/laptop.jpg",
    featured: true,
    color: "blue"
  },
  {
    id: 2,
    title: "The Art of Minimalist Interface Design",
    excerpt: "How restraint and intentionality create more powerful user experiences than feature-heavy alternatives.",
    category: "Design",
    author: "Sarah Miller",
    date: "Jan 10, 2024",
    readTime: "6 min read",
    image: "/images/whiteboard.jpg",
    featured: false,
    color: "purple"
  },
  {
    id: 3,
    title: "Building Design Systems That Scale",
    excerpt: "Lessons learned from creating component libraries for fast-growing startups and enterprise teams.",
    category: "Design",
    author: "James Wilson",
    date: "Jan 5, 2024",
    readTime: "10 min read",
    image: "/images/meeting.jpg",
    featured: false,
    color: "emerald"
  },
  {
    id: 4,
    title: "Technical Debt: A Strategic Perspective",
    excerpt: "When to pay it down, when to leverage it, and how to communicate about it with non-technical stakeholders.",
    category: "Strategy",
    author: "Alex Chen",
    date: "Dec 28, 2023",
    readTime: "7 min read",
    image: "/images/laptop.jpg",
    featured: false,
    color: "amber"
  },
  {
    id: 5,
    title: "Remote Collaboration: Our Playbook",
    excerpt: "Tools, rituals, and mindsets that keep our distributed team aligned and productive.",
    category: "Culture",
    author: "Emma Davis",
    date: "Dec 20, 2023",
    readTime: "5 min read",
    image: "/images/meeting.jpg",
    featured: false,
    color: "rose"
  },
  {
    id: 6,
    title: "TypeScript at Scale: Best Practices",
    excerpt: "Advanced patterns and architectural decisions for maintaining type safety in large codebases.",
    category: "Engineering",
    author: "James Wilson",
    date: "Dec 15, 2023",
    readTime: "12 min read",
    image: "/images/whiteboard.jpg",
    featured: false,
    color: "blue"
  }
];

export const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", bgLight: "bg-rose-50", border: "border-rose-200" }
};
