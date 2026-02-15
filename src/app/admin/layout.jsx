"use client";

import { Toaster } from "react-hot-toast";
import { layoutConfig } from "@/config/layout";

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

            {/* Main Content Wrapper - Centered without sidebar */}
            <main className="min-h-screen flex flex-col transition-all duration-300">
                <div className="flex-grow py-8">
                    {/* Content Container */}
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