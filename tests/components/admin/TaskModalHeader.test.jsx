import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskModalHeader from '@/components/admin/TaskModalHeader';

vi.mock('react-icons/fi', () => ({
    FiX: () => <span data-testid="close-icon" />,
}));

describe('TaskModalHeader Component', () => {
    it('renders New Task title for new task', () => {
        render(<TaskModalHeader isNew={true} onClose={() => {}} />);
        
        expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    it('renders Edit Task title for existing task', () => {
        render(<TaskModalHeader isNew={false} onClose={() => {}} />);
        
        expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('renders close button', () => {
        render(<TaskModalHeader isNew={false} onClose={() => {}} />);
        
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<TaskModalHeader isNew={false} onClose={onClose} />);
        
        screen.getByTestId('close-icon').closest('button').click();
        expect(onClose).toHaveBeenCalled();
    });
});
