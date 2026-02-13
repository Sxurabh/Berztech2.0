"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { CornerFrame } from "@/components/ui/CornerFrame";
import RequestTimeline from "@/components/ui/RequestTimeline";

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
    <div className="min-h-screen bg-neutral-100 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="font-space-grotesk text-xl font-medium text-neutral-900">My Requests</h1>
          <p className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </motion.div>

        <CornerFrame className="bg-white border border-neutral-200 p-3" bracketClassName="w-2.5 h-2.5 border-neutral-400">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-sm" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-neutral-500 font-jetbrains-mono">No requests yet</p>
              <Link href="/contact" className="mt-2 inline-block text-xs text-neutral-700 hover:text-neutral-900 underline">
                Start a request →
              </Link>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[400px] pr-1 space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="py-3 px-3 bg-neutral-50 rounded-sm border border-neutral-100">
                  <div className="mb-3">
                    <div className="text-xs font-space-grotesk text-neutral-900 truncate">{request.company || request.name}</div>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-500 mt-0.5">
                      {new Date(request.created_at).toLocaleDateString()}
                      {request.budget && ` • ${request.budget}`}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-100">
                    <p className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">Project timeline</p>
                    <RequestTimeline currentStage={request.status || "discover"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CornerFrame>
      </div>
    </div>
  );
}

