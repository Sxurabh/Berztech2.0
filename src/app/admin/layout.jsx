"use client";

import { Toaster } from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-neutral-950">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#1a1a1a",
                        color: "#e5e5e5",
                        border: "1px solid #333",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                    },
                    success: {
                        iconTheme: { primary: "#10b981", secondary: "#1a1a1a" },
                    },
                    error: {
                        iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" },
                    },
                }}
            />
            <AdminSidebar />
            <main className="lg:pl-60 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
