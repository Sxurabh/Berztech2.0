import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MessageBubble } from "@/components/chat/MessageBubble";

vi.mock("@/lib/hooks/useMessages", () => ({
    useMessages: () => ({
        messages: [],
        loading: false,
        sendMessage: vi.fn(),
        markAsRead: vi.fn(),
        isSending: false,
    }),
    useUploadMessageAttachment: () => ({
        upload: vi.fn(),
    }),
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
    }),
}));

describe("ChatPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders toggle button", async () => {
        render(<ChatPanel projectId="test" isOpen={false} onToggle={() => {}} />);
        await waitFor(() => {
            expect(screen.getByRole("button")).toBeTruthy();
        });
    });

    it("toggles visibility when button is clicked", async () => {
        const onToggle = vi.fn();
        const user = userEvent.setup();
        
        render(<ChatPanel projectId="test" isOpen={false} onToggle={onToggle} />);
        
        await waitFor(() => {
            return screen.getByRole("button");
        });
        await user.click(screen.getByRole("button"));
        expect(onToggle).toHaveBeenCalled();
    });

    it("shows project name when provided", async () => {
        render(<ChatPanel projectId="test" projectName="My Project" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText("My Project")).toBeTruthy();
        });
    });

    it("shows default project name when not provided", async () => {
        render(<ChatPanel projectId="test" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText("Project Chat")).toBeTruthy();
        });
    });
});

describe("MessageBubble", () => {
    const mockMessage = {
        id: "msg-1",
        content: "Hello there!",
        sender_id: "other-user",
        sender: { full_name: "John Doe" },
        created_at: "2024-01-01T10:00:00Z",
        reads: [],
    };

    it("shows avatar with sender's first letter for received messages", () => {
        render(
            <MessageBubble 
                message={mockMessage} 
                currentUserId="current-user" 
            />
        );
        expect(screen.getByText("J")).toBeTruthy();
    });

    it("does not show avatar for own messages", () => {
        const ownMessage = { ...mockMessage, sender_id: "current-user" };
        const { container } = render(
            <MessageBubble 
                message={ownMessage} 
                currentUserId="current-user" 
            />
        );
        const avatar = container.querySelector(".rounded-full");
        expect(avatar).toBeNull();
    });
});
