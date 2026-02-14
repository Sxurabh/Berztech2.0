
import { FiTwitter, FiGithub, FiLinkedin, FiDribbble } from "react-icons/fi";

// Social icons map for consistency
export const socialLinks = [
    { name: "Twitter", href: "https://twitter.com", icon: FiTwitter },
    { name: "GitHub", href: "https://github.com", icon: FiGithub },
    { name: "LinkedIn", href: "https://linkedin.com", icon: FiLinkedin },
    { name: "Dribbble", href: "https://dribbble.com", icon: FiDribbble },
];

export const footerLinks = {
    services: {
        title: "Services",
        links: [
            { label: "Web Development", href: "/services/web" },
            { label: "Mobile Apps", href: "/services/mobile" },
            { label: "UI/UX Design", href: "/services/design" },
            { label: "Strategy", href: "/services/strategy" },
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
            { label: "Documentation", href: "#" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ]
    }
};
