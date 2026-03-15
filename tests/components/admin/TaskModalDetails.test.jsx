import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskModalDetails from '@/components/admin/TaskModalDetails';

const mockColumns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'in_review', title: 'In Review' },
    { id: 'completed', title: 'Completed' },
];

vi.mock('./KanbanBoard', () => ({
    COLUMNS: mockColumns,
}));

describe('TaskModalDetails Component', () => {
    const defaultProps = {
        title: 'Test Task',
        setTitle: () => {},
        description: 'Test description',
        setDescription: () => {},
        status: 'backlog',
        setStatus: () => {},
        priority: 'medium',
        setPriority: () => {},
    };

    it('renders without crashing', () => {
        expect(() => render(<TaskModalDetails {...defaultProps} />)).not.toThrow();
    });
});
