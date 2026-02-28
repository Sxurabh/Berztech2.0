"use client";

import ClientKanbanCard from "./ClientKanbanCard";

export const COLUMNS = [
    { id: "backlog", title: "Backlog", color: "border-neutral-200" },
    { id: "in_progress", title: "In Progress", color: "border-blue-200" },
    { id: "in_review", title: "In Review", color: "border-purple-200" },
    { id: "completed", title: "Completed", color: "border-emerald-200" }
];

export default function ClientKanbanBoard({ tasks, onTaskClick }) {
    const getTasksByStatus = (status) => {
        return tasks.filter(t => t.status === status).sort((a, b) => a.order_index - b.order_index);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 pb-4 md:pb-8 md:h-full md:items-stretch md:auto-rows-[minmax(0,1fr)]">
            {COLUMNS.map(column => {
                const columnTasks = getTasksByStatus(column.id);

                return (
                    <div key={column.id} className="flex flex-col bg-neutral-50/50 border border-neutral-100 md:h-full md:max-h-full rounded-sm md:min-h-0">
                        <div className="p-3 sm:p-4 border-b border-neutral-100 flex items-center justify-between bg-white rounded-t-sm">
                            <h3 className="font-space-grotesk font-medium text-neutral-900 tracking-tight text-sm sm:text-base">
                                {column.title}
                            </h3>
                            <span className="text-[10px] font-jetbrains-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-sm font-medium">
                                {columnTasks.length}
                            </span>
                        </div>

                        <div className="p-2.5 sm:p-3 flex-1 overflow-y-auto space-y-2 sm:space-y-3 max-h-[240px] md:max-h-none">
                            {columnTasks.map(task => (
                                <ClientKanbanCard
                                    key={task.id}
                                    task={task}
                                    onClick={onTaskClick}
                                />
                            ))}
                            {columnTasks.length === 0 && (
                                <div className="text-center p-3 sm:p-4 text-[10px] sm:text-xs font-jetbrains-mono text-neutral-400">
                                    No tasks in this stage.
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
