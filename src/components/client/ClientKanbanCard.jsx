"use client";

import { FiEye, FiArrowRight, FiArrowUp, FiArrowDown } from "react-icons/fi";

const PRIORITY_COLORS = {
    low: "bg-neutral-50 text-neutral-600 border-neutral-200",
    medium: "bg-blue-50/50 text-blue-700 border-blue-200",
    high: "bg-rose-50/50 text-rose-700 border-rose-200"
};

const PRIORITY_ICONS = {
    low: <FiArrowDown className="w-3 h-3" />,
    medium: <FiArrowRight className="w-3 h-3" />,
    high: <FiArrowUp className="w-3 h-3" />
};

export default function ClientKanbanCard({ task, onClick }) {
    return (
        <div
            onClick={() => onClick(task)}
            className="group flex flex-row items-center justify-between bg-white border rounded-sm px-3 py-2.5 gap-2 sm:gap-3 transition-all border-neutral-100 shadow-sm hover:border-neutral-300 hover:shadow-md cursor-pointer active:scale-[0.98]"
        >
            <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                <h4 className="font-space-grotesk font-medium text-neutral-900 text-[13px] leading-tight truncate">
                    {task.title}
                </h4>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium rounded-sm border flex items-center gap-0.5 sm:gap-1 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                    {PRIORITY_ICONS[task.priority] || PRIORITY_ICONS.medium}
                    <span className="hidden sm:inline">{task.priority || "Medium"}</span>
                </span>

                <button
                    aria-label="View task details"
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-sm hover:bg-neutral-100 border border-transparent flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <FiEye className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
            </div>
        </div>
    );
}
