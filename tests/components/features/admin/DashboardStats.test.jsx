import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardStats from '@/components/features/admin/DashboardStats';

vi.mock('@/components/ui/CornerFrame', () => ({
  CornerFrame: ({ children, className }) => (
    <div data-testid="corner-frame" className={className}>{children}</div>
  ),
}));

describe('DashboardStats', () => {
  it('renders stat cards with links', () => {
    const stats = { projects: 10, testimonials: 5, posts: 20 };
    render(<DashboardStats stats={stats} />);
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
    expect(links[0]).toHaveAttribute('href', '/admin/projects');
    expect(links[1]).toHaveAttribute('href', '/admin/testimonials');
    expect(links[2]).toHaveAttribute('href', '/admin/blog');
  });

  it('renders correct number of stat cards', () => {
    const stats = { projects: 10, testimonials: 5, posts: 20 };
    render(<DashboardStats stats={stats} />);
    
    const frames = screen.getAllByTestId('corner-frame');
    expect(frames.length).toBe(3);
  });

  it('handles null/undefined values', () => {
    const stats = { projects: null, testimonials: undefined, posts: 20 };
    render(<DashboardStats stats={stats} />);
    
    const frames = screen.getAllByTestId('corner-frame');
    expect(frames.length).toBe(3);
  });

  it('renders with zero values', () => {
    const stats = { projects: 0, testimonials: 0, posts: 0 };
    render(<DashboardStats stats={stats} />);
    
    const frames = screen.getAllByTestId('corner-frame');
    expect(frames.length).toBe(3);
  });
});
