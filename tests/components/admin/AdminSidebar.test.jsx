import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'admin@example.com' },
    signOut: vi.fn(() => Promise.resolve()),
  })),
}));

vi.mock('@/components/ui/CornerFrame', () => ({
  CornerFrame: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/NotificationDropdown', () => ({
  default: () => <div data-testid="notification-dropdown" />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('AdminSidebar', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    usePathname.mockReturnValue('/admin');
  });

  it('renders navigation links', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
  });

  it('renders logo with brand name', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText('Berztech')).toBeInTheDocument();
    const adminTexts = screen.getAllByText('Admin');
    expect(adminTexts.length).toBeGreaterThan(0);
  });

  it('renders user email in user section', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    usePathname.mockReturnValue('/admin/projects');
    render(<AdminSidebar />);
    
    const projectsLink = screen.getByText('Projects').closest('a');
    expect(projectsLink).toHaveClass('bg-neutral-900');
  });

  it('shows notification dropdown', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
  });

  it('renders user menu when clicked', () => {
    render(<AdminSidebar />);
    
    const userButton = screen.getByRole('button', { name: /admin@example\.com/i });
    fireEvent.click(userButton);
    
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.getByText('Back to Site')).toBeInTheDocument();
  });

  it('renders logo link to admin', () => {
    render(<AdminSidebar />);
    
    const logoLink = screen.getByText('Berztech').closest('a');
    expect(logoLink).toHaveAttribute('href', '/admin');
  });

  it('highlights Dashboard as active on root admin path', () => {
    usePathname.mockReturnValue('/admin');
    render(<AdminSidebar />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-neutral-900');
  });

  it('highlights Blog Posts as active on blog subpath', () => {
    usePathname.mockReturnValue('/admin/blog');
    render(<AdminSidebar />);
    
    const blogLink = screen.getByText('Blog Posts').closest('a');
    expect(blogLink).toHaveClass('bg-neutral-900');
  });

  it('highlights Testimonials as active on testimonials subpath', () => {
    usePathname.mockReturnValue('/admin/testimonials');
    render(<AdminSidebar />);
    
    const testimonialsLink = screen.getByText('Testimonials').closest('a');
    expect(testimonialsLink).toHaveClass('bg-neutral-900');
  });

  it('renders user initial in avatar', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
