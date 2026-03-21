import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('react-icons/fi', () => ({
    FiArrowRight: () => <span data-testid="arrow-right" />,
    FiPlus: () => <span data-testid="plus-icon" />,
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className} {...props}>{children}</div>
    ),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('Async States — Admin Dashboard Components', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    describe('DashboardRecentProjects — Loading & Empty States', () => {
        it('shows loading skeleton when loading is true', async () => {
            const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
            render(
                <DashboardRecentProjects
                    projects={[]}
                    loading={true}
                    onNewProject={vi.fn()}
                    onEditProject={vi.fn()}
                />
            );
            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('shows empty state when projects array is empty', async () => {
            const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
            render(
                <DashboardRecentProjects
                    projects={[]}
                    loading={false}
                    onNewProject={vi.fn()}
                    onEditProject={vi.fn()}
                />
            );
            expect(screen.getByText(/no projects/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
        });

        it('shows empty state when projects is null', async () => {
            const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
            render(
                <DashboardRecentProjects
                    projects={null}
                    loading={false}
                    onNewProject={vi.fn()}
                    onEditProject={vi.fn()}
                />
            );
            expect(screen.getByText(/no projects/i)).toBeInTheDocument();
        });

        it('renders project list when projects are provided', async () => {
            const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
            const mockProjects = [
                { id: 'p1', title: 'Acme Corp', client: 'Acme Corp', created_at: '2025-01-15T00:00:00Z' },
                { id: 'p2', title: 'Beta Inc', client: 'Beta Inc', created_at: '2025-01-10T00:00:00Z' },
            ];
            render(
                <DashboardRecentProjects
                    projects={mockProjects}
                    loading={false}
                    onNewProject={vi.fn()}
                    onEditProject={vi.fn()}
                />
            );
            expect(screen.getByText('Acme Corp')).toBeInTheDocument();
            expect(screen.getByText('Beta Inc')).toBeInTheDocument();
        });

        it('calls onEditProject when project row is clicked', async () => {
            const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
            const onEditProject = vi.fn();
            const mockProjects = [
                { id: 'p1', title: 'Acme Corp', client: 'Acme Corp', created_at: '2025-01-15T00:00:00Z' },
            ];
            render(
                <DashboardRecentProjects
                    projects={mockProjects}
                    loading={false}
                    onNewProject={vi.fn()}
                    onEditProject={onEditProject}
                />
            );
            fireEvent.click(screen.getByText('Acme Corp'));
            expect(onEditProject).toHaveBeenCalledWith('p1');
        });

        it('calls onNewProject when add project button is clicked', async () => {
            const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
            const onNewProject = vi.fn();
            render(
                <DashboardRecentProjects
                    projects={[]}
                    loading={false}
                    onNewProject={onNewProject}
                    onEditProject={vi.fn()}
                />
            );
            fireEvent.click(screen.getByRole('button', { name: /add project/i }));
            expect(onNewProject).toHaveBeenCalled();
        });
    });

    describe('DashboardRecentTestimonials — Loading & Empty States', () => {
        it('shows loading skeleton when loading is true', async () => {
            const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
            render(
                <DashboardRecentTestimonials
                    testimonials={[]}
                    loading={true}
                    onNewTestimonial={vi.fn()}
                    onEditTestimonial={vi.fn()}
                />
            );
            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('shows empty state when testimonials array is empty', async () => {
            const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
            render(
                <DashboardRecentTestimonials
                    testimonials={[]}
                    loading={false}
                    onNewTestimonial={vi.fn()}
                    onEditTestimonial={vi.fn()}
                />
            );
            expect(screen.getByText(/no testimonials/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add testimonial/i })).toBeInTheDocument();
        });

        it('shows empty state when testimonials is null', async () => {
            const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
            render(
                <DashboardRecentTestimonials
                    testimonials={null}
                    loading={false}
                    onNewTestimonial={vi.fn()}
                    onEditTestimonial={vi.fn()}
                />
            );
            expect(screen.getByText(/no testimonials/i)).toBeInTheDocument();
        });

        it('renders testimonial list with client names and quotes', async () => {
            const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
            const mockTestimonials = [
                { id: 't1', client: 'Jane Doe', company: 'Acme Corp', content: 'Great work!' },
                { id: 't2', client: 'John Smith', company: 'Beta Inc', content: 'Highly recommend.' },
            ];
            render(
                <DashboardRecentTestimonials
                    testimonials={mockTestimonials}
                    loading={false}
                    onNewTestimonial={vi.fn()}
                    onEditTestimonial={vi.fn()}
                />
            );
            expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
            expect(screen.getByText(/john smith/i)).toBeInTheDocument();
            expect(screen.getByText(/"great work!"/i)).toBeInTheDocument();
        });

        it('calls onEditTestimonial when testimonial row is clicked', async () => {
            const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
            const onEditTestimonial = vi.fn();
            const mockTestimonials = [
                { id: 't1', client: 'Jane Doe', company: 'Acme Corp', content: 'Great work!' },
            ];
            render(
                <DashboardRecentTestimonials
                    testimonials={mockTestimonials}
                    loading={false}
                    onNewTestimonial={vi.fn()}
                    onEditTestimonial={onEditTestimonial}
                />
            );
            fireEvent.click(screen.getByText(/jane doe/i));
            expect(onEditTestimonial).toHaveBeenCalledWith('t1');
        });
    });

    describe('DashboardRecentPosts — Loading & Empty States', () => {
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
            expect(screen.getByRole('button', { name: /write post/i })).toBeInTheDocument();
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
        });

        it('renders published and draft posts correctly', async () => {
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
            expect(screen.getAllByText(/live|draft/i).length).toBeGreaterThan(0);
        });

        it('calls onEditPost when post row is clicked', async () => {
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
    });

    describe('DashboardQuickActions — Interaction States', () => {
        it('renders three quick action cards', async () => {
            const DashboardQuickActions = (await import('@/components/features/admin/DashboardQuickActions')).default;
            render(
                <DashboardQuickActions
                    onNewProject={vi.fn()}
                    onNewTestimonial={vi.fn()}
                    onNewBlogPost={vi.fn()}
                />
            );
            expect(screen.getByText('New Project')).toBeInTheDocument();
            expect(screen.getByText('New Testimonial')).toBeInTheDocument();
            expect(screen.getByText('New Blog Post')).toBeInTheDocument();
        });

        it('shows correct subtitles for each action', async () => {
            const DashboardQuickActions = (await import('@/components/features/admin/DashboardQuickActions')).default;
            render(
                <DashboardQuickActions
                    onNewProject={vi.fn()}
                    onNewTestimonial={vi.fn()}
                    onNewBlogPost={vi.fn()}
                />
            );
            expect(screen.getByText('Add case study')).toBeInTheDocument();
            expect(screen.getByText('Add client review')).toBeInTheDocument();
            expect(screen.getByText('Write article')).toBeInTheDocument();
        });

        it('calls onNewProject when first card is clicked', async () => {
            const DashboardQuickActions = (await import('@/components/features/admin/DashboardQuickActions')).default;
            const onNewProject = vi.fn();
            render(
                <DashboardQuickActions
                    onNewProject={onNewProject}
                    onNewTestimonial={vi.fn()}
                    onNewBlogPost={vi.fn()}
                />
            );
            fireEvent.click(screen.getByText('New Project'));
            expect(onNewProject).toHaveBeenCalled();
        });

        it('calls onNewTestimonial when second card is clicked', async () => {
            const DashboardQuickActions = (await import('@/components/features/admin/DashboardQuickActions')).default;
            const onNewTestimonial = vi.fn();
            render(
                <DashboardQuickActions
                    onNewProject={vi.fn()}
                    onNewTestimonial={onNewTestimonial}
                    onNewBlogPost={vi.fn()}
                />
            );
            fireEvent.click(screen.getByText('New Testimonial'));
            expect(onNewTestimonial).toHaveBeenCalled();
        });

        it('calls onNewBlogPost when third card is clicked', async () => {
            const DashboardQuickActions = (await import('@/components/features/admin/DashboardQuickActions')).default;
            const onNewBlogPost = vi.fn();
            render(
                <DashboardQuickActions
                    onNewProject={vi.fn()}
                    onNewTestimonial={vi.fn()}
                    onNewBlogPost={onNewBlogPost}
                />
            );
            fireEvent.click(screen.getByText('New Blog Post'));
            expect(onNewBlogPost).toHaveBeenCalled();
        });
    });
});
