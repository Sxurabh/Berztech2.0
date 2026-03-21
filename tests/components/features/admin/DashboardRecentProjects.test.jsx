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

describe('DashboardRecentProjects', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the section heading', async () => {
        const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
        render(
            <DashboardRecentProjects
                projects={[]}
                loading={false}
                onNewProject={vi.fn()}
                onEditProject={vi.fn()}
            />
        );
        expect(screen.getByText(/recent projects/i)).toBeInTheDocument();
    });

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
        expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
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
    });

    it('renders project list items with client names', async () => {
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

    it('calls onEditProject with correct id when row is clicked', async () => {
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
