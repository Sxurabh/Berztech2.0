"use client";

import { Toaster } from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { layoutConfig } from "@/config/layout";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-neutral-50/30">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#ffffff",
                        color: "#171717",
                        border: "1px solid #e5e5e5",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    },
                    success: {
                        iconTheme: { primary: "#10b981", secondary: "#ffffff" },
                    },
                    error: {
                        iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
                    },
                }}
            />

            {/* Sidebar - Fixed position (handled internally by component) */}
            <AdminSidebar />

            {/* Main Content Wrapper 
                lg:pl-64: Pushes content right to accommodate the 16rem (64) fixed sidebar on desktop
            */}
            <main className=" min-h-screen flex flex-col transition-all duration-300">
                {/* Vertical Spacing
                    pt-16: Clears the fixed mobile header (h-16) from AdminSidebar
                    lg:pt-8: Standard top spacing for desktop
                    pb-8: Standard bottom spacing
                */}
                <div className="flex-grow pt-16 lg:pt-8 pb-8">

                    {/* Content Container - Matched to Public Site
                        We apply max-width AND padding to the same element here, 
                        replicating the behavior of src/components/ui/Container.jsx
                    */}
                    <div className={`
                        mx-auto w-full
                        ${layoutConfig.maxWidth}
                        ${layoutConfig.padding.mobile}
                        ${layoutConfig.padding.tablet}
                        ${layoutConfig.padding.desktop}
                    `}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}