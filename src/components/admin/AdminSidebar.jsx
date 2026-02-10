"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
    FiGrid,
    FiBriefcase,
    FiFileText,
    FiLogOut,
    FiArrowLeft,
    FiMenu,
    FiX,
} from "react-icons/fi";
import { useState } from "react";

const navItems = [
    { title: "Dashboard", href: "/admin", icon: FiGrid },
    { title: "Projects", href: "/admin/projects", icon: FiBriefcase },
    { title: "Blog Posts", href: "/admin/blog", icon: FiFileText },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <>
            {/* Logo / Brand */}
            <div className="p-5 border-b border-neutral-800">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white flex items-center justify-center">
                        <span className="font-jetbrains-mono text-xs font-bold text-neutral-900">
                            BT
                        </span>
                    </div>
                    <div>
                        <div className="font-space-grotesk text-sm font-semibold text-white">
                            Berztech
                        </div>
                        <div className="text-[9px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                            Admin Panel
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                flex items-center gap-3 px-3 py-2.5 text-sm font-jetbrains-mono transition-all duration-200
                ${active
                                    ? "bg-white/10 text-white border-l-2 border-white"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                }
              `}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div className="p-3 border-t border-neutral-800 space-y-1">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-jetbrains-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Site
                </Link>
                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-jetbrains-mono text-neutral-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 border border-neutral-800 text-white"
            >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar — desktop: fixed, mobile: slide-in */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-60 bg-neutral-950 border-r border-neutral-800
          flex flex-col z-40 transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
