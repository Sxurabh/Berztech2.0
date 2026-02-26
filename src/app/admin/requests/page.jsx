"use client";

import { useState, useEffect } from "react";
import { FiArchive, FiCheckCircle, FiInbox } from "react-icons/fi";
import { toast } from "react-hot-toast";
import DataTable from "@/components/admin/DataTable";
import RequestTimeline from "@/components/ui/RequestTimeline";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/requests");
            const json = await res.json();
            if (res.ok) {
                // Show all non-archived by default, maybe allow toggle later? For now just non-archived
                setRequests((json.data || []).filter(r => r.status !== 'archived'));
            } else {
                toast.error("Failed to load requests: " + json.error);
            }
        } catch (error) {
            toast.error("Error fetching requests");
        } finally {
            setLoading(false);
        }
    }

    const updateRequestStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                const { data } = await res.json();
                if (status === 'archived') {
                    setRequests((prev) => prev.filter((r) => r.id !== id));
                    toast.success("Request archived");
                } else if (status === 'completed') {
                    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.status } : r)));
                    toast.success("Request marked as completed!");
                } else {
                    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.status } : r)));
                    toast.success("Timeline stage updated");
                }
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating request status");
        }
    };

    const columns = [
        {
            key: "name",
            label: "Client / Company",
            sortable: true,
            render: (item) => (
                <div>
                    <span className="text-sm font-space-grotesk text-neutral-900 font-bold">
                        {item.company || item.name}
                    </span>
                    {(item.company && item.name) && (
                        <div className="text-[10px] font-jetbrains-mono text-neutral-500 mt-0.5">
                            {item.name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "email",
            label: "Contact",
            sortable: true,
            className: "hidden sm:table-cell",
            render: (item) => (
                <span className="text-sm font-jetbrains-mono text-neutral-600">
                    {item.email}
                </span>
            ),
        },
        {
            key: "status",
            label: "Progress Timeline",
            sortable: false,
            className: "min-w-[300px]",
            render: (item) => (
                <div className="py-2">
                    <RequestTimeline
                        currentStage={item.status || "discover"}
                        interactive={item.status !== 'completed'}
                        compact
                        onStageChange={(stage) => updateRequestStatus(item.id, stage)}
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
                <span className="text-xs font-jetbrains-mono text-neutral-500 font-medium">
                    {new Date(item.created_at).toLocaleDateString()}
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
                        <div className="h-px w-4 bg-neutral-900 border-b-2 border-neutral-900" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-bold">
                            Inquiries
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight uppercase">
                        Track Requests
                    </h1>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-10 w-full max-w-4xl bg-neutral-100 border-2 border-neutral-300 rounded-none mb-4"></div>
                        <div className="h-64 w-full max-w-4xl bg-neutral-50 border-2 border-neutral-300 rounded-none"></div>
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
                        <>
                            {item.status !== 'completed' && (
                                <button
                                    onClick={() => updateRequestStatus(item.id, 'completed')}
                                    className="p-1.5 min-w-[32px] flex items-center justify-center text-emerald-700 bg-emerald-50 border-2 border-emerald-500 hover:bg-emerald-100 shadow-[1px_1px_0px_#10b981] hover:shadow-[2px_2px_0px_#10b981] transition-all"
                                    title="Mark Complete"
                                >
                                    <FiCheckCircle className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => updateRequestStatus(item.id, 'archived')}
                                className="p-1.5 min-w-[32px] flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border-2 border-transparent hover:border-neutral-900 hover:shadow-[2px_2px_0px_#171717] transition-all"
                                title="Archive"
                            >
                                <FiArchive className="w-4 h-4" />
                            </button>
                        </>
                    )}
                />
            )}
        </div>
    );
}
