"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { CornerFrame } from "@/components/ui/CornerFrame";

const statusStyles = {
  submitted: "text-neutral-700 bg-neutral-100 border-neutral-200",
  reviewing: "text-amber-700 bg-amber-50 border-amber-200",
  in_progress: "text-blue-700 bg-blue-50 border-blue-200",
  completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  on_hold: "text-neutral-600 bg-neutral-100 border-neutral-300",
};

function StatusBadge({ status }) {
  const normalized = (status || "submitted").toLowerCase();
  const classes =
    statusStyles[normalized] || statusStyles.submitted;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-jetbrains-mono uppercase tracking-widest ${classes}`}
    >
      {normalized.replace("_", " ")}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function loadRequests() {
      try {
        const { data, error } = await supabase
          .from("requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error) {
          setRequests(data || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  const firstName =
    user?.user_metadata?.full_name?.split(" ")?.[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen bg-neutral-50/30 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-4 bg-neutral-300" />
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                Client Dashboard
              </span>
            </div>
            <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
              Welcome back,{" "}
              <span className="text-neutral-600">{firstName}</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-600 max-w-xl">
              Track the status of your project requests and see how things are progressing with Berztech.
            </p>
          </div>
          <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </motion.div>

        {/* Content */}
        <CornerFrame
          className="bg-white border-neutral-200 p-4 sm:p-6"
          bracketClassName="w-3 h-3 border-neutral-300"
        >
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-neutral-100 animate-pulse rounded-sm"
                />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-500 font-jetbrains-mono">
                You don't have any active requests yet.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-2 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-900 border-b border-neutral-900 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
              >
                Start a new project request
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-space-grotesk text-sm text-neutral-900 truncate">
                        {request.company || request.name}
                      </span>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-jetbrains-mono text-neutral-500">
                      <span>
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      {request.budget && (
                        <>
                          <span className="w-px h-3 bg-neutral-300" />
                          <span>{request.budget}</span>
                        </>
                      )}
                      {request.services?.length > 0 && (
                        <>
                          <span className="w-px h-3 bg-neutral-300" />
                          <span className="truncate max-w-xs">
                            {request.services.join(" • ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {request.message && (
                    <p className="sm:max-w-xs text-xs text-neutral-500 font-jetbrains-mono line-clamp-2">
                      {request.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CornerFrame>
      </div>
    </div>
  );
}

