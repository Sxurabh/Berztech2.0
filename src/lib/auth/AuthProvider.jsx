"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // If Supabase isn't configured, skip auth setup
        if (!supabase) {
            setLoading(false);
            return;
        }

        let mounted = true;

        // Get initial user (validated server-side)
        supabase.auth.getUser()
            .then(({ data: { user } }) => {
                if (mounted) {
                    setUser(user ?? null);
                    // Only turn off loading if we aren't waiting for a subscription event immediately
                    // But typically subscription fires fast. 
                    // To be safe against race, we rely on subscription mostly, 
                    // but getUser is authoritative for initial state.
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Auth initialization error:", err);
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signInWithEmail = async (email, password) => {
        if (!supabase) throw new Error("Supabase is not configured");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signInWithOAuth = async (provider, { next } = {}) => {
        if (!supabase) throw new Error("Supabase is not configured");
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        if (next) {
            // Validate 'next' param to prevent open redirects
            if (next.startsWith("/") && !next.startsWith("//")) {
                callbackUrl.searchParams.set("next", next);
            } else {
                console.warn("Invalid next redirect ignored:", next);
            }
        }
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: callbackUrl.toString(),
            },
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, signInWithEmail, signInWithOAuth, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
