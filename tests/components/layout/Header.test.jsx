/**
 * @fileoverview Component tests for Header
 *
 * Tests cover:
 * - Module exports
 * - Rendering (logo, nav items, auth states)
 * - Mobile menu interactions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseAuth = vi.fn(() => ({ user: null, loading: false, signOut: vi.fn() }));
const mockIsAdminEmail = vi.fn(() => false);

vi.mock("framer-motion", () => ({
    motion: {
        header: ({ children, ...props }) => <header {...props}>{children}</header>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => children,
}));

vi.mock("next/link", () => ({
    default: ({ children, href, ...props }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

vi.mock("next/image", () => ({
    default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("next/navigation", () => ({
    usePathname: () => "/",
}));

vi.mock("@/config/layout", () => ({
    layoutConfig: {
        maxWidth: "max-w-7xl",
        padding: {
            mobile: "px-4",
            tablet: "md:px-6",
            desktop: "lg:px-8",
        },
    },
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: mockIsAdminEmail,
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
    useAuth: mockUseAuth,
}));

vi.mock("@/lib/hooks/useNotifications", () => ({
    useNotifications: vi.fn(() => ({
        notifications: [],
        unreadCount: 0,
        loading: false,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        refetch: vi.fn(),
    })),
}));

vi.mock("@/components/ui/NotificationDropdown", () => ({
    default: () => <div data-testid="notification-dropdown" />,
}));

vi.mock("@/assets/Logo/blacklogo.png", () => ({
    __esModule: true,
    default: { src: "/logo.png" },
}));

describe("Header", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ user: null, loading: false, signOut: vi.fn() });
        mockIsAdminEmail.mockReturnValue(false);
    });

    describe("Module", () => {
        it("module can be imported", async () => {
            const mod = await import("@/components/layout/Header");
            expect(mod.default).toBeDefined();
        });

        it("exports default function component", async () => {
            const mod = await import("@/components/layout/Header");
            expect(typeof mod.default).toBe("function");
        });
    });

    describe("Rendering - Logged Out User", () => {
        it("renders logo link to home", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /berztech home/i })).toBeInTheDocument();
        });

        it("renders desktop navigation", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /work/i })).toBeInTheDocument();
        });

        it("renders sign in button", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
        });

        it("renders hire us button", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /contact us/i })).toBeInTheDocument();
        });

        it("renders mobile menu button", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
        });
    });

    describe("Rendering - Authenticated User", () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: { id: "user-1", email: "test@example.com", user_metadata: { full_name: "Test User" } },
                loading: false,
                signOut: vi.fn()
            });
        });

        it("renders user avatar button", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            const avatarButton = screen.getAllByRole("button")[0];
            expect(avatarButton).toBeInTheDocument();
        });

        it("hides hire us button when logged in", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.queryByRole("link", { name: /contact us/i })).not.toBeInTheDocument();
        });
    });

    describe("Rendering - Admin User", () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: { id: "admin-1", email: "admin@berztech.com", user_metadata: { full_name: "Admin" } },
                loading: false,
                signOut: vi.fn()
            });
            mockIsAdminEmail.mockReturnValue(true);
        });

        it("calls isAdminEmail with user email", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(mockIsAdminEmail).toHaveBeenCalledWith("admin@berztech.com");
        });
    });

    describe("Rendering - Loading State", () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({ user: null, loading: true, signOut: vi.fn() });
        });

        it("does not render sign in while loading", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
        });
    });

    describe("Mobile Menu", () => {
        it("opens mobile menu on button click", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            const menuButton = screen.getByRole("button", { name: /open menu/i });
            await userEvent.click(menuButton);

            expect(screen.getAllByRole("button", { name: /close menu/i })).toHaveLength(2);
        });
    });

    describe("Navigation Links", () => {
        it("work link has correct href", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /work/i })).toHaveAttribute("href", "/work");
        });

        it("about link has correct href", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute("href", "/about");
        });

        it("process link has correct href", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /process/i })).toHaveAttribute("href", "/process");
        });

        it("blog link has correct href", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /blog/i })).toHaveAttribute("href", "/blog");
        });

        it("sign in link has correct href", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/auth/login");
        });

        it("contact link has correct href", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /contact us/i })).toHaveAttribute("href", "/contact");
        });
    });

    describe("Accessibility", () => {
        it("renders skip link", async () => {
            const Header = (await import("@/components/layout/Header")).default;
            render(<Header />);

            expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute("href", "#main-content");
        });
    });
});
