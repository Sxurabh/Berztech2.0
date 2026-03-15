import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogFeed from '@/components/features/blog/BlogFeed';

vi.mock('framer-motion', () => ({
    motion: {
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('@/components/features/blog/FeaturedPost', () => ({
    default: ({ post }) => <div data-testid="featured-post">{post?.title}</div>,
}));

vi.mock('@/components/features/blog/PostCard', () => ({
    default: ({ post }) => <div data-testid="post-card">{post.title}</div>,
}));

const mockPosts = [
    { id: '1', title: 'Post 1', category: 'Tech', featured: true },
    { id: '2', title: 'Post 2', category: 'Tech', featured: false },
    { id: '3', title: 'Post 3', category: 'Design', featured: false },
];

describe('BlogFeed Component', () => {
    it('renders with empty posts', () => {
        render(<BlogFeed initialPosts={[]} />);
        
        expect(document.getElementById('blog-feed')).toBeInTheDocument();
    });

    it('renders posts', () => {
        render(<BlogFeed initialPosts={mockPosts} />);
        
        const postCards = screen.getAllByTestId('post-card');
        expect(postCards.length).toBeGreaterThan(0);
    });

    it('renders category filters', () => {
        render(<BlogFeed initialPosts={mockPosts} categories={['All', 'Tech', 'Design']} />);
        
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Tech')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('renders featured post', () => {
        render(<BlogFeed initialPosts={mockPosts} />);
        
        expect(screen.getByTestId('featured-post')).toBeInTheDocument();
    });
});
