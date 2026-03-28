import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "@/components/chat/ChatPanel";

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

Object.defineProperty(HTMLDivElement.prototype, "scrollIntoView", {
    writable: true,
    value: vi.fn(),
});

vi.mock("@/lib/hooks/useUploadMessageAttachment", () => ({
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
    it("renders toggle button", () => {
        render(<ChatPanel projectId="test" isOpen={false} onToggle={() => {}} />);
        expect(screen.getByRole("button")).toBeTruthy();
    });

    it("toggles visibility when button is clicked", async () => {
        const onToggle = vi.fn();
        const user = userEvent.setup();
        
        render(<ChatPanel projectId="test" isOpen={false} onToggle={onToggle} />);
        
        await user.click(screen.getByRole("button"));
        expect(onToggle).toHaveBeenCalled();
    });

    it("shows project name when provided", () => {
        render(<ChatPanel projectId="test" projectName="My Project" isOpen={true} onToggle={() => {}} />);
        expect(screen.getByText("My Project Messages")).toBeTruthy();
    });

    it("shows default project name when not provided", () => {
        render(<ChatPanel projectId="test" isOpen={true} onToggle={() => {}} />);
        expect(screen.getByText("Project Messages")).toBeTruthy();
    });
});
