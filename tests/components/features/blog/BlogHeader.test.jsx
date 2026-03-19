import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogHeader from '@/components/features/blog/BlogHeader';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('BlogHeader Component', () => {
    it('renders main heading', () => {
        render(<BlogHeader />);
        
        expect(screen.getByText('The latest articles')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
        render(<BlogHeader />);
        
        expect(screen.getByText('and insights')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<BlogHeader />);
        
        expect(screen.getByText(/Thoughts on engineering/)).toBeInTheDocument();
    });

    it('renders blog label', () => {
        render(<BlogHeader />);
        
        expect(screen.getByText('Blog')).toBeInTheDocument();
    });
});
