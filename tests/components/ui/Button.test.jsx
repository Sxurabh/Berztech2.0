import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

describe('Button Component', () => {
    it('renders with correct label text', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button>Click Me</Button>);
        
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        const handleClick = vi.fn();
        
        render(<Button onClick={handleClick}>Click Me</Button>);
        
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        const handleClick = vi.fn();
        
        render(<Button onClick={handleClick} disabled={true}>Click Me</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        
        await userEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies correct variant classes for primary', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        const { container } = render(<Button variant="primary">Primary</Button>);
        
        const cornerFrame = container.querySelector('[data-testid="corner-frame"]');
        expect(cornerFrame.className).toContain('bg-neutral-900');
    });

    it('applies correct variant classes for secondary', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        const { container } = render(<Button variant="secondary">Secondary</Button>);
        
        const cornerFrame = container.querySelector('[data-testid="corner-frame"]');
        expect(cornerFrame.className).toContain('bg-white');
    });

    it('shows loading spinner when loading prop is true', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        render(<Button loading={true}>Click Me</Button>);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies correct variant classes for danger', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        const { container } = render(<Button variant="danger">Danger</Button>);
        
        const cornerFrame = container.querySelector('[data-testid="corner-frame"]');
        expect(cornerFrame.className).toContain('bg-red-600');
    });

    it('renders as Link when href is provided', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        render(<Button href="/dashboard">Go to Dashboard</Button>);
        
        expect(screen.getByRole('link')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
    });

    it('renders as button when href is provided but disabled', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        render(<Button href="/dashboard" disabled>Go to Dashboard</Button>);
        
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies fullWidth class when fullWidth is true', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        const { container } = render(<Button fullWidth={true}>Full Width</Button>);
        
        // fullWidth applies "w-full sm:w-auto" - check the wrapper div
        const wrapper = container.querySelector('.inline-block');
        expect(wrapper).toHaveClass('w-full');
    });

    it('renders arrow when showArrow is true', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        render(<Button showArrow={true}>With Arrow</Button>);
        
        expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('renders button with type submit', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        render(<Button type="submit">Submit</Button>);
        
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('renders button with type reset', async () => {
        const Button = (await import('@/components/ui/Button')).default;
        
        render(<Button type="reset">Reset</Button>);
        
        expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
});

