import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('react-icons/fi', () => ({
    FiPlus: () => <span data-testid="plus-icon" />,
    FiArrowRight: () => <span data-testid="arrow-right" />,
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className} {...props}>{children}</div>
    ),
}));

describe('DashboardQuickActions', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the three quick action cards', async () => {
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
