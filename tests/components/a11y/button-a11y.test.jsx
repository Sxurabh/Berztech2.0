import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, layout, layoutId, ...props }) => props;
    return {
        motion: {
            span: ({ children, ...props }) => <span {...stripProps(props)}>{children}</span>,
        },
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

describe('Button Accessibility', () => {
    it('should have no accessibility violations', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        const { container } = render(<Button>Click Me</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have proper button role', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button>Click Me</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('should have accessible name from children', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button>Submit Form</Button>);
        
        const button = screen.getByRole('button', { name: /submit form/i });
        expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button>Click Me</Button>);
        
        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();
    });

    it('should have focus-visible styles', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        const { container } = render(<Button>Click Me</Button>);
        
        const button = container.querySelector('button, a');
        button.focus();
        
        expect(button).toHaveClass('focus-visible:outline-none');
    });

    it('should have proper disabled state', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button disabled={true}>Disabled Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('should have proper type attribute', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button type="submit">Submit</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have no accessibility violations when loading', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        const { container } = render(<Button loading={true}>Loading</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when rendered as link', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        const { container } = render(<Button href="/dashboard">Go to Dashboard</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
