import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskModalFooter from '@/components/admin/TaskModalFooter';

vi.mock('react-icons/fi', () => ({
    FiArchive: () => <span data-testid="archive-icon" />,
    FiTrash2: () => <span data-testid="trash-icon" />,
    FiCheck: () => <span data-testid="check-icon" />,
}));

describe('TaskModalFooter Component', () => {
    const defaultProps = {
        isNew: false,
        loading: false,
        onClose: () => {},
        handleSave: () => {},
        handleArchive: () => {},
        handleDelete: () => {},
    };

    it('renders cancel button', () => {
        render(<TaskModalFooter {...defaultProps} />);
        
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders save button', () => {
        render(<TaskModalFooter {...defaultProps} />);
        
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('renders archive button for existing task', () => {
        render(<TaskModalFooter {...defaultProps} isNew={false} />);
        
        expect(screen.getByText('Archive')).toBeInTheDocument();
    });

    it('renders delete button for existing task', () => {
        render(<TaskModalFooter {...defaultProps} isNew={false} />);
        
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('renders create button for new task', () => {
        render(<TaskModalFooter {...defaultProps} isNew={true} />);
        
        expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', () => {
        const onClose = vi.fn();
        render(<TaskModalFooter {...defaultProps} onClose={onClose} />);
        
        screen.getByText('Cancel').click();
        expect(onClose).toHaveBeenCalled();
    });

    it('calls handleSave when save is clicked', () => {
        const handleSave = vi.fn();
        render(<TaskModalFooter {...defaultProps} handleSave={handleSave} />);
        
        screen.getByText('Save Changes').click();
        expect(handleSave).toHaveBeenCalled();
    });
});
