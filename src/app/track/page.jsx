"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiInbox, FiTrello, FiExternalLink, FiX, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";
import DataTable from "@/components/admin/DataTable";
import RequestTimeline from "@/components/ui/RequestTimeline";

export default function TrackPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        try {
            const res = await fetch("/api/requests");
            const json = await res.json();

            if (res.ok) {
                setRequests(json.data || []);
            } else {
                setError(json.error || "Access Denied. Please ensure you are logged in.");
                toast.error("Failed to load requests");
            }
        } catch (error) {
            setError("Network error fetching data. Ensure you are authenticated.");
            toast.error("Error fetching requests data");
        } finally {
            setLoading(false);
        }
    }

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

    const columns = [
        {
            key: "name",
            label: "Request",
            sortable: true,
            render: (item) => (
                <div className="flex flex-col gap-0.5 max-w-[200px]">
                    <span className="text-sm font-space-grotesk text-neutral-900 font-bold truncate">
                        {item.company || item.name}
                    </span>
                    {(item.company && item.name) && (
                        <span className="text-[10px] font-jetbrains-mono text-neutral-500 truncate">
                            {item.name}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "services",
            label: "Details",
            sortable: false,
            className: "hidden sm:table-cell",
            render: (item) => (
                <div className="flex flex-col gap-1 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-jetbrains-mono text-neutral-400 uppercase tracking-wider bg-neutral-100/80 px-1.5 py-0.5 rounded-sm">
                            {Array.isArray(item.services) ? item.services[0] + (item.services.length > 1 ? ` +${item.services.length - 1}` : "") : (item.services || "General")}
                        </span>
                        {item.budget && (
                            <span className="text-[9px] font-jetbrains-mono text-neutral-400 uppercase tracking-wider bg-neutral-100/80 px-1.5 py-0.5 rounded-sm">
                                {item.budget}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            label: "Timeline",
            sortable: false,
            className: "w-[240px]",
            render: (item) => (
                <div className="py-1">
                    <RequestTimeline
                        currentStage={item.status || "discover"}
                        interactive={false}
                        compact
                    />
                </div>
            ),
        },
        {
            key: "created_at",
            label: "Date",
            sortable: true,
            className: "hidden md:table-cell",
            render: (item) => (
                <span className="text-xs font-jetbrains-mono text-neutral-500">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            ),
        },
    ];

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
                    columns={columns}
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
            {viewingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm sm:p-6">
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
                            {/* Contact Info */}
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
        </div>
    );
}
