import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TrackDetailsModal from '@/components/features/track/TrackDetailsModal';

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

const mockRequest = {
  id: 'req-123',
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Inc',
  services: ['Web Development', 'UI/UX Design'],
  budget: '$5,000 - $10,000',
  message: 'Looking for a new website.',
  created_at: '2024-01-15T10:00:00Z',
  status: 'pending',
};

describe('TrackDetailsModal', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders null when viewingRequest is null', () => {
    const { container } = render(
      <TrackDetailsModal viewingRequest={null} setViewingRequest={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders null when viewingRequest is undefined', () => {
    const { container } = render(
      <TrackDetailsModal viewingRequest={undefined} setViewingRequest={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when viewingRequest is provided', () => {
    render(
      <TrackDetailsModal viewingRequest={mockRequest} setViewingRequest={() => {}} />
    );
    
    expect(screen.getByText('Request Details')).toBeInTheDocument();
    expect(screen.getByText('Client Information')).toBeInTheDocument();
    expect(screen.getByText('Project Details')).toBeInTheDocument();
  });

  it('displays client information correctly', () => {
    render(
      <TrackDetailsModal viewingRequest={mockRequest} setViewingRequest={() => {}} />
    );
    
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays project details correctly', () => {
    render(
      <TrackDetailsModal viewingRequest={mockRequest} setViewingRequest={() => {}} />
    );
    
    expect(screen.getByText('$5,000 - $10,000')).toBeInTheDocument();
    expect(screen.getByText('Looking for a new website.')).toBeInTheDocument();
  });

  it('calls setViewingRequest(null) when close button clicked', () => {
    const mockSetViewingRequest = vi.fn();
    render(
      <TrackDetailsModal viewingRequest={mockRequest} setViewingRequest={mockSetViewingRequest} />
    );
    
    const closeButtons = screen.getAllByText('Close');
    closeButtons[0].click();
    
    expect(mockSetViewingRequest).toHaveBeenCalledWith(null);
  });

  it('renders services as badges', () => {
    render(
      <TrackDetailsModal viewingRequest={mockRequest} setViewingRequest={() => {}} />
    );
    
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalRequest = {
      id: 'req-456',
      name: 'Jane Doe',
      email: 'jane@example.com',
      created_at: '2024-01-15T10:00:00Z',
    };
    
    render(
      <TrackDetailsModal viewingRequest={minimalRequest} setViewingRequest={() => {}} />
    );
    
    expect(screen.getByText('Request Details')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument(); // company
    expect(screen.getByText('Not specified')).toBeInTheDocument(); // budget
    expect(screen.getByText('No additional message provided.')).toBeInTheDocument(); // message
  });
});
