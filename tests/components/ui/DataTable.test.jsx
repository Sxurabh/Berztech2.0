import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, layout, layoutId, ...props }) => props;
    return {
        motion: {
            div: ({ children, ...props }) => <div {...stripProps(props)}>{children}</div>,
            tr: ({ children, ...props }) => <tr {...stripProps(props)}>{children}</tr>,
        },
    };
});

vi.mock('react-icons/fi', () => ({
    FiSearch: () => <span data-testid="search-icon" />,
    FiChevronUp: () => <span data-testid="chevron-up" />,
    FiChevronDown: () => <span data-testid="chevron-down" />,
    FiMoreVertical: () => <span data-testid="more-vertical" />,
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

describe('DataTable Component', () => {
    const mockColumns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status' },
    ];

    const mockData = [
        { id: 1, name: 'Alice', status: 'active' },
        { id: 2, name: 'Bob', status: 'inactive' },
        { id: 3, name: 'Charlie', status: 'active' },
    ];

    it('renders column headers from columns prop', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    });

    it('renders correct number of rows', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        
        render(
            <DataTable columns={mockColumns} data={mockData} />
        );
        
        const rows = screen.getAllByRole('row');
        //3 data rows + 1 header row = 4
        expect(rows).toHaveLength(4);
    });

    it('shows emptyMessage when data array is empty', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        
        render(
            <DataTable columns={mockColumns} data={[]} emptyMessage="No items found" />
        );
        
        expect(screen.getAllByText(/no items found/i)).toHaveLength(2);
    });

    it('search input filters rows by searchKey', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        
        render(
            <DataTable columns={mockColumns} data={mockData} searchKey="name" />
        );
        
        const searchInput = screen.getByPlaceholderText(/search/i);
        
        await userEvent.type(searchInput, 'Alice');
        
        expect(screen.getAllByText(/alice/i).length).toBeGreaterThan(0);
        expect(screen.queryByText(/bob/i)).not.toBeInTheDocument();
    });

    it('clicking sortable column header sorts the data', async () => {
        const DataTable = (await import('@/components/ui/DataTable')).default;
        
        render(
            <DataTable columns={mockColumns} data={mockData} searchKey="name" />
        );
        
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        
        // First click - sort ascending
        fireEvent.click(nameHeader);
        
        // Should show chevron up indicating ascending sort
        expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
        
        // Second click - sort descending
        fireEvent.click(nameHeader);
        
        // Should show chevron down indicating descending sort
        expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });
});
