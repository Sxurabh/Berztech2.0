import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientTaskModal from '@/components/client/ClientTaskModal';

vi.mock('@/lib/hooks/useTaskComments', () => ({
  useTaskComments: vi.fn(() => ({
    comments: [],
    sendComment: vi.fn(),
  })),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="close-icon" />,
  FiMessageSquare: () => <span data-testid="message-icon" />,
  FiArrowUp: () => <span data-testid="arrow-up" />,
  FiArrowRight: () => <span data-testid="arrow-right" />,
  FiArrowDown: () => <span data-testid="arrow-down" />,
  FiSend: () => <span data-testid="send-icon" />,
}));

const mockTask = {
  id: 'task-1',
  title: 'Test Task Title',
  status: 'in_progress',
  priority: 'high',
  description: 'This is a test description',
  client_id: 'client-1',
  created_at: '2024-01-15T10:00:00Z',
};

describe('ClientTaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title', () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);
    expect(screen.getByLabelText('Close task details')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<ClientTaskModal task={mockTask} onClose={handleClose} />);

    await userEvent.click(screen.getByLabelText('Close task details'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('switches between Overview and Feedback tabs', async () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);

    const feedbackTab = screen.getByText(/Feedback/);
    await userEvent.click(feedbackTab);

    expect(screen.getByText(/No messages yet/)).toBeInTheDocument();
  });

  it('renders description in Overview tab', async () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);

    const overviewTab = screen.getByText(/Overview/);
    await userEvent.click(overviewTab);

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders status correctly', async () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);

    const overviewTab = screen.getByText(/Overview/);
    await userEvent.click(overviewTab);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders priority correctly', async () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);

    const overviewTab = screen.getByText(/Overview/);
    await userEvent.click(overviewTab);

    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it('renders created date', async () => {
    render(<ClientTaskModal task={mockTask} onClose={() => {}} />);

    const overviewTab = screen.getByText(/Overview/);
    await userEvent.click(overviewTab);

    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });
});
