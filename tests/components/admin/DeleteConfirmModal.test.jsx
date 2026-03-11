import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, layout, layoutId, ...props }) => props;
    return {
        motion: {
            div: ({ children, onClick, ...props }) => (
                <div {...stripProps(props)} onClick={onClick}>
                    {children}
                </div>
            ),
        },
        AnimatePresence: ({ children }) => children,
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

describe('DeleteConfirmModal Component', () => {
    it('renders modal with itemName in the message', async () => {
        const DeleteConfirmModal = (await import('@/components/admin/DeleteConfirmModal')).default;
        
        render(
            <DeleteConfirmModal 
                isOpen={true} 
                itemName="Post" 
                onClose={vi.fn()} 
                onConfirm={vi.fn()} 
            />
        );
        
        expect(screen.getByText(/delete post\?/i)).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', async () => {
        const DeleteConfirmModal = (await import('@/components/admin/DeleteConfirmModal')).default;
        const handleConfirm = vi.fn();
        
        render(
            <DeleteConfirmModal 
                isOpen={true} 
                itemName="Post" 
                onClose={vi.fn()} 
                onConfirm={handleConfirm} 
            />
        );
        
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteButton);
        
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', async () => {
        const DeleteConfirmModal = (await import('@/components/admin/DeleteConfirmModal')).default;
        const handleClose = vi.fn();
        
        render(
            <DeleteConfirmModal 
                isOpen={true} 
                itemName="Post" 
                onClose={handleClose} 
                onConfirm={vi.fn()} 
            />
        );
        
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await userEvent.click(cancelButton);
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when loading prop is true', async () => {
        const DeleteConfirmModal = (await import('@/components/admin/DeleteConfirmModal')).default;
        
        render(
            <DeleteConfirmModal 
                isOpen={true} 
                itemName="Post" 
                onClose={vi.fn()} 
                onConfirm={vi.fn()} 
                loading={true}
            />
        );
        
        const deleteButton = screen.getByRole('button', { name: /deleting/i });
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toBeDisabled();
    });

    it('renders correctly when bulkDelete is true', async () => {
        const DeleteConfirmModal = (await import('@/components/admin/DeleteConfirmModal')).default;
        
        render(
            <DeleteConfirmModal 
                isOpen={true} 
                itemName="Posts" 
                onClose={vi.fn()} 
                onConfirm={vi.fn()} 
                bulkDelete={true}
            />
        );
        
        expect(screen.getByText(/delete all posts\?/i)).toBeInTheDocument();
        expect(screen.getByText(/all selected posts will be permanently removed/i)).toBeInTheDocument();
    });
});
