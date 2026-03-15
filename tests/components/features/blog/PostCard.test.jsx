import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostCard from '@/components/features/blog/PostCard';

vi.mock('framer-motion', () => ({
    motion: {
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

vi.mock('next/image', () => ({
    default: (props) => <img {...props} />,
}));

const mockPost = {
    id: 'post-1',
    title: 'Test Blog Post',
    excerpt: 'This is a test excerpt for the blog post.',
    image: '/test-image.jpg',
    category: 'Technology',
    date: '2024-01-15',
    readTime: '5 min read',
    author: 'John Doe',
    color: 'blue',
};

describe('PostCard Component', () => {
    it('renders post title', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    it('renders post excerpt', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        expect(screen.getByText('This is a test excerpt for the blog post.')).toBeInTheDocument();
    });

    it('renders category badge', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders date and read time', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        expect(screen.getByText('2024-01-15')).toBeInTheDocument();
        expect(screen.getByText('5 min read')).toBeInTheDocument();
    });

    it('renders author name', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders author initial', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders link to blog post', () => {
        render(<PostCard post={mockPost} index={0} />);
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/blog/post-1');
    });

    it('renders with different index', () => {
        render(<PostCard post={mockPost} index={2} />);
        
        expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });
});
