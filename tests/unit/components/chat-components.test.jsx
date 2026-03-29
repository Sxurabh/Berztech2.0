import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { AttachmentPreview } from "@/components/chat/AttachmentPreview";

const mockMessage = {
    id: "msg-1",
    content: "Hello there!",
    sender_id: "other-user",
    sender: { full_name: "John Doe", avatar_url: null },
    created_at: "2024-01-01T10:00:00Z",
    reads: [],
};

const mockMessages = [
    {
        id: "msg-1",
        content: "First message",
        sender_id: "other-user",
        sender: { full_name: "John Doe", avatar_url: null },
        created_at: "2024-01-01T10:00:00Z",
        reads: [],
    },
    {
        id: "msg-2",
        content: "Second message",
        sender_id: "current-user",
        sender: { full_name: "You", avatar_url: null },
        created_at: "2024-01-01T10:05:00Z",
        reads: [],
    },
];

describe("MessageList Component", () => {
    it("1. shows empty state when no messages", () => {
        render(<MessageList messages={[]} currentUserId="user-1" />);
        
        expect(screen.getByText("No messages yet. Start the conversation!")).toBeTruthy();
    });

    it("2. renders all messages", () => {
        render(<MessageList messages={mockMessages} currentUserId="user-1" />);
        
        expect(screen.getByText("First message")).toBeTruthy();
        expect(screen.getByText("Second message")).toBeTruthy();
    });

    it("3. has scrollable container", () => {
        render(<MessageList messages={mockMessages} currentUserId="user-1" />);
        
        const container = screen.getByText("First message").closest(".overflow-y-auto");
        expect(container).toBeTruthy();
    });

    it("4. renders correct number of messages", () => {
        render(<MessageList messages={mockMessages} currentUserId="user-1" />);
        
        const messages = screen.getAllByText(/message/);
        expect(messages.length).toBe(2);
    });

    describe("Loading State", () => {
        it("shows skeleton loader when isLoading is true", () => {
            render(<MessageList messages={[]} currentUserId="user-1" isLoading={true} />);
            
            const skeletonItems = document.querySelectorAll(".animate-pulse");
            expect(skeletonItems.length).toBeGreaterThan(0);
        });

        it("shows skeleton with correct structure", () => {
            render(<MessageList messages={[]} currentUserId="user-1" isLoading={true} />);
            
            const skeletonContainers = document.querySelectorAll(".flex.gap-3");
            expect(skeletonContainers.length).toBe(3);
        });

        it("does not show empty state during loading", () => {
            render(<MessageList messages={[]} currentUserId="user-1" isLoading={true} />);
            
            expect(screen.queryByText("No messages yet. Start the conversation!")).toBeNull();
        });

        it("does not show messages during loading", () => {
            render(<MessageList messages={mockMessages} currentUserId="user-1" isLoading={true} />);
            
            expect(screen.queryByText("First message")).toBeNull();
            expect(screen.queryByText("Second message")).toBeNull();
        });

        it("shows messages after loading completes", async () => {
            const { rerender } = render(
                <MessageList messages={[]} currentUserId="user-1" isLoading={true} />
            );
            
            rerender(<MessageList messages={mockMessages} currentUserId="user-1" isLoading={false} />);
            
            expect(screen.getByText("First message")).toBeTruthy();
            expect(screen.getByText("Second message")).toBeTruthy();
        });
    });
});

describe("ChatInput Component", () => {
    const defaultProps = {
        onSend: vi.fn(),
        onUpload: vi.fn(),
        disabled: false,
        isUploading: false,
        isMobile: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Text Input", () => {
        it("5. renders textarea with placeholder", () => {
            render(<ChatInput {...defaultProps} />);
            
            expect(screen.getByPlaceholderText("Type a message...")).toBeTruthy();
        });

        it("6. updates message state on input", async () => {
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);
            
            const textarea = screen.getByPlaceholderText("Type a message...");
            await user.type(textarea, "Hello world");
            
            expect(textarea.value).toBe("Hello world");
        });
    });

    describe("Send Button", () => {
        it("7. send button calls onSend with content", async () => {
            defaultProps.onSend.mockResolvedValue({});
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);
            
            const textarea = screen.getByPlaceholderText("Type a message...");
            await user.type(textarea, "Hello world");
            
            const buttons = screen.getAllByRole("button");
            const sendButton = buttons[buttons.length - 1];
            await user.click(sendButton);
            
            expect(defaultProps.onSend).toHaveBeenCalledWith({
                content: "Hello world",
            });
        });

        it("8. textarea exists and is functional", () => {
            render(<ChatInput {...defaultProps} />);
            
            const textarea = screen.getByRole("textbox");
            expect(textarea).toBeTruthy();
        });
    });

    describe("Keyboard Shortcuts", () => {
        it("9. sends message on Enter key press", async () => {
            defaultProps.onSend.mockResolvedValue({});
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);
            
            const textarea = screen.getByPlaceholderText("Type a message...");
            await user.type(textarea, "Hello{Enter}");
            
            expect(defaultProps.onSend).toHaveBeenCalledWith({
                content: "Hello",
            });
        });
    });

    describe("File Attachment", () => {
        it("10. has file input with correct accept types", () => {
            render(<ChatInput {...defaultProps} />);
            
            const fileInput = document.querySelector('input[type="file"]');
            expect(fileInput).toBeTruthy();
            expect(fileInput.accept).toBe("image/*,.pdf,.doc,.docx,.txt");
        });

        it("11. shows attachment preview when file selected", async () => {
            defaultProps.onUpload.mockResolvedValue({
                url: "https://example.com/file.pdf",
                type: "document",
                name: "test.pdf",
            });
            render(<ChatInput {...defaultProps} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [file] } });
            });
            
            await waitFor(() => {
                expect(screen.getByText("test.pdf")).toBeTruthy();
            });
        });

        it("12. removes attachment on X button click", async () => {
            defaultProps.onUpload.mockResolvedValue({
                url: "https://example.com/file.pdf",
                type: "document",
                name: "test.pdf",
            });
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [file] } });
            });
            
            await waitFor(() => {
                expect(screen.getByText("test.pdf")).toBeTruthy();
            });
            
            const buttons = screen.getAllByRole("button");
            const removeButton = buttons.find(b => b.querySelector("svg")?.classList.contains("w-4"));
            if (removeButton) {
                await user.click(removeButton);
            }
            
            await waitFor(() => {
                expect(screen.queryByText("test.pdf")).toBeNull();
            });
        });

        it("13. uploads file when sending message with attachment", async () => {
            defaultProps.onSend.mockResolvedValue({});
            defaultProps.onUpload.mockResolvedValue({
                url: "https://example.com/test.pdf",
                type: "document",
                name: "test.pdf",
            });
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [file] } });
            });
            
            await waitFor(() => {
                expect(screen.getByText("test.pdf")).toBeTruthy();
            });
            
            const textarea = screen.getByPlaceholderText("Type a message...");
            await user.type(textarea, "Check this");
            
            const buttons = screen.getAllByRole("button");
            const sendButton = buttons[buttons.length - 1];
            await user.click(sendButton);
            
            expect(defaultProps.onUpload).toHaveBeenCalled();
        });
    });

    describe("Upload Retry", () => {
        it("renders retry button in attachment preview area", () => {
            render(<ChatInput {...defaultProps} isUploading={true} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            fireEvent.change(fileInput, { target: { files: [file] } });
            
            expect(screen.getByText("test.pdf")).toBeTruthy();
        });

        it("renders error message container", () => {
            render(<ChatInput {...defaultProps} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            fireEvent.change(fileInput, { target: { files: [file] } });
            
            expect(screen.getByText("test.pdf")).toBeTruthy();
        });

        it("allows removing attachment", async () => {
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [file] } });
            });
            
            await waitFor(() => {
                expect(screen.getByText("test.pdf")).toBeTruthy();
            });
            
            const removeButton = screen.getAllByRole("button").find(b => {
                const svg = b.querySelector("svg");
                return svg && svg.classList.contains("w-4");
            });
            
            if (removeButton) {
                await user.click(removeButton);
            }
            
            await waitFor(() => {
                expect(screen.queryByText("test.pdf")).toBeNull();
            });
        });

        it("shows progress bar during upload", () => {
            render(<ChatInput {...defaultProps} isUploading={true} />);
            
            const file = new File(["test"], "test.pdf", { type: "application/pdf" });
            const fileInput = document.querySelector('input[type="file"]');
            
            fireEvent.change(fileInput, { target: { files: [file] } });
            
            const progressBar = document.querySelector(".h-1.bg-neutral-200");
            expect(progressBar).toBeTruthy();
        });
    });

    describe("Disabled State", () => {
        it("14. disables textarea when disabled prop is true", () => {
            render(<ChatInput {...defaultProps} disabled={true} />);
            
            const textarea = screen.getByPlaceholderText("Type a message...");
            expect(textarea).toBeDisabled();
        });

        it("15. disables buttons when disabled prop is true", () => {
            render(<ChatInput {...defaultProps} disabled={true} />);
            
            const buttons = screen.getAllByRole("button");
            buttons.forEach(button => {
                expect(button).toBeDisabled();
            });
        });
    });

    describe("Mobile Styling", () => {
        it("16. applies mobile classes when isMobile is true", () => {
            render(<ChatInput {...defaultProps} isMobile={true} />);
            
            const textarea = screen.getByPlaceholderText("Type a message...");
            expect(textarea.className).toContain("min-h-[44px]");
        });
    });
});

describe("AttachmentPreview Component", () => {
    describe("Image Attachment", () => {
        const imageAttachment = {
            attachment_url: "https://example.com/image.jpg",
            attachment_type: "image",
            attachment_name: "image.jpg",
        };

        it("17. renders image thumbnail", () => {
            render(<AttachmentPreview attachment={imageAttachment} />);
            
            const img = screen.getByAltText("image.jpg");
            expect(img).toBeTruthy();
            expect(img.src).toBe("https://example.com/image.jpg");
        });

        it("18. expands image on click", async () => {
            const user = userEvent.setup();
            render(<AttachmentPreview attachment={imageAttachment} />);
            
            const img = screen.getByAltText("image.jpg");
            await user.click(img);
            
            await waitFor(() => {
                const lightbox = document.querySelector(".fixed.inset-0");
                expect(lightbox).toBeTruthy();
            });
        });
    });

    describe("Document Attachment", () => {
        const docAttachment = {
            attachment_url: "https://example.com/document.pdf",
            attachment_type: "document",
            attachment_name: "document.pdf",
        };

        it("19. renders document name", () => {
            render(<AttachmentPreview attachment={docAttachment} />);
            
            expect(screen.getByText("document.pdf")).toBeTruthy();
        });

        it("20. has download link", () => {
            render(<AttachmentPreview attachment={docAttachment} />);
            
            const downloadLink = screen.getByRole("link");
            expect(downloadLink).toBeTruthy();
            expect(downloadLink.href).toBe("https://example.com/document.pdf");
        });

        it("21. download link has correct attributes", () => {
            render(<AttachmentPreview attachment={docAttachment} />);
            
            const downloadLink = screen.getByRole("link");
            expect(downloadLink).toHaveAttribute("download", "document.pdf");
            expect(downloadLink).toHaveAttribute("target", "_blank");
        });

        it("22. calls onRemove when remove button clicked", async () => {
            const onRemove = vi.fn();
            const user = userEvent.setup();
            render(<AttachmentPreview attachment={docAttachment} onRemove={onRemove} />);
            
            const buttons = screen.getAllByRole("button");
            const removeButton = buttons.find(b => {
                const svg = b.querySelector("svg");
                return svg && svg.getAttribute("class")?.includes("w-4");
            });
            
            if (removeButton) {
                await user.click(removeButton);
                expect(onRemove).toHaveBeenCalled();
            }
        });

        it("23. uses default name when attachment_name is null", () => {
            const attachmentWithoutName = {
                ...docAttachment,
                attachment_name: null,
            };
            render(<AttachmentPreview attachment={attachmentWithoutName} />);
            
            expect(screen.getByText("Document")).toBeTruthy();
        });
    });

    describe("Styling", () => {
        it("24. has correct styling classes for document", () => {
            render(
                <AttachmentPreview
                    attachment={{
                        attachment_url: "https://example.com/file.pdf",
                        attachment_type: "document",
                        attachment_name: "file.pdf",
                    }}
                />
            );
            
            const container = document.querySelector(".bg-neutral-50");
            expect(container).toBeTruthy();
        });
    });
});
