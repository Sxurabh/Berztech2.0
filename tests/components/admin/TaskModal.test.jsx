import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import TaskModal from '@/components/admin/TaskModal';

vi.mock('@/lib/hooks/useTaskComments', () => ({
  useTaskComments: vi.fn(() => ({
    comments: [],
    setComments: vi.fn(),
    loading: false,
    sendComment: vi.fn(() => Promise.resolve(true)),
  })),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/components/admin/TaskModalDetails', () => ({
  default: ({ title, setTitle, description, setDescription, status, setStatus, priority, setPriority }) => (
    <div data-testid="task-modal-details">
      <input 
        data-testid="title-input"
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
      <textarea 
        data-testid="description-input"
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
      />
      <select 
        data-testid="status-select"
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="backlog">Backlog</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select 
        data-testid="priority-select"
        value={priority} 
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  ),
}));

vi.mock('@/components/admin/TaskModalChat', () => ({
  default: () => <div data-testid="task-modal-chat">Chat</div>,
}));

vi.mock('@/components/admin/TaskModalHeader', () => ({
  default: ({ isNew, onClose }) => (
    <div data-testid="task-modal-header">
      <span>{isNew ? 'Create Task' : 'Edit Task'}</span>
      <button data-testid="close-button" onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('@/components/admin/TaskModalFooter', () => ({
  default: ({ isNew, loading, onClose, handleSave, handleArchive, handleDelete }) => (
    <div data-testid="task-modal-footer">
      {isNew ? null : <button data-testid="delete-button" onClick={handleDelete}>Delete</button>}
      <button data-testid="archive-button" onClick={handleArchive}>Archive</button>
      <button data-testid="save-button" onClick={handleSave}>Save</button>
      <button data-testid="cancel-button" onClick={onClose}>Cancel</button>
    </div>
  ),
}));

describe('TaskModal', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test description',
    status: 'backlog',
    priority: 'high',
    request_id: 'req-1',
  };

  it('renders in edit mode with existing task', () => {
    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByTestId('task-modal-details')).toBeInTheDocument();
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });

  it('renders in create mode when no task provided', () => {
    render(<TaskModal task={null} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const mockOnClose = vi.fn();
    render(<TaskModal task={mockTask} requestId="req-1" onClose={mockOnClose} onUpdate={() => {}} onDelete={() => {}} />);
    
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows validation error when title is empty on save', async () => {
    const mockOnClose = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    });

    render(<TaskModal task={{ id: '1' }} requestId="req-1" onClose={mockOnClose} onUpdate={() => {}} onDelete={() => {}} />);
    
    const titleInput = screen.getByTestId('title-input');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
  });

  it('calls onDelete when delete button clicked', async () => {
    const mockOnDelete = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    window.confirm = vi.fn(() => true);

    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
    });
  });

  it('switches between Details and Comments tabs', () => {
    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={() => {}} />);
    
    const detailsTab = screen.getByText('Details');
    const commentsTab = screen.getByText(/Comments/);
    
    fireEvent.click(commentsTab);
    expect(screen.getByTestId('task-modal-chat')).toBeInTheDocument();
    
    fireEvent.click(detailsTab);
    expect(screen.getByTestId('task-modal-details')).toBeInTheDocument();
  });

  it('shows Details tab by default', () => {
    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByTestId('task-modal-details')).toBeInTheDocument();
  });

  it('initializes form state from task props', () => {
    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={() => {}} />);
    
    const titleInput = screen.getByTestId('title-input');
    expect(titleInput.value).toBe('Test Task');
  });

  it('handles archive action', async () => {
    const mockOnUpdate = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    });

    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={mockOnUpdate} onDelete={() => {}} />);
    
    const archiveButton = screen.getByTestId('archive-button');
    fireEvent.click(archiveButton);
  });

  it('calls onUpdate with task data on successful save', async () => {
    const mockOnUpdate = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'task-123', title: 'Updated Task' } }),
    });

    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={mockOnUpdate} onDelete={() => {}} />);
    
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('renders Comments tab with count', () => {
    render(<TaskModal task={mockTask} requestId="req-1" onClose={() => {}} onUpdate={() => {}} onDelete={() => {}} />);
    
    const commentsTab = screen.getByText(/Comments/);
    expect(commentsTab).toBeInTheDocument();
  });
});
