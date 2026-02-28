"use client";

import { useState } from "react";
import Link from "next/link";
import { FiInbox, FiTrello, FiExternalLink, FiX, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import TrackDetailsModal from "@/components/features/track/TrackDetailsModal";
import { trackTableColumns } from "@/components/features/track/TrackTableColumns";
import { useRequests } from "@/lib/hooks/useRequests";

export default function TrackPage() {
    const { requests, loading, error } = useRequests("/api/requests");
    const [viewingRequest, setViewingRequest] = useState(null);

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6">
                <div className="bg-rose-50 border-2 border-rose-200 p-8 text-center max-w-lg mx-auto">
                    <h2 className="text-xl font-space-grotesk font-bold text-rose-800 mb-2">Access Denied</h2>
                    <p className="text-rose-600 font-jetbrains-mono text-sm">{error}</p>
                </div>
            </div>
        )
    }

    // The columns are now imported from TrackTableColumns.jsx

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-4 bg-neutral-900 border-b border-neutral-200" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium">
                            Client Dashboard
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        Track Requests
                    </h1>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-10 w-full max-w-4xl bg-neutral-100 rounded-sm mb-4"></div>
                        <div className="h-64 w-full max-w-4xl bg-neutral-50 rounded-sm"></div>
                    </div>
                </div>
            ) : (
                <DataTable
                    columns={trackTableColumns}
                    data={requests}
                    searchKey="name"
                    emptyMessage="No active requests found."
                    emptyIcon={<FiInbox />}
                    actions={(item) => (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setViewingRequest(item)}
                                className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
                                title="View Details"
                            >
                                <FiEye className="w-4 h-4" />
                            </button>
                            <Link
                                href={`/track/board?requestId=${item.id}`}
                                className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
                                title="Open Board"
                            >
                                <FiTrello className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                />
            )}

            {/* Request Details Modal */}
            <TrackDetailsModal
                viewingRequest={viewingRequest}
                setViewingRequest={setViewingRequest}
            />
        </div>
    );
}
