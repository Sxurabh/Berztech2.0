import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GridBackground from '@/components/ui/GridBackground';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    useMotionValue: vi.fn(() => ({ set: vi.fn() })),
    useMotionTemplate: vi.fn(() => ({})),
}));

describe('GridBackground Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<GridBackground />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with custom opacity', () => {
        const { container } = render(<GridBackground opacity={0.1} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with custom size', () => {
        const { container } = render(<GridBackground size={64} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with both custom props', () => {
        const { container } = render(<GridBackground opacity={0.1} size={64} />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
