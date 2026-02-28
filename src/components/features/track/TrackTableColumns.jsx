import RequestTimeline from "@/components/ui/RequestTimeline";

export const trackTableColumns = [
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
        className: "min-w-[200px]",
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
