import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('framer-motion', () => {
    const stripProps = ({ whileHover, whileTap, initial, animate, exit, transition, variants, ...props }) => props;
    return {
        motion: {
            button: ({ children, ...props }) => <button {...stripProps(props)}>{children}</button>,
            div: ({ children, ...props }) => <div {...stripProps(props)}>{children}</div>,
        },
    };
});

vi.mock('@/components/ui/CornerFrame', () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

vi.mock('@/components/ui/Input', () => ({
    default: ({ label, value, onChange, required, ...props }) => (
        <div>
            {label && <label>{label}</label>}
            <input 
                data-testid="input" 
                value={value || ''} 
                onChange={(e) => onChange?.(e)} 
                required={required}
                {...props} 
            />
        </div>
    ),
}));

vi.mock('@/components/ui/Textarea', () => ({
    default: ({ label, value, onChange, noLabel, ...props }) => (
        <div>
            {!noLabel && label && <label>{label}</label>}
            <textarea 
                data-testid="textarea" 
                value={value || ''} 
                onChange={(e) => onChange?.(e)}
                {...props} 
            />
        </div>
    ),
}));

vi.mock('@/components/ui/Select', () => ({
    default: ({ label, value, options, onChange, ...props }) => (
        <div>
            {label && <label>{label}</label>}
            <select 
                data-testid="select" 
                value={value || ''} 
                onChange={(e) => onChange?.(e)}
                {...props}
            >
                {(options || []).map((opt, i) => (
                    <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
                ))}
            </select>
        </div>
    ),
}));

vi.mock('@/components/admin/ImageUploader', () => ({
    default: ({ value, onChange }) => (
        <div data-testid="image-uploader">
            <input 
                data-testid="image-url-input"
                value={value || ''} 
                onChange={(e) => onChange?.(e.target.value)} 
            />
        </div>
    ),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
    useParams: () => ({}),
}));

vi.mock('react-icons/fi', () => ({
    FiSave: () => <span data-testid="save-icon" />,
    FiArrowLeft: () => <span data-testid="arrow-left-icon" />,
    FiEye: () => <span data-testid="eye-icon" />,
}));

describe('BlogPostForm Component', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders in create mode with empty fields', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        
        render(<BlogPostForm mode="create" />);
        
        expect(screen.getByText(/new blog post/i)).toBeInTheDocument();
    });

    it('slug is auto-generated from title if not manually set', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        
        render(<BlogPostForm mode="create" />);
        
        const titleInput = screen.getAllByTestId('input')[0];
        const slugInput = screen.getAllByTestId('input')[1];
        
        await userEvent.type(titleInput, 'My New Blog Post!');
        
        expect(slugInput.value).toBe('my-new-blog-post');
    });

    it('slug is not auto-generated if manually set', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        
        render(<BlogPostForm mode="create" />);
        
        const titleInput = screen.getAllByTestId('input')[0];
        const slugInput = screen.getAllByTestId('input')[1];
        
        await userEvent.type(slugInput, 'custom-slug');
        await userEvent.type(titleInput, 'My New Blog Post!');
        
        expect(slugInput.value).toBe('custom-slug');
    });

    it('renders in "edit" mode with pre-filled data', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                title: 'Existing Post',
                slug: 'existing-post',
                content: 'Content here'
            }),
        });
        
        render(<BlogPostForm mode="edit" editId="123" embedded={true} />);
        
        // Wait for loading to finish
        await waitFor(() => {
            const inputs = screen.getAllByTestId('input');
            expect(inputs[0]).toHaveValue('Existing Post');
        });
        
        expect(fetch).toHaveBeenCalledWith('/api/blog/123');
    });

    it('Title is required — shows error if empty on submit', async () => {
        const toast = (await import('react-hot-toast')).default;
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        
        render(<BlogPostForm mode="create" />);
        
        // Fill only author and category, but leave title empty
        const titleInput = screen.getAllByTestId('input')[0];
        await userEvent.clear(titleInput);
        
        // Use fireEvent to bypass HTML5 validation in jsdom
        fireEvent.submit(titleInput.closest('form'));
        
        expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('Published toggle changes the published boolean', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        
        render(<BlogPostForm mode="create" />);
        
        // Get the published toggle button (first button in the settings sidebar)
        // Since it doesn't have a role currently defined, we'll try to find it by clicking the parent/sibling
        const publishedLabel = screen.getByText(/published/i);
        const toggleButton = publishedLabel.nextElementSibling;
        
        expect(toggleButton).toHaveClass('bg-neutral-300'); // initially false
        
        await userEvent.click(toggleButton); // toggle true
        expect(toggleButton).toHaveClass('bg-neutral-900');
        
        await userEvent.click(toggleButton); // toggle false
        expect(toggleButton).toHaveClass('bg-neutral-300');
    });

    it('Submit in create mode calls POST /api/blog', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        const toast = (await import('react-hot-toast')).default;
        
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1 }),
        });
        
        render(<BlogPostForm mode="create" />);
        
        // Fill required fields
        const titleInput = screen.getAllByTestId('input')[0];
        const authorInput = screen.getAllByTestId('input')[2]; // Based on order
        await userEvent.type(titleInput, 'New Post');
        await userEvent.type(authorInput, 'John Doe');
        
        const submitButton = screen.getByRole('button', { name: /create post/i });
        await userEvent.click(submitButton);
        
        expect(fetch).toHaveBeenCalledWith('/api/blog', expect.objectContaining({
            method: 'POST',
        }));
        expect(toast.success).toHaveBeenCalledWith('Post created!');
    });

    it('Submit in edit mode calls PUT /api/blog/:id', async () => {
        const BlogPostForm = (await import('@/components/admin/BlogPostForm')).default;
        const toast = (await import('react-hot-toast')).default;
        const onSuccess = vi.fn();
        
        // Setup initial fetch for edit mode
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                title: 'Existing Post',
                author: 'Jane Doe',
                category: 'Engineering'
            }),
        });
        
        render(<BlogPostForm mode="edit" editId="456" embedded={true} onSuccess={onSuccess} />);
        
        // Wait for loading to finish
        await waitFor(() => {
            const inputs = screen.getAllByTestId('input');
            expect(inputs[0]).toHaveValue('Existing Post');
        });
        
        // Setup fetch for PUT
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 456 }),
        });
        
        const submitButton = screen.getByRole('button', { name: /update post/i });
        await userEvent.click(submitButton);
        
        expect(fetch).toHaveBeenCalledWith('/api/blog/456', expect.objectContaining({
            method: 'PUT',
        }));
        expect(toast.success).toHaveBeenCalledWith('Post updated!');
        expect(onSuccess).toHaveBeenCalled();
    });
});
