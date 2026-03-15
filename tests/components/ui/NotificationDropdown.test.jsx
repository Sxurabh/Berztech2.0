import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { useNotifications } from '@/lib/hooks/useNotifications';

vi.mock('@/lib/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: vi.fn(() => true),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('NotificationDropdown', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'New comment on Task A',
      message: 'John commented on your task',
      is_read: false,
      created_at: new Date().toISOString(),
      task_id: 'task-1',
      request_id: 'req-1',
    },
    {
      id: 'notif-2',
      title: 'Task updated',
      message: 'Status changed to in progress',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      task_id: 'task-2',
      request_id: 'req-2',
    },
  ];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders bell button', () => {
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows unread count badge when there are unread notifications', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows 99+ when unread count exceeds 99', () => {
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 150,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('opens dropdown when bell is clicked', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: true,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('renders notification list when notifications exist', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    expect(screen.getByText('New comment on Task A')).toBeInTheDocument();
  });

  it('shows mark all read button when there are unread', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('calls markAllAsRead when mark all read is clicked', () => {
    const mockMarkAllAsRead = vi.fn();
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    const markAllReadButton = screen.getByText('Mark all read');
    fireEvent.click(markAllReadButton);
    
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('calls markAsRead when notification is clicked', () => {
    const mockMarkAsRead = vi.fn();
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    const notificationItem = screen.getByText('New comment on Task A');
    fireEvent.click(notificationItem);
  });

  it('renders admin link when isAdmin is true', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown isAdmin={true} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    const notifLink = screen.getByText('New comment on Task A').closest('a');
    expect(notifLink.getAttribute('href')).toContain('/admin/board');
  });

  it('renders client link when isAdmin is false', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown isAdmin={false} />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    const notifLink = screen.getByText('New comment on Task A').closest('a');
    expect(notifLink.getAttribute('href')).toContain('/track/board');
  });

  it('closes dropdown when clicking outside', () => {
    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationDropdown />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });
});
