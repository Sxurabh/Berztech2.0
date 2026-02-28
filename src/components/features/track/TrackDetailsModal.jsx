import Link from "next/link";
import { FiExternalLink, FiX } from "react-icons/fi";

export default function TrackDetailsModal({ viewingRequest, setViewingRequest }) {
    if (!viewingRequest) return null;

    return (
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
    );
}
