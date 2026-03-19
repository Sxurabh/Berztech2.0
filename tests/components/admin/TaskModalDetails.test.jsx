import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TaskModalDetails from '@/components/admin/TaskModalDetails';

vi.mock('@/components/admin/KanbanBoard', () => ({
    COLUMNS: [
        { id: 'backlog', title: 'Backlog' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'in_review', title: 'In Review' },
        { id: 'completed', title: 'Completed' },
    ],
}));

describe('TaskModalDetails', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    const defaultProps = {
        title: 'Test Task',
        setTitle: vi.fn(),
        description: 'Test description',
        setDescription: vi.fn(),
        status: 'backlog',
        setStatus: vi.fn(),
        priority: 'medium',
        setPriority: vi.fn(),
    };

    it('renders title input and updates on change', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        const titleInput = screen.getByDisplayValue('Test Task');
        expect(titleInput).toBeInTheDocument();

        fireEvent.change(titleInput, { target: { value: 'New Title' } });
        expect(defaultProps.setTitle).toHaveBeenCalledWith('New Title');
    });

    it('renders description textarea and updates on change', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        const descriptionTextarea = screen.getByDisplayValue('Test description');
        expect(descriptionTextarea).toBeInTheDocument();

        fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });
        expect(defaultProps.setDescription).toHaveBeenCalledWith('New description');
    });

    it('renders status select with all column options', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        const statusSelect = screen.getByDisplayValue('Backlog');
        expect(statusSelect).toBeInTheDocument();

        expect(screen.getByText('Backlog')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('In Review')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('renders priority select with all options', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        const prioritySelect = screen.getByDisplayValue('Medium');
        expect(prioritySelect).toBeInTheDocument();

        expect(screen.getByText('Low')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('updates status when changed', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        const statusSelect = screen.getByDisplayValue('Backlog');
        fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
        
        expect(defaultProps.setStatus).toHaveBeenCalledWith('in_progress');
    });

    it('updates priority when changed', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        const prioritySelect = screen.getByDisplayValue('Medium');
        fireEvent.change(prioritySelect, { target: { value: 'high' } });
        
        expect(defaultProps.setPriority).toHaveBeenCalledWith('high');
    });

    it('renders placeholder text for empty fields', () => {
        const emptyProps = {
            title: '',
            setTitle: vi.fn(),
            description: '',
            setDescription: vi.fn(),
            status: 'backlog',
            setStatus: vi.fn(),
            priority: 'medium',
            setPriority: vi.fn(),
        };
        
        render(<TaskModalDetails {...emptyProps} />);
        
        expect(screen.getByPlaceholderText('Task Title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Add more details about this task...')).toBeInTheDocument();
    });

    it('renders all labels correctly', () => {
        render(<TaskModalDetails {...defaultProps} />);
        
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
    });
});
