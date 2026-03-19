import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/ui/PageHeader';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('PageHeader Component', () => {
    it('renders title correctly', () => {
        render(<PageHeader title="Page Title" />);
        
        expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('renders eyebrow when provided', () => {
        render(<PageHeader title="Title" eyebrow="Eyebrow Text" />);
        
        expect(screen.getByText('Eyebrow Text')).toBeInTheDocument();
    });

    it('does not render eyebrow when not provided', () => {
        render(<PageHeader title="Title" />);
        
        const spans = screen.getAllByText('Title');
        expect(spans.length).toBe(1);
    });

    it('renders subtitle when provided', () => {
        render(<PageHeader title="Title" subtitle="Subtitle" />);
        
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
        render(<PageHeader title="Title" description="Description text" />);
        
        expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders action when provided', () => {
        render(<PageHeader title="Title" action={<button>Action</button>} />);
        
        expect(screen.getByRole('button')).toHaveTextContent('Action');
    });

    it('renders all props together', () => {
        render(
            <PageHeader 
                title="Full Title" 
                eyebrow="EYEBROW"
                subtitle="Subtitle"
                description="Description"
                action={<button>Button</button>}
            />
        );
        
        expect(screen.getByText('Full Title')).toBeInTheDocument();
        expect(screen.getByText('EYEBROW')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveTextContent('Button');
    });

    it('applies custom className', () => {
        const { container } = render(<PageHeader title="Title" className="custom-class" />);
        
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
