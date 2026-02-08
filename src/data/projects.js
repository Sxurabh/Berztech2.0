export const filters = ["All", "Fintech", "Blockchain", "Mobile", "EdTech", "Sustainability", "Travel"];

export const projects = [
  {
    id: "family-fund",
    client: "Family Fund",
    title: "Skip the bank, borrow from those you trust",
    description: "A crowdfunding platform enabling friends and family to lend without traditional banking friction. Built with Next.js, Node.js, and integrated payment infrastructure.",
    image: "/images/laptop.jpg",
    category: "Fintech",
    year: "2023",
    services: ["Web Development", "UI/UX Design", "Payment Integration"],
    stats: { users: "1.5M", volume: "$2M+", rating: "4.9" },
    color: "blue",
    featured: true
  },
  {
    id: "unseal",
    client: "Unseal",
    title: "Get a double-check on your SSL certificates",
    description: "First NFT platform for personal health records. Custom blockchain explorer with real-time transaction verification.",
    image: "/images/meeting.jpg",
    category: "Blockchain",
    year: "2022",
    services: ["Blockchain", "Web3", "Smart Contracts"],
    stats: { nfts: "50K+", volume: "$5M+", users: "12K" },
    color: "purple",
    featured: true
  },
  {
    id: "phobia",
    client: "Phobia",
    title: "Overcome your fears, find your match",
    description: "Dating app matching users based on mutual phobias. React Native app with custom onboarding flow and ML matching algorithm.",
    image: "/images/whiteboard.jpg",
    category: "Mobile",
    year: "2022",
    services: ["Mobile App", "React Native", "ML Integration"],
    stats: { downloads: "100K+", matches: "2M+", retention: "45%" },
    color: "emerald",
    featured: false
  },
  {
    id: "bright-path",
    client: "Bright Path",
    title: "Illuminating educational journeys",
    description: "AI-powered learning platform with personalized curriculum paths. Real-time progress tracking and adaptive assessments.",
    image: "/images/laptop.jpg",
    category: "EdTech",
    year: "2023",
    services: ["Platform Development", "AI Integration", "Analytics"],
    stats: { students: "50K+", courses: "500+", completion: "85%" },
    color: "amber",
    featured: false
  },
  {
    id: "green-life",
    client: "Green Life",
    title: "Sustainable living made simple",
    description: "Carbon footprint tracking app with IoT device integration. Gamified sustainability challenges and community features.",
    image: "/images/meeting.jpg",
    category: "Sustainability",
    year: "2023",
    services: ["Mobile App", "IoT Integration", "Data Viz"],
    stats: { users: "200K+", co2: "1.2M tons", actions: "5M+" },
    color: "rose",
    featured: false
  },
  {
    id: "north-adventures",
    client: "North Adventures",
    title: "Expedition planning reimagined",
    description: "Adventure tourism platform with real-time weather, gear recommendations, and expert-guided trip planning.",
    image: "/images/whiteboard.jpg",
    category: "Travel",
    year: "2022",
    services: ["Web Platform", "API Development", "Maps Integration"],
    stats: { trips: "10K+", guides: "500+", satisfaction: "98%" },
    color: "cyan",
    featured: false
  }
];

export const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", bgLight: "bg-rose-50", border: "border-rose-200" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", bgLight: "bg-cyan-50", border: "border-cyan-200" }
};
