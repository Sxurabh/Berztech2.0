import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TaskModalHeader from '@/components/admin/TaskModalHeader';

vi.mock('react-icons/fi', () => ({
    FiX: () => <span data-testid="close-icon" />,
}));

describe('TaskModalHeader', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders "New Task" when isNew is true', () => {
        render(<TaskModalHeader isNew={true} onClose={vi.fn()} />);
        
        expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('renders "Edit Task" when isNew is false', () => {
        render(<TaskModalHeader isNew={false} onClose={vi.fn()} />);
        
        expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const mockOnClose = vi.fn();
        render(<TaskModalHeader isNew={false} onClose={mockOnClose} />);
        
        const closeButton = screen.getByTestId('close-icon').closest('button');
        fireEvent.click(closeButton);
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('renders FiX icon', () => {
        render(<TaskModalHeader isNew={false} onClose={vi.fn()} />);
        
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('has correct styling classes for header container', () => {
        const { container } = render(<TaskModalHeader isNew={false} onClose={vi.fn()} />);
        
        const header = container.firstChild;
        expect(header).toHaveClass('flex items-center justify-between');
        expect(header).toHaveClass('border-b border-neutral-100');
    });

    it('applies responsive padding classes', () => {
        const { container } = render(<TaskModalHeader isNew={false} onClose={vi.fn()} />);
        
        const header = container.firstChild;
        expect(header).toHaveClass('p-4 sm:p-5');
    });
});
