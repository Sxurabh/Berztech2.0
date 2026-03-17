import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, ...props }) => props;
    return {
        motion: {
            div: ({ children, ...props }) => <div {...stripProps(props)}>{children}</div>,
            tr: ({ children, ...props }) => <tr {...stripProps(props)}>{children}</tr>,
        },
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

describe('DataTable Accessibility', () => {
    const mockColumns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status', sortable: true }
    ];

    const mockData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
    ];

    it('should have no accessibility violations', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        const { container } = render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have proper table structure', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
    });

    it('should have table headers with scope attribute', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        const headers = screen.getAllByRole('columnheader');
        headers.forEach(header => {
            expect(header).toHaveAttribute('scope', 'col');
        });
    });

    it('should have accessible name from caption or aria-label', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        const table = screen.getByRole('table');
        expect(table).toHaveAttribute('aria-label');
    });

    it('should have sortable columns with proper aria-sort', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        const columnsWithSortable = [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Status', sortable: true }
        ];
        
        render(
            <DataTable columns={columnsWithSortable} data={mockData} searchKey="name" />
        );
        
        const sortableHeaders = screen.getAllByRole('columnheader');
        const nameHeader = sortableHeaders[0];
        expect(nameHeader).toHaveAttribute('aria-sort');
    });

    it('should have search input with accessible label', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        render(
            <DataTable columns={mockColumns} data={mockData} searchKey="name" />
        );
        
        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toBeInTheDocument();
    });

    it('should have row count announcement', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        const results = screen.getByText(/\d+ items?/i);
        expect(results).toBeInTheDocument();
    });

    it('should have no accessibility violations with empty data', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        const { container } = render(
            <DataTable columns={mockColumns} data={[]} emptyMessage="No results found" />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have proper cell associations with headers', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBeGreaterThan(0);
        
        const headers = screen.getAllByRole('columnheader');
        expect(cells.length).toBe(mockData.length * headers.length);
    });
});
