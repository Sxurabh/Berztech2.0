import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LegalModal from '@/components/ui/LegalModal';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({ children, onClick, ...props }) => (
                <div data-testid="motion-div" onClick={onClick} {...props}>
                    {children}
                </div>
            ),
        },
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, ...props }) => <div data-testid="corner-frame" {...props}>{children}</div>,
}));

describe('LegalModal Component', () => {
    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <LegalModal isOpen={false} onClose={() => {}} type="privacy" />
        );
        
        expect(container.firstChild).toBeNull();
    });

    it('renders privacy policy title when type is privacy', () => {
        render(
            <LegalModal isOpen={true} onClose={() => {}} type="privacy" />
        );
        
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });

    it('renders terms of service title when type is terms', () => {
        render(
            <LegalModal isOpen={true} onClose={() => {}} type="terms" />
        );
        
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <LegalModal isOpen={true} onClose={onClose} type="privacy" />
        );
        
        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);
        
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
