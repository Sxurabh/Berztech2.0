import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkHeader from '@/components/features/work/WorkHeader';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('WorkHeader Component', () => {
    it('renders main heading', () => {
        render(<WorkHeader />);
        
        expect(screen.getByText('Proven solutions for')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
        render(<WorkHeader />);
        
        expect(screen.getByText('real-world problems')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<WorkHeader />);
        
        expect(screen.getByText(/We partner with ambitious companies/)).toBeInTheDocument();
    });

    it('renders Our Work label', () => {
        render(<WorkHeader />);
        
        expect(screen.getByText('Our Work')).toBeInTheDocument();
    });
});
