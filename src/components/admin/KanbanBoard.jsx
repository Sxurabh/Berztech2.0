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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-8 h-full items-stretch auto-rows-[minmax(0,1fr)]">
                {COLUMNS.map(column => {
                    const columnTasks = getTasksByStatus(column.id);

                    return (
                        <div key={column.id} className="flex flex-col bg-neutral-50/50 border border-neutral-100 h-full max-h-full rounded-sm min-h-0">
                            <div className={`p-4 border-b border-neutral-100 flex items-center justify-between bg-white rounded-t-sm`}>
                                <h3 className="font-space-grotesk font-medium text-neutral-900 tracking-tight">
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
                                        className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? "bg-neutral-100/50" : ""}`}
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
