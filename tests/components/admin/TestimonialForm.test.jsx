import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
    return {
        motion: {
            div: ({ children, ...props }) => <div>{children}</div>,
        },
    };
});

// Mock CornerFrame
vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

// Mock UI components
vi.mock('@/components/ui/Input', () => ({
    default: ({ label, name, value, onChange, placeholder, required, className }) => (
        <div className={className}>
            <label htmlFor={`input-${name}`}>{label}</label>
            <input id={`input-${name}`} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} />
        </div>
    ),
}));

vi.mock('@/components/ui/Textarea', () => ({
    default: ({ label, name, value, onChange, placeholder, required, rows, className }) => (
        <div className={className}>
            <label htmlFor={`textarea-${name}`}>{label}</label>
            <textarea id={`textarea-${name}`} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows} />
        </div>
    ),
}));

vi.mock('@/components/ui/Select', () => ({
    default: ({ label, name, value, onChange, options }) => (
        <div>
            <label htmlFor={`select-${name}`}>{label}</label>
            <select id={`select-${name}`} name={name} value={value} onChange={onChange}>
                {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    ),
}));

// Mock react-icons
vi.mock('react-icons/fi', () => ({
    FiSave: () => <span data-testid="icon-save" />,
    FiX: () => <span data-testid="icon-x" />,
    FiCheck: () => <span data-testid="icon-check" />,
    FiUploadCloud: () => <span data-testid="icon-upload" />,
    FiArrowLeft: () => <span data-testid="icon-arrow-left" />,
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock API client
vi.mock('@/lib/api/client', () => ({
    uploadApi: { upload: vi.fn() },
    testimonialsApi: {
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
}));

import { testimonialsApi } from '@/lib/api/client';
import { toast } from 'react-hot-toast';

describe('TestimonialForm Component', () => {
    let TestimonialForm;

    beforeEach(async () => {
        vi.clearAllMocks();
        TestimonialForm = (await import('@/components/admin/TestimonialForm')).default;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('1. Renders in create mode with empty fields and correct heading', () => {
        render(<TestimonialForm mode="create" />);

        expect(screen.getByText(/new testimonial/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/client name/i)).toHaveValue('');
        expect(screen.getByLabelText(/testimonial content/i)).toHaveValue('');
    });

    it('2. Renders in edit mode and fetches existing data', async () => {
        testimonialsApi.get.mockResolvedValue({
            client: 'Jane Doe',
            role: 'CTO',
            company: 'Acme',
            content: 'Great work!',
            image: '',
            metric: '200%',
            metric_label: 'Growth',
            color: 'emerald',
            featured: true,
        });

        render(<TestimonialForm mode="edit" editId="test-id-1" />);

        await waitFor(() => {
            expect(screen.getByLabelText(/client name/i)).toHaveValue('Jane Doe');
        });
        expect(screen.getByLabelText(/testimonial content/i)).toHaveValue('Great work!');
        expect(screen.getByLabelText(/company/i)).toHaveValue('Acme');
    });

    it('3. Submit in create mode calls testimonialsApi.create', async () => {
        const user = userEvent.setup();
        testimonialsApi.create.mockResolvedValue({ id: 'new-1' });

        render(<TestimonialForm mode="create" />);

        await user.type(screen.getByLabelText(/client name/i), 'John');
        await user.type(screen.getByLabelText(/testimonial content/i), 'Excellent service');
        await user.click(screen.getByRole('button', { name: /save testimonial/i }));

        await waitFor(() => {
            expect(testimonialsApi.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    client: 'John',
                    content: 'Excellent service',
                })
            );
        });
        expect(toast.success).toHaveBeenCalledWith('Testimonial created!');
        expect(mockPush).toHaveBeenCalledWith('/admin/testimonials');
    });

    it('4. Submit in edit mode calls testimonialsApi.update', async () => {
        const user = userEvent.setup();
        testimonialsApi.get.mockResolvedValue({
            client: 'Jane',
            role: '',
            company: '',
            content: 'Old content',
            image: '',
            metric: '',
            metric_label: '',
            color: 'blue',
            featured: false,
        });
        testimonialsApi.update.mockResolvedValue({ id: 'test-id-1' });

        render(<TestimonialForm mode="edit" editId="test-id-1" />);

        await waitFor(() => {
            expect(screen.getByLabelText(/client name/i)).toHaveValue('Jane');
        });

        await user.clear(screen.getByLabelText(/testimonial content/i));
        await user.type(screen.getByLabelText(/testimonial content/i), 'Updated content');
        await user.click(screen.getByRole('button', { name: /save testimonial/i }));

        await waitFor(() => {
            expect(testimonialsApi.update).toHaveBeenCalledWith(
                'test-id-1',
                expect.objectContaining({ content: 'Updated content' })
            );
        });
        expect(toast.success).toHaveBeenCalledWith('Testimonial updated!');
    });

    it('5. API error on create shows error toast', async () => {
        const user = userEvent.setup();
        testimonialsApi.create.mockRejectedValue(new Error('Server down'));

        render(<TestimonialForm mode="create" />);

        await user.type(screen.getByLabelText(/client name/i), 'John');
        await user.type(screen.getByLabelText(/testimonial content/i), 'Content here');
        await user.click(screen.getByRole('button', { name: /save testimonial/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Server down');
        });
    });

    it('6. Featured checkbox toggles correctly', async () => {
        const user = userEvent.setup();
        render(<TestimonialForm mode="create" />);

        const checkbox = screen.getByRole('checkbox', { hidden: true });
        expect(checkbox).not.toBeChecked();

        // Click the label that wraps the checkbox
        await user.click(screen.getByText(/featured testimonial/i));

        expect(checkbox).toBeChecked();
    });

    it('7. Embedded mode with onSuccess callback', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        testimonialsApi.create.mockResolvedValue({ id: 'new-1' });

        render(<TestimonialForm mode="create" embedded={true} onSuccess={onSuccess} />);

        // No heading in embedded mode
        expect(screen.queryByText(/new testimonial/i)).not.toBeInTheDocument();

        await user.type(screen.getByLabelText(/client name/i), 'John');
        await user.type(screen.getByLabelText(/testimonial content/i), 'Great!');
        await user.click(screen.getByRole('button', { name: /save testimonial/i }));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
        // Should NOT navigate when embedded
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('8. Color select changes value', async () => {
        const user = userEvent.setup();
        render(<TestimonialForm mode="create" />);

        const select = screen.getByLabelText(/accent color/i);
        expect(select).toHaveValue('blue');

        await user.selectOptions(select, 'emerald');
        expect(select).toHaveValue('emerald');
    });
});
