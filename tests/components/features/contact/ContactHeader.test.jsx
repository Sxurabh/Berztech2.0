import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactHeader from '@/components/features/contact/ContactHeader';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('ContactHeader Component', () => {
    it('renders main heading', () => {
        render(<ContactHeader />);
        
        expect(screen.getByText("Let's work")).toBeInTheDocument();
    });

    it('renders subtitle', () => {
        render(<ContactHeader />);
        
        expect(screen.getByText('together')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<ContactHeader />);
        
        expect(screen.getByText(/Tell us about your project/)).toBeInTheDocument();
    });

    it('renders Contact us label', () => {
        render(<ContactHeader />);
        
        expect(screen.getByText('Contact us')).toBeInTheDocument();
    });
});
