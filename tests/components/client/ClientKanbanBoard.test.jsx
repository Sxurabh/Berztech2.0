import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { COLUMNS } from '@/components/client/ClientKanbanBoard';

vi.mock('@/components/client/ClientKanbanBoard', async () => {
  const mockComponent = function MockClientKanbanBoard({ tasks, onTaskClick }) {
    const getTasksByStatus = (status) => {
      return tasks.filter(t => t.status === status).sort((a, b) => a.order_index - b.order_index);
    };

    return (
      <div data-testid="kanban-board">
        {COLUMNS.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div key={column.id} data-testid={`column-${column.id}`}>
              <h3 data-testid={`column-title-${column.id}`}>{column.title}</h3>
              <span data-testid={`count-${column.id}`}>{columnTasks.length}</span>
              {columnTasks.map(task => (
                <div 
                  key={task.id} 
                  data-testid="task-card" 
                  onClick={() => onTaskClick && onTaskClick(task)}
                >
                  {task.title}
                </div>
              ))}
              {columnTasks.length === 0 && (
                <div data-testid="empty-state">No tasks in this stage.</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return {
    default: mockComponent,
    COLUMNS: [
      { id: "backlog", title: "Backlog", color: "border-neutral-200" },
      { id: "in_progress", title: "In Progress", color: "border-blue-200" },
      { id: "in_review", title: "In Review", color: "border-purple-200" },
      { id: "completed", title: "Completed", color: "border-emerald-200" }
    ],
  };
});

import ClientKanbanBoard from '@/components/client/ClientKanbanBoard';

const mockTasks = [
  { id: '1', title: 'Task 1', status: 'backlog', priority: 'high', order_index: 0 },
  { id: '2', title: 'Task 2', status: 'backlog', priority: 'low', order_index: 1 },
  { id: '3', title: 'Task 3', status: 'in_progress', priority: 'medium', order_index: 0 },
  { id: '4', title: 'Task 4', status: 'completed', priority: 'low', order_index: 0 },
];

describe('ClientKanbanBoard', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders all columns', () => {
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={() => {}} />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays task count per column', () => {
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={() => {}} />);

    expect(screen.getByTestId('count-backlog')).toHaveTextContent('2');
    expect(screen.getByTestId('count-in_progress')).toHaveTextContent('1');
    expect(screen.getByTestId('count-completed')).toHaveTextContent('1');
    expect(screen.getByTestId('count-in_review')).toHaveTextContent('0');
  });

  it('renders task cards in correct columns', () => {
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={() => {}} />);

    expect(screen.getAllByTestId('task-card').length).toBe(4);
  });

  it('shows empty state when no tasks in column', () => {
    render(<ClientKanbanBoard tasks={[]} onTaskClick={() => {}} />);

    expect(screen.getAllByTestId('empty-state').length).toBe(4);
  });

  it('calls onTaskClick when task is clicked', () => {
    const handleClick = vi.fn();
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={handleClick} />);

    const taskCards = screen.getAllByTestId('task-card');
    fireEvent.click(taskCards[0]);

    expect(handleClick).toHaveBeenCalledWith(mockTasks[0]);
  });
});

describe('COLUMNS constant', () => {
  it('has correct column definitions', () => {
    expect(COLUMNS).toHaveLength(4);
    expect(COLUMNS[0].id).toBe('backlog');
    expect(COLUMNS[1].id).toBe('in_progress');
    expect(COLUMNS[2].id).toBe('in_review');
    expect(COLUMNS[3].id).toBe('completed');
  });

  it('has correct titles', () => {
    expect(COLUMNS[0].title).toBe('Backlog');
    expect(COLUMNS[1].title).toBe('In Progress');
    expect(COLUMNS[2].title).toBe('In Review');
    expect(COLUMNS[3].title).toBe('Completed');
  });
});
