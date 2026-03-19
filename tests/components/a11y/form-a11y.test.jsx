import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        form: ({ children, ...props }) => <form {...props}>{children}</form>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }) => children,
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

vi.mock('@/components/ui/Input', () => ({
    default: ({ label, error, id, ...props }) => (
        <div>
            {label && <label htmlFor={id}>{label}</label>}
            <input id={id} aria-invalid={error ? "true" : undefined} {...props} />
            {error && <p role="alert">{error}</p>}
        </div>
    ),
}));

vi.mock('@/components/ui/Select', () => ({
    default: ({ label, options, error, id, ...props }) => (
        <div>
            {label && <label htmlFor={id}>{label}</label>}
            <select id={id} aria-invalid={error ? "true" : undefined} {...props}>
                {options?.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
            {error && <p role="alert">{error}</p>}
        </div>
    ),
}));

describe('ContactForm Accessibility', () => {
    it('should have no accessibility violations', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        const { container } = render(<ContactForm />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have form with proper structure', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        render(<ContactForm />);
        
        const form = document.querySelector('form');
        expect(form).toBeInTheDocument();
    });

    it('should have all form inputs with associated labels', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        render(<ContactForm />);
        
        const inputs = document.querySelectorAll('input, textarea, select');
        expect(inputs.length).toBeGreaterThan(0);
        
        inputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            expect(label).not.toBeNull();
        });
    });

    it('should have submit button with accessible name', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        render(<ContactForm />);
        
        const submitButton = screen.getByRole('button', { name: /send request/i });
        expect(submitButton).toBeInTheDocument();
    });
});

describe('Newsletter Accessibility', () => {
    it('should have no accessibility violations', async () => {
        const Newsletter = (await import('@/components/features/blog/Newsletter')).default;
        const { container } = render(<Newsletter />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have form with accessible name', async () => {
        const Newsletter = (await import('@/components/features/blog/Newsletter')).default;
        render(<Newsletter />);
        
        const form = document.querySelector('form');
        expect(form).toBeInTheDocument();
    });

    it('should have email input with associated label', async () => {
        const Newsletter = (await import('@/components/features/blog/Newsletter')).default;
        render(<Newsletter />);
        
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toBeInTheDocument();
    });

    it('should have subscribe button with accessible name', async () => {
        const Newsletter = (await import('@/components/features/blog/Newsletter')).default;
        render(<Newsletter />);
        
        const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
        expect(subscribeButton).toBeInTheDocument();
    });

    it('should indicate required fields', async () => {
        const Newsletter = (await import('@/components/features/blog/Newsletter')).default;
        render(<Newsletter />);
        
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toBeRequired();
    });

    it('should have proper input type for email', async () => {
        const Newsletter = (await import('@/components/features/blog/Newsletter')).default;
        render(<Newsletter />);
        
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute('type', 'email');
    });
});
