import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

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
    isAdminEmail: () => false,
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
    useAuth: () => ({ user: null, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/lib/hooks/useNotifications", () => ({
    useNotifications: () => ({
        notifications: [],
        unreadCount: 0,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
    }),
}));

vi.mock("@/components/ui/NotificationDropdown", () => ({
    default: () => <div data-testid="notification-dropdown" />,
}));

describe('Header Accessibility', () => {
    it('should have no accessibility violations', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        const { container } = render(<Header />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have navigation landmark', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
    });

    it('should have skip link for keyboard users', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const skipLink = screen.getByRole('link', { name: /skip to main content/i });
        expect(skipLink).toBeInTheDocument();
    });

    it('should have skip link that targets main content', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const skipLink = screen.getByRole('link', { name: /skip to main content/i });
        expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have proper landmark structure', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const banner = screen.getByRole('banner');
        expect(banner).toBeInTheDocument();
    });

    it('should have all navigation links accessible', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const links = screen.getAllByRole('link');
        if (links.length > 0) {
            links[0].focus();
            expect(links[0]).toHaveFocus();
        }
    });

    it('should have logo with accessible name', async () => {
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const logo = screen.getByRole('link', { name: /berztech home/i });
        expect(logo).toBeInTheDocument();
    });

    it('should have menu button on mobile', async () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });
        
        const Header = (await import('@/components/layout/Header')).default;
        render(<Header />);
        
        const menuButton = screen.getByRole('button', { name: /open menu/i });
        expect(menuButton).toBeInTheDocument();
    });
});
