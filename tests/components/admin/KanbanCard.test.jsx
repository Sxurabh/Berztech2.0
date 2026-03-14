import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import KanbanCard from '@/components/admin/KanbanCard';

vi.mock('@hello-pangea/dnd', () => ({
  Draggable: ({ children }) => children(
    { innerRef: () => {}, draggableProps: {}, dragHandleProps: {}, style: {} },
    { isDragging: false }
  ),
}));

const mockTask = {
  id: 'task-1',
  title: 'Test Task Title',
  priority: 'high',
  status: 'backlog',
  requests: {
    company: 'Acme Corp',
    name: 'John Doe',
  },
  projects: {
    title: 'Website Redesign',
  },
};

describe('KanbanCard', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders task title', () => {
    render(<KanbanCard task={mockTask} index={0} onEdit={() => {}} />);
    
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
  });

  it('renders priority badge with correct styling', () => {
    render(<KanbanCard task={mockTask} index={0} onEdit={() => {}} />);
    
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    render(<KanbanCard task={mockTask} index={0} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('renders company name from requests', () => {
    render(<KanbanCard task={mockTask} index={0} onEdit={() => {}} />);
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders project title when no company', () => {
    const taskWithoutCompany = {
      ...mockTask,
      requests: null,
      projects: { title: 'Test Project' },
    };
    
    render(<KanbanCard task={taskWithoutCompany} index={0} onEdit={() => {}} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('handles missing priority gracefully', () => {
    const taskWithoutPriority = {
      ...mockTask,
      priority: undefined,
    };
    
    render(<KanbanCard task={taskWithoutPriority} index={0} onEdit={() => {}} />);
    
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders without context info', () => {
    const taskWithoutContext = {
      id: 'task-2',
      title: 'Simple Task',
      priority: 'low',
    };
    
    render(<KanbanCard task={taskWithoutContext} index={0} onEdit={() => {}} />);
    
    expect(screen.getByText('Simple Task')).toBeInTheDocument();
  });
});
