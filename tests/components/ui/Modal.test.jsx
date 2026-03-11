import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, ...props }) => props;
    return {
        motion: {
            div: ({ children, ...props }) => <div {...stripProps(props)}>{children}</div>,
        },
        AnimatePresence: ({ children }) => children,
    };
});

vi.mock('react-icons/fi', () => ({
    FiX: () => <span data-testid="close-icon" />,
}));

describe('Modal Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not render when isOpen is false', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        
        const { container } = render(
            <Modal isOpen={false} title="Test Title">
                <div>Child Content</div>
            </Modal>
        );
        
        expect(container.firstChild).toBeNull();
    });

    it('renders children when isOpen is true', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        
        render(
            <Modal isOpen={true} title="Test Title">
                <div data-testid="child-content">Child Content</div>
            </Modal>
        );
        
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders the title prop correctly', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        
        render(
            <Modal isOpen={true} title="My Modal Title">
                <div>Content</div>
            </Modal>
        );
        
        expect(screen.getByRole('heading', { name: /my modal title/i })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        const handleClose = vi.fn();
        
        render(
            <Modal isOpen={true} title="Test Title" onClose={handleClose}>
                <div>Content</div>
            </Modal>
        );
        
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        const handleClose = vi.fn();
        
        render(
            <Modal isOpen={true} title="Test Title" onClose={handleClose}>
                <div>Content</div>
            </Modal>
        );
        
        fireEvent.keyDown(document, { key: 'Escape' });
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
