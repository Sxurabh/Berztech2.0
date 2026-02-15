"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

  // Collapsible state
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 flex items-end justify-between"
        >
          <div>
            <h1 className="font-space-grotesk text-3xl sm:text-4xl font-medium text-neutral-900 tracking-tight">
              Welcome back, <span className="text-neutral-500">{firstName}</span>
            </h1>
            <p className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 mt-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/contact">
            <CornerFrame
              className="bg-neutral-900 text-white hover:bg-neutral-800 transition-colors px-5 py-2.5 group"
              bracketClassName="border-white/20 group-hover:border-white/40"
            >
              <div className="font-jetbrains-mono text-xs uppercase tracking-widest">
                New Request +
              </div>
            </CornerFrame>
          </Link>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded-sm" />)}
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CornerFrame className="py-16 text-center border-neutral-200 bg-white" bracketClassName="w-3 h-3 border-neutral-300">
              <h3 className="font-space-grotesk text-xl text-neutral-900 mb-2">No active requests</h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
                Ready to start your next project? We are here to help you build something extraordinary.
              </p>
              <Link href="/contact" className="text-sm font-jetbrains-mono uppercase tracking-widest text-neutral-900 hover:text-neutral-600 underline underline-offset-4">
                Start a request →
              </Link>
            </CornerFrame>
          </motion.div>
        ) : (
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {requests.map((request, index) => {
              const isExpanded = expandedId === request.id;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CornerFrame
                    className="bg-white border border-neutral-200 hover:border-neutral-300 transition-colors group overflow-hidden"
                    bracketClassName="w-3 h-3 border-neutral-300 group-hover:border-neutral-400"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleExpand(request.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h3 className="font-space-grotesk text-xl font-medium text-neutral-900">
                            {request.company || request.id.slice(0, 8)}
                          </h3>
                          <span className={`
                            px-2 py-0.5 text-[10px] font-jetbrains-mono uppercase tracking-wider border rounded-full
                            ${request.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              request.status === 'archived' ? 'bg-neutral-100 text-neutral-500 border-neutral-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'}
                          `}>
                            {request.status || "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-neutral-400">
                          <span className="text-xs font-jetbrains-mono hidden sm:inline-block">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>

                      {!isExpanded && (
                        <p className="mt-2 text-sm text-neutral-500 font-space-grotesk truncate">
                          {request.message}
                        </p>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                          <div className="px-6 pb-8 border-t border-neutral-100 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                              <div>
                                <h4 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400 mb-2">Project Details</h4>
                                <p className="text-sm font-space-grotesk text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                  {request.message}
                                </p>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400 mb-1">Services</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(request.services || []).map((service, i) => (
                                      <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-jetbrains-mono rounded-sm">
                                        {service}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400 mb-1">Budget</h4>
                                  <p className="text-sm font-jetbrains-mono text-neutral-900">{request.budget}</p>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-6">
                              <h4 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400 mb-4">Request Status</h4>
                              <RequestTimeline currentStage={request.status || "discover"} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CornerFrame>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
