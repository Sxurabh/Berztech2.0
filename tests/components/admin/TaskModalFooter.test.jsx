import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TaskModalFooter from '@/components/admin/TaskModalFooter';

vi.mock('react-icons/fi', () => ({
    FiArchive: () => <span data-testid="archive-icon" />,
    FiTrash2: () => <span data-testid="trash-icon" />,
    FiCheck: () => <span data-testid="check-icon" />,
}));

describe('TaskModalFooter', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    const defaultProps = {
        isNew: false,
        loading: false,
        onClose: vi.fn(),
        handleSave: vi.fn(),
        handleArchive: vi.fn(),
        handleDelete: vi.fn(),
    };

    it('renders "Create Task" button when isNew is true', () => {
        render(<TaskModalFooter {...defaultProps} isNew={true} />);
        
        expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    it('renders "Save Changes" button when isNew is false', () => {
        render(<TaskModalFooter {...defaultProps} isNew={false} />);
        
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('hides Archive and Delete buttons when isNew is true', () => {
        render(<TaskModalFooter {...defaultProps} isNew={true} />);
        
        expect(screen.queryByText('Archive')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('shows Archive and Delete buttons when isNew is false', () => {
        render(<TaskModalFooter {...defaultProps} isNew={false} />);
        
        expect(screen.getByText('Archive')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('disables Save button when loading is true', () => {
        render(<TaskModalFooter {...defaultProps} loading={true} />);
        
        const saveButton = screen.getByText('Save Changes').closest('button');
        expect(saveButton).toBeDisabled();
    });

    it('disables Archive and Delete buttons when loading is true', () => {
        render(<TaskModalFooter {...defaultProps} loading={true} />);
        
        const archiveButton = screen.getByText('Archive').closest('button');
        const deleteButton = screen.getByText('Delete').closest('button');
        
        expect(archiveButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });

    it('calls onClose when Cancel is clicked', () => {
        const mockOnClose = vi.fn();
        render(<TaskModalFooter {...defaultProps} onClose={mockOnClose} />);
        
        fireEvent.click(screen.getByText('Cancel'));
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls handleSave when Save button is clicked', () => {
        const mockHandleSave = vi.fn();
        render(<TaskModalFooter {...defaultProps} handleSave={mockHandleSave} />);
        
        fireEvent.click(screen.getByText('Save Changes'));
        
        expect(mockHandleSave).toHaveBeenCalled();
    });

    it('calls handleArchive when Archive button is clicked', () => {
        const mockHandleArchive = vi.fn();
        render(<TaskModalFooter {...defaultProps} handleArchive={mockHandleArchive} />);
        
        fireEvent.click(screen.getByText('Archive'));
        
        expect(mockHandleArchive).toHaveBeenCalled();
    });

    it('calls handleDelete when Delete button is clicked', () => {
        const mockHandleDelete = vi.fn();
        render(<TaskModalFooter {...defaultProps} handleDelete={mockHandleDelete} />);
        
        fireEvent.click(screen.getByText('Delete'));
        
        expect(mockHandleDelete).toHaveBeenCalled();
    });
});
