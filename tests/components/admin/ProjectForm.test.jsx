/**
 * @fileoverview Component tests for ProjectForm
 *
 * Tests cover:
 * - Component rendering in create and edit modes
 * - Form field interactions and state updates
 * - Form submission handling
 * - Service and stat management
 * - Conditional rendering based on mode and embedded prop
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockRouterPush = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockRouterPush,
        back: vi.fn(),
    }),
    useParams: () => ({ id: "test-project-id" }),
}));

vi.mock("react-hot-toast", () => {
    return {
        __esModule: true,
        default: {
            error: mockToastError,
            success: mockToastSuccess,
        },
        toast: {
            error: mockToastError,
            success: mockToastSuccess,
        },
    };
});

vi.mock("@/components/ui/CornerFrame", () => ({
    CornerFrame: ({ children, className, ...props }) => (
        <div data-testid="corner-frame" className={className}>{children}</div>
    ),
}));

vi.mock("@/components/ui/Input", () => ({
    default: ({ label, ...props }) => (
        <div data-testid="input-wrapper">
            {label && <label htmlFor={`input-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''}`}>{label}</label>}
            <input data-testid="input" id={`input-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''}`} {...props} />
        </div>
    ),
}));

vi.mock("@/components/ui/Textarea", () => ({
    default: ({ label, ...props }) => (
        <div data-testid="textarea-wrapper">
            {label && <label htmlFor={`textarea-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''}`}>{label}</label>}
            <textarea data-testid="textarea" id={`textarea-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''}`} {...props} />
        </div>
    ),
}));

vi.mock("@/components/ui/Select", () => ({
    default: ({ label, options, ...props }) => (
        <div data-testid="select-wrapper">
            {label && <label htmlFor={`select-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''}`}>{label}</label>}
            <select data-testid="select" id={`select-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''}`} {...props}>
                {options.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

vi.mock("@/components/admin/ImageUploader", () => ({
    default: ({ value, onChange }) => (
        <div data-testid="image-uploader">
            <input data-testid="image-input" type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
}));

vi.mock("framer-motion", () => ({
    motion: {
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
}));

vi.mock("@/lib/data/projects", () => ({
    getProjectById: vi.fn().mockResolvedValue({
        id: "test-project-id",
        client_name: "Test Client",
        title: "Test Project",
        slug: "test-project",
        description: "Test description",
        image_url: "https://example.com/image.jpg",
        demo_url: "https://example.com/demo",
        repo_url: "https://github.com/test/repo",
        featured: true,
        status: "completed",
        order_index: 1,
    }),
    getProjects: vi.fn().mockResolvedValue([]),
}));

global.fetch = vi.fn();

describe("ProjectForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("renders in create mode by default", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            // Should show header with "New Project" title
            expect(screen.getByRole('heading', { name: /new project/i })).toBeInTheDocument();
            
            // Should show back button
            expect(screen.getByRole('button', { name: /back to projects/i })).toBeInTheDocument();
            
            // Should show form title
            expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
        });

        it("renders in edit mode when mode='edit'", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            
            // Mock the API fetch for project data
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    id: "test-project-id",
                    client_name: "Test Client",
                    title: "Test Project",
                    slug: "test-project",
                    description: "Test description",
                    image_url: "https://example.com/image.jpg",
                    demo_url: "https://example.com/demo",
                    repo_url: "https://github.com/test/repo",
                    featured: true,
                    status: "completed",
                    order_index: 1,
                    services: [],
                    stats: {},
                    color: "blue",
                    gallery: [],
                }),
            });
            
            render(<ProjectForm mode="edit" editId="test-project-id" />);
            
            // Wait for loading state to resolve (fetchProject mock)
            await waitFor(() => {
                expect(screen.queryByRole('heading', { name: /edit project/i })).toBeInTheDocument();
            });
            
            // Should show header with "Edit Project" title
            expect(screen.getByRole('heading', { name: /edit project/i })).toBeInTheDocument();
        });

        it("hides header when embedded=true", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm embedded={true} />);
            
            // Should not show back button or heading
            expect(screen.queryByRole('button', { name: /back to projects/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('heading', { name: /new project/i })).not.toBeInTheDocument();
        });
    });

    describe("Form Interactions", () => {
        it("updates client name when input changes", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const clientInput = screen.getByLabelText(/client name/i);
            await userEvent.type(clientInput, "Test Client");
            
            expect(clientInput).toHaveValue("Test Client");
        });

        it("updates project title when input changes", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const titleInput = screen.getByLabelText(/project title/i);
            await userEvent.type(titleInput, "Test Project");
            
            expect(titleInput).toHaveValue("Test Project");
        });

        it("updates description when textarea changes", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const descriptionTextarea = screen.getByLabelText(/description/i);
            await userEvent.type(descriptionTextarea, "This is a test description");
            
            expect(descriptionTextarea).toHaveValue("This is a test description");
        });

        it("updates category when select changes", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const categorySelect = screen.getByLabelText(/category/i);
            await userEvent.selectOptions(categorySelect, "Blockchain");
            
            expect(categorySelect).toHaveValue("Blockchain");
        });

        it("updates year when input changes", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const yearInput = screen.getByLabelText(/year/i);
            // Clear the initial value first
            await userEvent.clear(yearInput);
            await userEvent.type(yearInput, "2025");
            
            expect(yearInput).toHaveValue("2025");
        });
    });

    describe("Service Management", () => {
        it("adds a service when input is filled and button clicked", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const serviceInput = screen.getByPlaceholderText(/add service/i);
            const addButton = screen.getByRole('button', { name: /add service/i });
            
            await userEvent.type(serviceInput, "Web Development");
            await userEvent.click(addButton);
            
            // Input should be cleared
            expect(serviceInput).toHaveValue("");
            
            // Service should appear in the services list
            expect(screen.getByText(/web development/i)).toBeInTheDocument();
        });

        it("adds a service when input is filled and Enter key pressed", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const serviceInput = screen.getByPlaceholderText(/add service/i);
            
            await userEvent.type(serviceInput, "Mobile Development");
            await userEvent.keyboard("{enter}");
            
            // Input should be cleared
            expect(serviceInput).toHaveValue("");
            
            // Service should appear in the services list
            expect(screen.getByText(/mobile development/i)).toBeInTheDocument();
        });

        it("removes a service when remove button clicked", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            // Add a service first
            const serviceInput = screen.getByPlaceholderText(/add service/i);
            const addButton = screen.getByRole('button', { name: /add service/i });
            await userEvent.type(serviceInput, "UI/UX Design");
            await userEvent.click(addButton);
            
            // Verify service was added
            expect(screen.getByText(/ui\/ux design/i)).toBeInTheDocument();
            
            // Remove the service - find the button with the X icon (FiX)
            const serviceElement = screen.getByText(/ui\/ux design/i);
            const removeButton = serviceElement.closest('span').querySelector('button');
            await userEvent.click(removeButton);
            
            // Service should be removed
            expect(screen.queryByText(/ui\/ux design/i)).not.toBeInTheDocument();
        });
    });

    describe("Stat Management", () => {
        it("adds a stat when both key and value are filled", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const keyInput = screen.getByPlaceholderText(/key/i);
            const valueInput = screen.getByPlaceholderText(/value/i);
            const addButton = screen.getByRole('button', { name: /add stat/i });
            
            await userEvent.type(keyInput, "Users");
            await userEvent.type(valueInput, "1000+");
            await userEvent.click(addButton);
            
            // Inputs should be cleared
            expect(keyInput).toHaveValue("");
            expect(valueInput).toHaveValue("");
            
            // Stat should appear in the stats list
            expect(screen.getByText(/users/i)).toBeInTheDocument();
            expect(screen.getByText(/1000\+/i)).toBeInTheDocument();
        });

        it("adds a stat when Enter key pressed in value field", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const keyInput = screen.getByPlaceholderText(/key/i);
            const valueInput = screen.getByPlaceholderText(/value/i);
            
            await userEvent.type(keyInput, "Revenue");
            await userEvent.type(valueInput, "$50K");
            await userEvent.keyboard("{enter}");
            
            // Inputs should be cleared
            expect(keyInput).toHaveValue("");
            expect(valueInput).toHaveValue("");
            
            // Stat should appear in the stats list
            expect(screen.getByText(/revenue/i)).toBeInTheDocument();
            expect(screen.getByText(/\$50k/i)).toBeInTheDocument();
        });

        it("removes a stat when remove button clicked", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            // Add a stat first
            const keyInput = screen.getByPlaceholderText(/key/i);
            const valueInput = screen.getByPlaceholderText(/value/i);
            const addButton = screen.getByRole('button', { name: /add stat/i });
            await userEvent.type(keyInput, "Launch Date");
            await userEvent.type(valueInput, "Q1 2024");
            await userEvent.click(addButton);
            
            // Verify stat was added
            expect(screen.getByText(/launch date/i)).toBeInTheDocument();
            expect(screen.getByText(/q1 2024/i)).toBeInTheDocument();
            
            // Remove the stat - find the button with the X icon (FiX)
            const statElement = screen.getByText(/launch date/i);
            const removeButton = statElement.closest('div').querySelector('button');
            await userEvent.click(removeButton);
            
            // Stat should be removed
            expect(screen.queryByText(/launch date/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/q1 2024/i)).not.toBeInTheDocument();
        });
    });

    describe("Form Submission", () => {
        it("shows error when required fields are missing", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            const form = document.querySelector('form');
            fireEvent.submit(form);
            
            // Should show error toast
            expect(mockToastError).toHaveBeenCalled();
        });

        it("calls onSuccess callback when embedded and submission successful", async () => {
            const onSuccess = vi.fn();
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm embedded={true} onSuccess={onSuccess} />);
            
            // Fill required fields
            await userEvent.type(screen.getByLabelText(/client name/i), "Test Client");
            await userEvent.type(screen.getByLabelText(/project title/i), "Test Project");
            await userEvent.selectOptions(screen.getByLabelText(/category/i), "Fintech");
            
            // Mock successful fetch response
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true })
            });
            
            const submitButton = screen.getByRole('button', { name: /create project/i });
            await userEvent.click(submitButton);
            
            // Should call onSuccess callback
            expect(onSuccess).toHaveBeenCalled();
        });

        it("redirects to projects page when not embedded and submission successful", async () => {
            const ProjectForm = (await import("@/components/admin/ProjectForm")).default;
            render(<ProjectForm />);
            
            // Fill required fields
            await userEvent.type(screen.getByLabelText(/client name/i), "Test Client");
            await userEvent.type(screen.getByLabelText(/project title/i), "Test Project");
            await userEvent.selectOptions(screen.getByLabelText(/category/i), "Fintech");
            
            // Mock successful fetch response
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true })
            });
            
            const submitButton = screen.getByRole('button', { name: /create project/i });
            await userEvent.click(submitButton);
            
            // Should redirect to projects page
            expect(mockRouterPush).toHaveBeenCalledWith("/admin/projects");
        });
    });
});
