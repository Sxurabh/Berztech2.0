import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

vi.mock('framer-motion', () => ({
    motion: {
        div: (props) => <div data-testid="motion-div" {...props} />,
    },
    AnimatePresence: ({ children }) => <div data-testid="animate-presence">{children}</div>,
}));

vi.mock('react-icons/fi', () => ({
    FiX: () => <span data-testid="close-icon" />,
}));

describe('Modal Accessibility', () => {
    it('should render with proper accessibility attributes', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        
        render(
            <Modal isOpen={true} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        );
        
        const dialog = await screen.findByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby');
        
        const closeButton = await screen.findByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
        
        const heading = await screen.findByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
    });

    it('should not render when closed', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        
        const { container } = render(
            <Modal isOpen={false} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        );
        
        const dialog = container.querySelector('[role="dialog"]');
        expect(dialog).not.toBeInTheDocument();
    });

    it('should have no accessibility violations when open', async () => {
        const Modal = (await import('@/components/ui/Modal')).default;
        
        const { container } = render(
            <Modal isOpen={true} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        );
        
        await screen.findByRole('dialog');
        
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    }, 15000);
});
