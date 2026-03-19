import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import FeaturedPost from '@/components/features/blog/FeaturedPost';

vi.mock('framer-motion', () => ({
    motion: {
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

vi.mock('next/image', () => ({
    default: (props) => <img {...props} />,
}));

describe('FeaturedPost', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    const mockPost = {
        id: 'featured-1',
        title: 'Featured Blog Post',
        excerpt: 'This is the featured post excerpt that showcases the main article.',
        image: '/featured-image.jpg',
        category: 'Technology',
        date: '2024-03-15',
        readTime: '8 min read',
        author: 'John Doe',
        color: 'blue',
    };

    it('renders the featured post title', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText('Featured Blog Post')).toBeInTheDocument();
    });

    it('renders the excerpt', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText(/This is the featured post excerpt/)).toBeInTheDocument();
    });

    it('renders the category badge', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders the Featured badge', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('renders author name and initial', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders read time', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText('8 min read')).toBeInTheDocument();
    });

    it('renders date', () => {
        render(<FeaturedPost post={mockPost} />);
        
        expect(screen.getByText('2024-03-15')).toBeInTheDocument();
    });

    it('renders link to post', () => {
        render(<FeaturedPost post={mockPost} />);
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/blog/featured-1');
    });
});
