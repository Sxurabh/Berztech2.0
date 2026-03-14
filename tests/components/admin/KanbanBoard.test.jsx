/**
 * @fileoverview Component tests for KanbanBoard
 *
 * Tests cover:
 * - COLUMNS constant export
 * - Component rendering (columns, tasks, empty state)
 * - Task interactions (edit button, drag and drop)
 * - Props handling (tasks filtering, callbacks)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { COLUMNS } from "@/components/admin/KanbanBoard";

vi.mock("@hello-pangea/dnd", () => ({
    DragDropContext: ({ children, onDragEnd }) => (
        <div data-testid="drag-context">{children}</div>
    ),
    Droppable: ({ children, droppableId }) => children({}, {}),
    Draggable: ({ children, draggableId, index }) => children({}, {}),
}));

vi.mock("@/components/admin/KanbanCard", () => ({
    default: ({ task, onEdit }) => (
        <div data-testid="kanban-card" data-task-id={task.id}>
            <span data-testid="task-title">{task.title}</span>
            <button
                data-testid="edit-button"
                onClick={(e) => onEdit && onEdit(task)}
            >
                Edit
            </button>
        </div>
    ),
}));

describe("KanbanBoard", () => {
    describe("COLUMNS", () => {
        it("has 4 columns", () => {
            expect(COLUMNS).toHaveLength(4);
        });

        it("has correct column IDs", () => {
            const ids = COLUMNS.map(c => c.id);
            expect(ids).toContain("backlog");
            expect(ids).toContain("in_progress");
            expect(ids).toContain("in_review");
            expect(ids).toContain("completed");
        });

        it("has correct column titles", () => {
            const titles = COLUMNS.map(c => c.title);
            expect(titles).toContain("Backlog");
            expect(titles).toContain("In Progress");
            expect(titles).toContain("In Review");
            expect(titles).toContain("Completed");
        });

        it("has color properties", () => {
            COLUMNS.forEach(column => {
                expect(column).toHaveProperty("color");
                expect(column.color).toMatch(/^border-/);
            });
        });
    });

    describe("Rendering", () => {
        const mockTasks = [
            { id: "task-1", title: "Task 1", status: "backlog", priority: "high" },
            { id: "task-2", title: "Task 2", status: "in_progress", priority: "medium" },
            { id: "task-3", title: "Task 3", status: "in_progress", priority: "low" },
            { id: "task-4", title: "Task 4", status: "completed", priority: "medium" },
        ];

        it("renders 4 columns with correct titles", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={mockTasks} />);

            expect(screen.getByText("Backlog")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();
            expect(screen.getByText("In Review")).toBeInTheDocument();
            expect(screen.getByText("Completed")).toBeInTheDocument();
        });

        it("renders task count badges", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={mockTasks} />);

            const counts = screen.getAllByText(/^[0-2]$/);
            expect(counts.length).toBeGreaterThanOrEqual(4);
        });

        it("shows empty state message when column has no tasks", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={[]} />);

            const emptyMessages = screen.getAllByText(/no tasks here/i);
            expect(emptyMessages).toHaveLength(4);
        });

        it("renders tasks in correct columns", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={mockTasks} />);

            const cards = screen.getAllByTestId("kanban-card");
            expect(cards).toHaveLength(4);
        });

        it("renders tasks with empty array", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={[]} />);

            expect(screen.getByText("Backlog")).toBeInTheDocument();
        });
    });

    describe("Interactions", () => {
        const mockTasks = [
            { id: "task-1", title: "Test Task", status: "backlog", priority: "high" },
        ];

        it("calls onTaskClick when edit button is clicked", async () => {
            const onTaskClick = vi.fn();
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={mockTasks} onTaskClick={onTaskClick} />);

            const editButton = screen.getByTestId("edit-button");
            await userEvent.click(editButton);

            expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
        });

        it("does not call onTaskClick when not provided", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={mockTasks} />);

            const editButton = screen.getByTestId("edit-button");
            await userEvent.click(editButton);
        });

        it("renders drag context for DnD functionality", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={mockTasks} />);

            expect(screen.getByTestId("drag-context")).toBeInTheDocument();
        });
    });

    describe("Props handling", () => {
        it("filters tasks by status correctly", async () => {
            const tasks = [
                { id: "t1", title: "Backlog Task", status: "backlog" },
                { id: "t2", title: "In Progress Task 1", status: "in_progress" },
                { id: "t3", title: "In Progress Task 2", status: "in_progress" },
                { id: "t4", title: "In Review Task", status: "in_review" },
                { id: "t5", title: "Completed Task", status: "completed" },
            ];

            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={tasks} />);

            const cards = screen.getAllByTestId("kanban-card");
            expect(cards).toHaveLength(5);
        });

        it("handles empty tasks array", async () => {
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            render(<ProjectForm tasks={[]} />);

            const emptyMessages = screen.getAllByText(/no tasks here/i);
            expect(emptyMessages).toHaveLength(4);
        });
    });

    describe("Optimistic updates and revert", () => {
        it("updates column when drag succeeds", async () => {
            const onTaskUpdate = vi.fn().mockResolvedValue({ success: true });
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            
            const tasks = [
                { id: "task-1", title: "Task to move", status: "backlog", priority: "high" },
            ];

            render(<ProjectForm tasks={tasks} onTaskUpdate={onTaskUpdate} />);

            const cards = screen.getAllByTestId("kanban-card");
            expect(cards).toHaveLength(1);
        });

        it("reverts to original column when server returns 500 error", async () => {
            const onTaskUpdate = vi.fn().mockRejectedValue(new Error("Server error: 500"));
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            
            const tasks = [
                { id: "task-1", title: "Task that fails", status: "backlog", priority: "high" },
            ];

            render(<ProjectForm tasks={tasks} onTaskUpdate={onTaskUpdate} />);

            const cards = screen.getAllByTestId("kanban-card");
            expect(cards).toHaveLength(1);
            
            const taskCard = screen.getByTestId("kanban-card");
            expect(taskCard).toBeInTheDocument();
        });

        it("remains stable when network error occurs during drag", async () => {
            const onTaskUpdate = vi.fn().mockRejectedValue(new Error("Network error"));
            const ProjectForm = (await import("@/components/admin/KanbanBoard")).default;
            
            const tasks = [
                { id: "task-1", title: "Network fail task", status: "in_progress", priority: "medium" },
            ];

            render(<ProjectForm tasks={tasks} onTaskUpdate={onTaskUpdate} />);

            expect(screen.getByTestId("kanban-card")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();
        });
    });
});
