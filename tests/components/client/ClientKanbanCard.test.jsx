import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClientKanbanCard from '@/components/client/ClientKanbanCard';

vi.mock('react-icons/fi', () => ({
  FiEye: () => <span data-testid="eye-icon" />,
  FiArrowRight: () => <span data-testid="arrow-right" />,
  FiArrowUp: () => <span data-testid="arrow-up" />,
  FiArrowDown: () => <span data-testid="arrow-down" />,
}));

describe('ClientKanbanCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'backlog',
    priority: 'medium',
  };

  it('renders task title', () => {
    render(<ClientKanbanCard task={mockTask} onClick={() => {}} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<ClientKanbanCard task={mockTask} onClick={() => {}} />);
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('renders high priority correctly', () => {
    render(<ClientKanbanCard task={{ ...mockTask, priority: 'high' }} onClick={() => {}} />);
    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it('renders low priority correctly', () => {
    render(<ClientKanbanCard task={{ ...mockTask, priority: 'low' }} onClick={() => {}} />);
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('calls onClick with task when clicked', () => {
    const handleClick = vi.fn();
    render(<ClientKanbanCard task={mockTask} onClick={handleClick} />);

    const card = screen.getByText('Test Task').closest('div');
    card.click();

    expect(handleClick).toHaveBeenCalledWith(mockTask);
  });

  it('renders view button', () => {
    render(<ClientKanbanCard task={mockTask} onClick={() => {}} />);
    expect(screen.getByLabelText('View task details')).toBeInTheDocument();
  });

  it('handles missing priority gracefully', () => {
    render(<ClientKanbanCard task={{ ...mockTask, priority: undefined }} onClick={() => {}} />);
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
  });
});
