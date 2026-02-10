"use client";

import { Toaster } from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen">
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

            {/* Sidebar - Fixed position */}
            <AdminSidebar />

            {/* Main Content - Aligned with max-w-5xl container system */}
            <main className="

             min-h-screen">
                {/* Mobile: Add top padding for header, Desktop: Normal padding */}
                <div className="pt-16 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
                    {/* Compact container matching other components */}
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}