import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientKanbanBoard, COLUMNS } from '@/components/client/ClientKanbanBoard';

vi.mock('@/components/client/ClientKanbanCard', () => ({
  default: ({ task, onClick }) => (
    <div data-testid="task-card" onClick={() => onClick(task)}>{task.title}</div>
  ),
}));

const mockTasks = [
  { id: '1', title: 'Task 1', status: 'backlog', priority: 'high', order_index: 0 },
  { id: '2', title: 'Task 2', status: 'backlog', priority: 'low', order_index: 1 },
  { id: '3', title: 'Task 3', status: 'in_progress', priority: 'medium', order_index: 0 },
  { id: '4', title: 'Task 4', status: 'completed', priority: 'low', order_index: 0 },
];

describe('ClientKanbanBoard', () => {
  it('renders all columns', () => {
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={() => {}} />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays task count per column', () => {
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={() => {}} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders task cards in correct columns', () => {
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={() => {}} />);

    expect(screen.getAllByTestId('task-card').length).toBe(4);
  });

  it('shows empty state when no tasks in column', () => {
    render(<ClientKanbanBoard tasks={[]} onTaskClick={() => {}} />);

    expect(screen.getAllByText('No tasks in this stage.').length).toBe(4);
  });

  it('calls onTaskClick when task is clicked', () => {
    const handleClick = vi.fn();
    render(<ClientKanbanBoard tasks={mockTasks} onTaskClick={handleClick} />);

    const taskCard = screen.getAllByTestId('task-card')[0];
    taskCard.click();

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
