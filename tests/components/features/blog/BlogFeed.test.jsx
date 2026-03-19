import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
    default: ({ post }) => <article data-testid="post-card">{post.title}</article>,
}));

describe('BlogFeed', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
        window.scrollTo = vi.fn();
    });

    const mockPosts = [
        { id: '1', title: 'Post 1', category: 'Tech', featured: true },
        { id: '2', title: 'Post 2', category: 'Tech', featured: false },
        { id: '3', title: 'Post 3', category: 'Design', featured: false },
        { id: '4', title: 'Post 4', category: 'Design', featured: false },
        { id: '5', title: 'Post 5', category: 'Tech', featured: false },
        { id: '6', title: 'Post 6', category: 'Tech', featured: false },
        { id: '7', title: 'Post 7', category: 'Tech', featured: false },
    ];

    it('renders category buttons', () => {
        render(<BlogFeed initialPosts={mockPosts} categories={['All', 'Tech', 'Design']} />);
        
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Tech')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('shows featured post when All is selected by default', () => {
        render(<BlogFeed initialPosts={mockPosts} categories={['All', 'Tech', 'Design']} />);
        
        expect(screen.getByTestId('featured-post')).toBeInTheDocument();
    });

    it('excludes featured post from grid', () => {
        render(<BlogFeed initialPosts={mockPosts} categories={['All']} />);
        
        const postCards = screen.getAllByTestId('post-card');
        const postTitles = postCards.map(card => card.textContent);
        
        expect(postTitles).not.toContain('Post 1');
    });

    it('renders post cards in grid', () => {
        render(<BlogFeed initialPosts={mockPosts} categories={['All']} />);
        
        const postCards = screen.getAllByTestId('post-card');
        expect(postCards.length).toBeGreaterThan(0);
    });

    it('shows pagination when there are more than 5 posts after excluding featured', () => {
        render(<BlogFeed initialPosts={mockPosts} />);
        
        expect(screen.getByText('← Previous')).toBeInTheDocument();
        expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    it('disables Previous button on first page', () => {
        render(<BlogFeed initialPosts={mockPosts} />);
        
        const prevButton = screen.getByText('← Previous');
        expect(prevButton).toBeDisabled();
    });

    it('renders grid layout', () => {
        render(<BlogFeed initialPosts={mockPosts} />);
        
        const gridContainer = document.querySelector('.grid');
        expect(gridContainer).toBeInTheDocument();
    });
});
