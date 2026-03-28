"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiTrello, FiX, FiExternalLink, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { ChatPanel } from "@/components/chat/ChatPanel";

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

  const [viewingRequest, setViewingRequest] = useState(null);
  const [chatProject, setChatProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = (request) => {
    setChatProject(request);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-space-grotesk text-2xl sm:text-3xl md:text-4xl font-medium text-neutral-900 tracking-tight">
              Welcome back, <span className="text-neutral-500">{firstName}</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 mt-1.5 sm:mt-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/contact" className="self-start sm:self-auto">
            <CornerFrame
              className="bg-neutral-900 text-white hover:bg-neutral-800 transition-colors px-4 sm:px-5 py-2 sm:py-2.5 group"
              bracketClassName="border-white/20 group-hover:border-white/40"
            >
              <div className="font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 sm:max-h-[800px] sm:overflow-y-auto sm:pr-2 custom-scrollbar">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="flex flex-col gap-2.5 sm:gap-3 py-3 px-3 sm:px-4 border border-neutral-100 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group relative h-full"
                >
                  <div className="pr-16">
                    <div className="text-sm font-space-grotesk font-bold text-neutral-900 truncate">
                      {request.company || request.name || request.id.slice(0, 8)}
                    </div>
                    {request.email && (
                      <div className="text-[10px] font-jetbrains-mono text-neutral-500 mt-0.5 truncate">
                        {request.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className={`
                                text-[9px] font-jetbrains-mono uppercase px-1.5 py-0.5 rounded shrink-0
                                border ${request.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                        request.status === 'archived' ? 'border-neutral-200 bg-neutral-100 text-neutral-500' :
                          'border-blue-200 bg-blue-50 text-blue-700'}
                            `}>
                      {request.status || "Pending"}
                    </span>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions Hover Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-neutral-100 sm:bg-neutral-100/50 sm:backdrop-blur-sm p-1 rounded-sm border border-neutral-200/50">
                    <button
                      onClick={(e) => { e.preventDefault(); setViewingRequest(request); }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded transition-colors"
                      title="View Details"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleOpenChat(request); }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded transition-colors"
                      title="Open Messages"
                    >
                      <FiMessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/track/board?requestId=${request.id}`}
                      className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded transition-colors"
                      title="Open Kanban Board"
                    >
                      <FiTrello className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm sm:p-6" style={{ margin: 0 }}>
          <div className="w-full max-w-xl bg-white border border-neutral-200 shadow-2xl rounded-sm flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <h2 className="text-xl font-space-grotesk font-bold text-neutral-900 tracking-tight">
                  Request Details
                </h2>
                <p className="text-[10px] font-jetbrains-mono text-neutral-500 mt-0.5">
                  Submitted {new Date(viewingRequest.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors rounded-sm"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Client Information */}
              <div>
                <h3 className="text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-3">
                  Client Information
                </h3>
                <div className="bg-neutral-50/50 border border-neutral-100 p-4 rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Company</div>
                    <div className="font-space-grotesk font-medium text-neutral-900">{viewingRequest.company || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Contact Name</div>
                    <div className="font-space-grotesk font-medium text-neutral-900">{viewingRequest.name}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Email Address</div>
                    <div className="font-space-grotesk font-medium text-neutral-900">{viewingRequest.email}</div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-3">
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Services Required</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(viewingRequest.services) ? viewingRequest.services : [viewingRequest.services]).map((s, i) => (
                          <span key={i} className="text-[10px] font-jetbrains-mono text-neutral-700 bg-neutral-100 px-2 py-1 rounded-sm capitalize">
                            {s || "General"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Estimated Budget</div>
                      <div className="font-space-grotesk font-medium text-neutral-900">{viewingRequest.budget || "Not specified"}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-400 mb-1">Message / Requirements</div>
                    <div className="p-4 bg-white border border-neutral-200 rounded-sm font-space-grotesk text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      {viewingRequest.message || "No additional message provided."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
              <button
                onClick={() => setViewingRequest(null)}
                className="px-5 py-2 text-[10px] font-jetbrains-mono font-medium uppercase tracking-widest text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900 hover:bg-white rounded-sm transition-colors"
              >
                Close
              </button>
              <Link
                href={`/track/board?requestId=${viewingRequest.id}`}
                className="px-5 py-2 text-[10px] font-jetbrains-mono font-medium uppercase tracking-widest text-white bg-neutral-900 hover:bg-neutral-800 rounded-sm shadow-sm transition-colors flex items-center gap-2"
              >
                Open in Board <FiExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {chatProject && (
        <ChatPanel
          projectId={chatProject.id}
          projectName={chatProject.company || chatProject.name || "Project"}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      )}
    </div>
  );
}
