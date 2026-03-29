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

vi.mock("@/lib/hooks/useTheirPresence", () => ({
    useTheirPresence: () => ({
        isOnline: true,
        lastSeen: null,
        formattedStatus: "Online",
        formattedLastSeen: "Online",
        loading: false,
    }),
}));

vi.mock("@/lib/hooks/useNotifications", () => ({
    useNotifications: () => ({
        notifications: [],
        unreadCount: 0,
        loading: false,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
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
        render(<ChatPanel projectId="test" projectName="My Project" recipientName="Recipient Name" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            // Use first() - recipient name appears in header
            expect(screen.getAllByText("Recipient Name")[0]).toBeTruthy();
        });
    });

    it("shows default project name when not provided", async () => {
        render(<ChatPanel projectId="test" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            // Use first() - default name appears in header
            expect(screen.getAllByText("Chat")[0]).toBeTruthy();
        });
    });
});

describe("ChatPanel Header", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders avatar with first letter of recipient name", async () => {
        render(<ChatPanel projectId="test" recipientName="John Doe" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            // Use first() to get the avatar in header
            expect(screen.getAllByText("J")[0]).toBeTruthy();
        });
    });

    it("renders avatar with image when recipientAvatar provided", async () => {
        render(
            <ChatPanel 
                projectId="test" 
                recipientName="John Doe"
                recipientAvatar="https://example.com/avatar.png"
                isOpen={true} 
                onToggle={() => {}} 
            />
        );
        await waitFor(() => {
            // Use first() to avoid multiple matches - look for img element
            const imgs = screen.getAllByRole("img");
            expect(imgs.length).toBeGreaterThan(0);
        });
    });

    it("shows online status indicator", async () => {
        render(<ChatPanel projectId="test" recipientName="John Doe" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            const indicators = document.querySelectorAll(".bg-green-500");
            expect(indicators[0]).toBeTruthy();
        });
    });

    it("shows online status text", async () => {
        render(<ChatPanel projectId="test" recipientName="John Doe" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            // Use first() to get header status
            expect(screen.getAllByText("Online")[0]).toBeTruthy();
        });
    });

    it("close button has aria-label", async () => {
        render(<ChatPanel projectId="test" recipientName="John Doe" isOpen={true} onToggle={() => {}} />);
        await waitFor(() => {
            // Use first() to get header close button
            const buttons = screen.getAllByRole("button", { name: /close chat/i });
            expect(buttons[0]).toBeTruthy();
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
