"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { CornerFrame } from "@/components/ui/CornerFrame";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/admin";
    const { signInWithEmail, signInWithOAuth } = useAuth();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmail(email, password);
            router.push(redirect);
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        setError("");
        try {
            await signInWithOAuth(provider);
        } catch (err) {
            setError(err.message || `Failed to sign in with ${provider}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Back to site link */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <span>←</span>
                        Back to site
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-px w-8 bg-neutral-300" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                            Admin Access
                        </span>
                        <div className="h-px w-8 bg-neutral-300" />
                    </div>
                    <h1 className="font-space-grotesk text-3xl sm:text-4xl font-medium text-neutral-900 tracking-tight">
                        Sign In
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Access the Berztech admin dashboard
                    </p>
                </div>

                <CornerFrame
                    className="bg-white border-neutral-200 p-6 sm:p-8"
                    bracketClassName="w-3 h-3 border-neutral-300"
                >
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-6 p-3 border border-red-200 bg-red-50 text-red-600 text-sm font-jetbrains-mono rounded-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 font-jetbrains-mono text-sm rounded-sm"
                        >
                            <FaGoogle className="w-4 h-4" />
                            Continue with Google
                        </button>
                        <button
                            onClick={() => handleOAuthLogin("github")}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 font-jetbrains-mono text-sm rounded-sm"
                        >
                            <FaGithub className="w-4 h-4" />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Or sign in with email
                            </span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors font-jetbrains-mono text-sm rounded-sm"
                                placeholder="admin@berztech.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors font-jetbrains-mono text-sm rounded-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full px-4 py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </motion.button>
                    </form>
                </CornerFrame>

                {/* Footer */}
                <p className="mt-6 text-center text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                    Protected Area • Berztech Inc.
                </p>
            </motion.div>
        </div>
    );
}