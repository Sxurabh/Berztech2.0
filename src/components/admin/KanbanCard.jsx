"use client";

import { FiEdit2, FiArrowUp, FiArrowRight, FiArrowDown } from "react-icons/fi";
import { Draggable } from "@hello-pangea/dnd";

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

export default function KanbanCard({ task, index, onEdit }) {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    className={`
                        group flex flex-row items-center justify-between bg-white border rounded-sm px-3 py-2.5 gap-3 transition-all
                        ${snapshot.isDragging
                            ? "border-neutral-400 shadow-xl rotate-2 opacity-90 z-50 cursor-grabbing bg-neutral-50"
                            : "border-neutral-100 shadow-sm hover:border-neutral-300 hover:shadow-md cursor-grab"
                        }
                    `}
                >
                    <div className="flex-1 min-w-0 pr-2">
                        {/* Global Board Context Marker */}
                        {(task.requests?.company || task.requests?.name || task.projects?.title) && (
                            <div className="text-[9px] font-jetbrains-mono text-neutral-400 uppercase tracking-widest truncate mb-1">
                                {task.requests?.company || task.requests?.name || task.projects?.title}
                            </div>
                        )}
                        <h4 className="font-space-grotesk font-medium text-neutral-900 text-[13px] leading-tight truncate">
                            {task.title}
                        </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium rounded-sm border flex items-center gap-1 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                            {PRIORITY_ICONS[task.priority] || PRIORITY_ICONS.medium}
                            {task.priority || "Medium"}
                        </span>

                        <div>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }} className="w-6 h-6 rounded-sm hover:bg-neutral-100 border border-transparent flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors">
                                <FiEdit2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
