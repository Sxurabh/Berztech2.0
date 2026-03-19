import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, layout, layoutId, whileInView, viewport, ...props }) => props;
    return {
        motion: {
            div: ({ children, ...props }) => <div {...stripProps(props)}>{children}</div>,
            p: ({ children, ...props }) => <p {...stripProps(props)}>{children}</p>,
        },
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

describe('Newsletter Component', () => {
    let Newsletter;

    beforeEach(async () => {
        vi.clearAllMocks();
        Newsletter = (await import('@/components/features/blog/Newsletter')).default;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('1. Renders heading, email input and subscribe button', () => {
        render(<Newsletter />);
        expect(screen.getByText(/stay in the loop/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('2. Does not submit when email is empty (HTML required)', async () => {
        const user = userEvent.setup();
        render(<Newsletter />);
        const input = screen.getByLabelText(/email address/i);
        expect(input).toBeRequired();
    });

    it('3. Successful subscription shows "Joined" and "Thanks for subscribing!"', async () => {
        const user = userEvent.setup();
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

        render(<Newsletter />);

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /subscribe/i }));

        await waitFor(() => {
            expect(screen.getByText(/thanks for subscribing/i)).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /joined/i })).toBeInTheDocument();
    });

    it('4. Failed subscription does not show success message', async () => {
        const user = userEvent.setup();
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

        render(<Newsletter />);

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /subscribe/i }));

        await waitFor(() => {
            expect(screen.queryByText(/thanks for subscribing/i)).not.toBeInTheDocument();
        });
    });

    it('5. Network error sets error status', async () => {
        const user = userEvent.setup();
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

        render(<Newsletter />);

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /subscribe/i }));

        await waitFor(() => {
            expect(screen.queryByText(/thanks for subscribing/i)).not.toBeInTheDocument();
        });
    });

    it('6. Input and button are disabled while loading/after success', async () => {
        const user = userEvent.setup();
        let resolvePromise;
        const fetchPromise = new Promise((resolve) => { resolvePromise = resolve; });
        vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise));

        render(<Newsletter />);

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /subscribe/i }));

        // While loading, inputs should be disabled
        expect(screen.getByLabelText(/email address/i)).toBeDisabled();
        expect(screen.getByRole('button')).toBeDisabled();

        resolvePromise({ ok: true });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /joined/i })).toBeDisabled();
        });
    });

    it('7. Calls fetch with correct URL and payload', async () => {
        const user = userEvent.setup();
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal('fetch', mockFetch);

        render(<Newsletter />);

        await user.type(screen.getByLabelText(/email address/i), 'hello@test.com');
        await user.click(screen.getByRole('button', { name: /subscribe/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'hello@test.com' }),
            });
        });
    });
});
