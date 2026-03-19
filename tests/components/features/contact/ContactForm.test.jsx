import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, layout, layoutId, ...props }) => props;
    return {
        motion: {
            div: ({ children, ...props }) => <div {...stripProps(props)}>{children}</div>,
            span: ({ children, ...props }) => <span {...stripProps(props)}>{children}</span>,
        },
        AnimatePresence: ({ children }) => children,
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ContactForm Component', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders with all expected fields visible', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        render(<ContactForm />);
        
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/project details/i)).toBeInTheDocument();
    });

    it('shows validation error when submitting without required fields', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        render(<ContactForm />);
        
        const submitButton = screen.getByRole('button', { name: /send request/i });
        await userEvent.click(submitButton);
        
        expect(screen.getByLabelText(/name/i)).toBeInvalid();
    });

    it('shows validation error for invalid email format', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        render(<ContactForm />);
        
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);
        
        expect(emailInput).toBeInvalid();
    });

    it('calls fetch with POST when valid form is submitted', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });
        
        render(<ContactForm />);
        
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send request/i });
        await userEvent.click(submitButton);
        
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/requests', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining('John Doe'),
            }));
        });
    });

    it('shows success message after successful submission', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });
        
        render(<ContactForm />);
        
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send request/i });
        await userEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/message received/i)).toBeInTheDocument();
        });
    });

    it('shows error message when API fails', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });
        
        render(<ContactForm />);
        
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send request/i });
        await userEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        });
    });

    it('shows loading state while submitting', async () => {
        let resolveFetch;
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        vi.mocked(fetch).mockImplementationOnce(() => 
            new Promise((resolve) => {
                resolveFetch = resolve;
            })
        );
        
        render(<ContactForm />);
        
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send request/i });
        await userEvent.click(submitButton);
        
        expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
        
        resolveFetch({ ok: true, json: async () => ({}) });
    });

    it('fields accept and display typed input correctly', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        render(<ContactForm />);
        
        const nameInput = screen.getByLabelText(/name/i);
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
        
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'john@example.com');
        expect(emailInput).toHaveValue('john@example.com');
    });

    it('enforces message length validation (max 1000 chars)', async () => {
        const ContactForm = (await import('@/components/features/contact/ContactForm')).default;
        
        render(<ContactForm />);
        
        const messageInput = screen.getByLabelText(/project details/i);
        expect(messageInput).toHaveAttribute('maxLength', '1000');
    });
});
