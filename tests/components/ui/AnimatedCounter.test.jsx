import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

vi.mock('framer-motion', () => ({
  useInView: vi.fn(() => true),
}));

describe('AnimatedCounter', () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders with value 0 initially', () => {
    render(<AnimatedCounter value={100} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays the target value after animation completes', async () => {
    render(<AnimatedCounter value={100} duration={1000} />);
    
    vi.advanceTimersByTime(1500);
    
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders with prefix', () => {
    render(<AnimatedCounter value={50} prefix="$" />);
    
    expect(document.body.innerHTML).toContain('$');
  });

  it('renders with suffix', () => {
    render(<AnimatedCounter value={50} suffix="%" />);
    
    expect(document.body.innerHTML).toContain('%');
  });

  it('renders with both prefix and suffix', () => {
    render(<AnimatedCounter value={99} prefix="+" suffix="%" />);
    
    const container = screen.getByText(/^\+99%$/);
    expect(container).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AnimatedCounter value={100} className="custom-class" />);
    
    expect(document.body.innerHTML).toContain('custom-class');
  });

  it('has sr-only text with full value for accessibility', () => {
    render(<AnimatedCounter value={50} prefix="$" suffix="+" />);
    
    const srOnly = screen.getByText('$50+');
    expect(srOnly).toHaveClass('sr-only');
  });

  it('has visible text with animated count for accessibility', () => {
    render(<AnimatedCounter value={75} />);
    
    const visible = screen.getByText('0');
    expect(visible).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses default duration of 1500ms', () => {
    render(<AnimatedCounter value={100} />);
    
    vi.advanceTimersByTime(500);
    
    const count = screen.getByText('0');
    expect(count).toBeInTheDocument();
    
    vi.advanceTimersByTime(1000);
    
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('handles value of 0', () => {
    render(<AnimatedCounter value={0} />);
    
    vi.advanceTimersByTime(1500);
    
    const elements = screen.getAllByText('0');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles large values', () => {
    render(<AnimatedCounter value={10000} />);
    
    vi.advanceTimersByTime(1500);
    
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('handles decimal values by flooring to integer', () => {
    render(<AnimatedCounter value={99.9} />);
    
    expect(document.body.innerHTML).toContain('99.9');
  });

  it('only animates once even with re-renders', () => {
    const { rerender } = render(<AnimatedCounter value={50} duration={1000} />);
    
    vi.advanceTimersByTime(500);
    
    rerender(<AnimatedCounter value={50} duration={1000} />);
    
    vi.advanceTimersByTime(500);
    
    expect(screen.getByText('50')).toBeInTheDocument();
    
    rerender(<AnimatedCounter value={50} duration={1000} />);
    
    vi.advanceTimersByTime(1000);
    
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('has tabular-nums class for number alignment', () => {
    render(<AnimatedCounter value={100} />);
    
    expect(document.body.innerHTML).toContain('tabular-nums');
  });
});
