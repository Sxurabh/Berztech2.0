import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkList from '@/components/features/work/WorkList';

vi.mock('@/components/ui/CornerFrame');

vi.mock('@/data/projects', () => ({
  colorSchemes: {
    neutral: {
      border: 'border-neutral-200',
      bg: 'bg-neutral-900',
      bgLight: 'bg-neutral-50',
      text: 'text-neutral-900',
    },
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-900',
      bgLight: 'bg-blue-50',
      text: 'text-blue-900',
    },
  },
}));

vi.mock('@/lib/design-tokens', () => ({
  typography: {
    fontSize: {
      tiny: 'text-xs',
      xs: 'text-sm',
      sm: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    fontFamily: {
      mono: 'font-jetbrains-mono',
      sans: 'font-space-grotesk',
    },
    tracking: {
      tighter: 'tracking-tighter',
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
      wider: 'tracking-wider',
      widest: 'tracking-widest',
    },
    fontWeight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
  },
  spacing: {},
}));

const mockProjects = [
  {
    id: '1',
    title: 'Test Project 1',
    category: 'Web Development',
    client: 'Acme Corp',
    year: '2024',
    description: 'A web development project',
    image: '/image1.jpg',
    featured: true,
    color: 'neutral',
    services: ['React', 'Node.js'],
    stats: { clients: '5', revenue: '$100k', years: '2' },
  },
  {
    id: '2',
    title: 'Test Project 2',
    category: 'Mobile App',
    client: 'Beta Inc',
    year: '2023',
    description: 'A mobile app project',
    image: '/image2.jpg',
    featured: false,
    color: 'blue',
    services: ['React Native'],
  },
];

describe('WorkList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats bar with project count', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development', 'Mobile App']} />);
    expect(screen.getByText('Projects Delivered')).toBeInTheDocument();
  });

  it('renders stats bar with industry count', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development', 'Mobile App']} />);
    expect(screen.getByText('Industries Served')).toBeInTheDocument();
  });

  it('renders featured project when present', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development', 'Mobile App']} />);
    expect(screen.getByText('Featured Work')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development', 'Mobile App']} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders project cards', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development', 'Mobile App']} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('renders CTA section', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development']} />);
    expect(screen.getByText('Have a project in mind?')).toBeInTheDocument();
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument();
  });

  it('handles empty projects array', () => {
    render(<WorkList initialProjects={[]} filters={['All']} />);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getByText('No projects found in this category.')).toBeInTheDocument();
  });

  it('renders client retention stat', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All']} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders average rating stat', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All']} />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('filters projects when filter button clicked', async () => {
    render(<WorkList initialProjects={mockProjects} filters={['All', 'Web Development', 'Mobile App']} />);
    
    const buttons = screen.getAllByRole('button');
    const mobileButton = buttons.find(b => b.textContent === 'Mobile App');
    await userEvent.click(mobileButton);
  });

  it('renders featured work section header', () => {
    render(<WorkList initialProjects={mockProjects} filters={['All']} />);
    expect(screen.getByText('Featured Work')).toBeInTheDocument();
  });
});
