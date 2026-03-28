"use client";

import { useState, useEffect } from "react";
import KanbanCard from "./KanbanCard";
import { FiPlus } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export const COLUMNS = [
    { id: "backlog", title: "Backlog", color: "border-neutral-200" },
    { id: "in_progress", title: "In Progress", color: "border-blue-200" },
    { id: "in_review", title: "In Review", color: "border-purple-200" },
    { id: "completed", title: "Completed", color: "border-emerald-200" }
];

export default function KanbanBoard({ tasks, onTaskClick, onTaskMove, onNewTask, onDragEnd }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getTasksByStatus = (status) => {
        return tasks.filter(t => t.status === status).sort((a, b) => a.order_index - b.order_index);
    };

    const handleDragEnd = (result) => {
        if (onDragEnd) {
            onDragEnd(result);
        }
    };

    if (!isMounted) return null;

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div data-testid="kanban-board" className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 pb-4 md:pb-8 md:h-full md:items-stretch md:auto-rows-[minmax(0,1fr)]">
                {COLUMNS.map(column => {
                    const columnTasks = getTasksByStatus(column.id);

                    return (
                        <div key={column.id} data-testid="kanban-column" className="flex flex-col bg-neutral-50/50 border border-neutral-100 md:h-full md:max-h-full rounded-sm md:min-h-0">
                            <div className="p-3 sm:p-4 border-b border-neutral-100 flex items-center justify-between bg-white rounded-t-sm">
                                <h3 className="font-space-grotesk font-medium text-neutral-900 tracking-tight text-sm sm:text-base">
                                    {column.title}
                                </h3>
                                <span className="text-[10px] font-jetbrains-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-sm font-medium">
                                    {columnTasks.length}
                                </span>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`p-2.5 sm:p-3 flex-1 overflow-y-auto space-y-2 sm:space-y-3 max-h-[240px] md:max-h-none transition-colors ${snapshot.isDraggingOver ? "bg-neutral-100/50" : ""}`}
                                    >
                                        {columnTasks.map((task, index) => (
                                            <KanbanCard
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                onEdit={onTaskClick}
                                                onStatusChange={onTaskMove}
                                                columns={COLUMNS}
                                            />
                                        ))}
                                        {provided.placeholder}
                                        {columnTasks.length === 0 && (
                                            <div className="text-center p-3 sm:p-4 text-[10px] sm:text-xs font-jetbrains-mono text-neutral-400">
                                                No tasks here.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
