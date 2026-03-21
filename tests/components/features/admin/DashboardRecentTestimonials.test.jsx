import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('react-icons/fi', () => ({
    FiArrowRight: () => <span data-testid="arrow-right" />,
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className} {...props}>{children}</div>
    ),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('DashboardRecentTestimonials', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the section heading', async () => {
        const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
        render(
            <DashboardRecentTestimonials
                testimonials={[]}
                loading={false}
                onNewTestimonial={vi.fn()}
                onEditTestimonial={vi.fn()}
            />
        );
        expect(screen.getByText(/recent testimonials/i)).toBeInTheDocument();
    });

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
        expect(screen.getByRole('button', { name: /add testimonial/i })).toBeInTheDocument();
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
    });

    it('renders testimonial list items with client names and quotes', async () => {
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

    it('calls onEditTestimonial with correct id when row is clicked', async () => {
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

    it('calls onNewTestimonial when add testimonial button is clicked', async () => {
        const DashboardRecentTestimonials = (await import('@/components/features/admin/DashboardRecentTestimonials')).default;
        const onNewTestimonial = vi.fn();
        render(
            <DashboardRecentTestimonials
                testimonials={[]}
                loading={false}
                onNewTestimonial={onNewTestimonial}
                onEditTestimonial={vi.fn()}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /add testimonial/i }));
        expect(onNewTestimonial).toHaveBeenCalled();
    });
});
