import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className} {...props}>{children}</div>
    ),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('DashboardRecentPosts', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the section heading', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        render(
            <DashboardRecentPosts
                posts={[]}
                loading={false}
                onNewPost={vi.fn()}
                onEditPost={vi.fn()}
            />
        );
        expect(screen.getByText(/recent blog posts/i)).toBeInTheDocument();
    });

    it('shows loading skeleton when loading is true', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        render(
            <DashboardRecentPosts
                posts={[]}
                loading={true}
                onNewPost={vi.fn()}
                onEditPost={vi.fn()}
            />
        );
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows empty state when posts is null', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        render(
            <DashboardRecentPosts
                posts={null}
                loading={false}
                onNewPost={vi.fn()}
                onEditPost={vi.fn()}
            />
        );
        expect(screen.getByText(/no posts/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /write post/i })).toBeInTheDocument();
    });

    it('shows empty state when posts array is empty', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        render(
            <DashboardRecentPosts
                posts={[]}
                loading={false}
                onNewPost={vi.fn()}
                onEditPost={vi.fn()}
            />
        );
        expect(screen.getByText(/no posts/i)).toBeInTheDocument();
    });

    it('renders post list items with title and status', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        const mockPosts = [
            { id: 'post1', title: 'First Post', published: true, created_at: '2025-01-15T00:00:00Z' },
            { id: 'post2', title: 'Draft Post', published: false, created_at: '2025-01-10T00:00:00Z' },
        ];
        render(
            <DashboardRecentPosts
                posts={mockPosts}
                loading={false}
                onNewPost={vi.fn()}
                onEditPost={vi.fn()}
            />
        );
        expect(screen.getByText('First Post')).toBeInTheDocument();
        expect(screen.getByText('Draft Post')).toBeInTheDocument();
    });

    it('calls onEditPost with correct id when row is clicked', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        const onEditPost = vi.fn();
        const mockPosts = [
            { id: 'post1', title: 'First Post', published: true, created_at: '2025-01-15T00:00:00Z' },
        ];
        render(
            <DashboardRecentPosts
                posts={mockPosts}
                loading={false}
                onNewPost={vi.fn()}
                onEditPost={onEditPost}
            />
        );
        fireEvent.click(screen.getByText('First Post'));
        expect(onEditPost).toHaveBeenCalledWith('post1');
    });

    it('calls onNewPost when write post button is clicked', async () => {
        const DashboardRecentPosts = (await import('@/components/features/admin/DashboardRecentPosts')).default;
        const onNewPost = vi.fn();
        render(
            <DashboardRecentPosts
                posts={[]}
                loading={false}
                onNewPost={onNewPost}
                onEditPost={vi.fn()}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /write post/i }));
        expect(onNewPost).toHaveBeenCalled();
    });
});
