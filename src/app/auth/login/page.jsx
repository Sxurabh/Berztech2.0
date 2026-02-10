"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { CornerFrame } from "@/components/ui/CornerFrame";

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
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-px w-8 bg-neutral-700" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                            Admin Access
                        </span>
                        <div className="h-px w-8 bg-neutral-700" />
                    </div>
                    <h1 className="font-space-grotesk text-3xl sm:text-4xl font-medium text-white tracking-tight">
                        Sign In
                    </h1>
                    <p className="mt-2 text-sm text-neutral-400">
                        Access the Berztech admin dashboard
                    </p>
                </div>

                <CornerFrame
                    className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm p-6 sm:p-8"
                    bracketClassName="w-5 h-5 border-neutral-700"
                >
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-6 p-3 border border-red-800/50 bg-red-950/30 text-red-400 text-sm font-jetbrains-mono"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 hover:text-white transition-all duration-300 font-jetbrains-mono text-sm"
                        >
                            <FaGoogle className="w-4 h-4" />
                            Continue with Google
                        </button>
                        <button
                            onClick={() => handleOAuthLogin("github")}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 hover:text-white transition-all duration-300 font-jetbrains-mono text-sm"
                        >
                            <FaGithub className="w-4 h-4" />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-neutral-900/50 px-3 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
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
                                className="w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-colors font-jetbrains-mono text-sm"
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
                                className="w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-colors font-jetbrains-mono text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full px-4 py-3 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="mt-6 text-center text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
                    Protected Area • Berztech Inc.
                </p>
            </motion.div>
        </div>
    );
}
