
import { FiTwitter, FiGithub, FiLinkedin, FiDribbble } from "react-icons/fi";

// Social icons map for consistency
export const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/berztech", icon: FiTwitter },
    { name: "GitHub", href: "https://github.com/berztech", icon: FiGithub },
    { name: "LinkedIn", href: "https://linkedin.com/company/berztech", icon: FiLinkedin },
    { name: "Dribbble", href: "https://dribbble.com/berztech", icon: FiDribbble },
];

export const footerLinks = {
    services: {
        title: "Services",
        links: [
            { label: "Web Development", href: "/process" },
            { label: "Mobile Apps", href: "/work" },
            { label: "UI/UX Design", href: "/work" },
            { label: "Strategy", href: "/contact" },
        ]
    },
    company: {
        title: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Work", href: "/work" },
            { label: "Process", href: "/process" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
        ]
    },
    resources: {
        title: "Resources",
        links: [
            { label: "Case Studies", href: "/work" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ]
    }
};
