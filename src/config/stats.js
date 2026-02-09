export const companyStats = {
  years: { value: 7, suffix: "+", label: "Years Active", sublabel: "Since 2017", description: "Experience" },
  projects: { value: 50, suffix: "+", label: "Projects", sublabel: "Delivered", description: "Delivered" },
  retention: { value: 98, suffix: "%", label: "Retention", sublabel: "Client Rate", description: "Client Retention" },
  team: { value: 12, suffix: "", label: "Team Members", sublabel: "Engineers & Designers", description: "Experts" },
  response: { value: 12, suffix: "ms", label: "Avg Response", sublabel: "Global Latency", description: "Response Time" },
  rating: { value: 4.9, suffix: "", label: "Rating", sublabel: "Clutch Review", description: "Average Rating" }
};

export const aboutStats = [
  companyStats.years,
  companyStats.projects,
  companyStats.team,
  companyStats.retention
];

export const homeStats = [
  companyStats.projects,
  companyStats.retention,
  companyStats.response,
  companyStats.years
];
