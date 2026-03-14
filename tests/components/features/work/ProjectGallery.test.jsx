import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import ProjectGallery from '@/components/features/work/ProjectGallery';

vi.mock('@/components/ui/CornerFrame', () => ({
  CornerFrame: ({ children, className }) => (
    <div data-testid="corner-frame" className={className}>{children}</div>
  ),
}));

vi.mock('next/image', () => ({
  default: (props) => <img {...props} data-testid="next-image" />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockImages = [
  '/images/project1.jpg',
  '/images/project2.jpg',
  '/images/project3.jpg',
];

describe('ProjectGallery', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders null when images array is empty', () => {
    const { container } = render(<ProjectGallery images={[]} title="Test Project" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when images is undefined', () => {
    const { container } = render(<ProjectGallery title="Test Project" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders gallery with images', () => {
    render(<ProjectGallery images={mockImages} title="Test Project" />);
    
    expect(screen.getByTestId('corner-frame')).toBeInTheDocument();
  });

  it('shows navigation arrows when more than one image', () => {
    render(<ProjectGallery images={mockImages} title="Test Project" />);
    
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });

  it('hides navigation arrows when only one image', () => {
    render(<ProjectGallery images={['/single.jpg']} title="Test Project" />);
    
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('calls nextImage when next button clicked', () => {
    render(<ProjectGallery images={mockImages} title="Test Project" />);
    
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
  });

  it('calls prevImage when prev button clicked', () => {
    render(<ProjectGallery images={mockImages} title="Test Project" />);
    
    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);
  });

  it('renders pagination dots', () => {
    render(<ProjectGallery images={mockImages} title="Test Project" />);
    
    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots.length).toBe(3);
  });

  it('navigates to correct slide when dot clicked', () => {
    render(<ProjectGallery images={mockImages} title="Test Project" />);
    
    const thirdDot = screen.getByLabelText('Go to slide 3');
    fireEvent.click(thirdDot);
  });
});
