"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
    FiGrid,
    FiBriefcase,
    FiFileText,
    FiLogOut,
    FiArrowLeft,
    FiMenu,
    FiX,
    FiUser,
    FiMessageSquare,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { CornerFrame } from "@/components/ui/CornerFrame";

const navItems = [
    { title: "Dashboard", href: "/admin", icon: FiGrid },
    { title: "Projects", href: "/admin/projects", icon: FiBriefcase },
    { title: "Blog Posts", href: "/admin/blog", icon: FiFileText },
    { title: "Testimonials", href: "/admin/testimonials", icon: FiMessageSquare },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isActive = (href) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileOpen]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo / Brand */}
            <div className="p-3 sm:p-4 border-b border-neutral-200">
                <Link href="/admin" className="flex items-center gap-3">
                    <CornerFrame
                        className="w-10 h-10 bg-neutral-900 flex items-center justify-center"
                        bracketClassName="w-2 h-2 border-white"
                    >
                        <span className="font-jetbrains-mono text-sm font-bold text-white">
                            BT
                        </span>
                    </CornerFrame>
                    <div>
                        <div className="font-space-grotesk text-base font-medium text-neutral-900">
                            Berztech
                        </div>
                        <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                            Admin
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 text-sm font-jetbrains-mono transition-all duration-200 rounded-sm
                                ${active
                                    ? "bg-neutral-900 text-white"
                                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                                }
                            `}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                            {active && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section - Compact Dropdown */}
            <div className="p-3 border-t border-neutral-200">
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-jetbrains-mono text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all rounded-sm"
                    >
                        <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center rounded-sm">
                            <span className="font-jetbrains-mono text-xs font-bold text-neutral-700">
                                {user?.email?.[0]?.toUpperCase() || "A"}
                            </span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <div className="truncate text-xs">{user?.email || "Admin"}</div>
                        </div>
                        <FiUser className="w-4 h-4 flex-shrink-0" />
                    </button>

                    {/* Compact User Dropdown */}
                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-neutral-200 shadow-lg rounded-sm overflow-hidden z-50"
                            >
                                <div className="p-2 border-b border-neutral-100">
                                    <p className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest truncate px-2">
                                        {user?.email}
                                    </p>
                                </div>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-jetbrains-mono text-neutral-600 hover:bg-neutral-50 transition-colors"
                                >
                                    <FiArrowLeft className="w-3.5 h-3.5" />
                                    Back to Site
                                </Link>
                                <button
                                    onClick={async () => {
                                        await signOut();
                                        setUserMenuOpen(false);
                                        window.location.href = "/";
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-jetbrains-mono text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-left"
                                >
                                    <FiLogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200">
                <div className="flex items-center justify-between px-4 h-16">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center">
                            <span className="font-jetbrains-mono text-xs font-bold text-white">
                                BT
                            </span>
                        </div>
                        <span className="font-space-grotesk text-sm font-medium text-neutral-900">
                            Admin
                        </span>
                    </Link>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar - Slide-in */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-200 flex flex-col z-50 shadow-2xl lg:hidden"
                        >
                            <SidebarContent />
                            <div className="mt-auto p-4 border-t border-neutral-100">
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
                                >
                                    <FiX className="w-4 h-4" />
                                    Close Menu
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar - Fixed & Always Visible */}
            <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-200 flex-col z-30">
                <SidebarContent />
            </aside>
        </>
    );
}