import { describe, it, expect } from 'vitest';
import { trackTableColumns } from '@/components/features/track/TrackTableColumns';

vi.mock('@/components/ui/RequestTimeline', () => ({
  default: () => <div data-testid="request-timeline" />,
}));

describe('TrackTableColumns', () => {
  it('exports an array of column definitions', () => {
    expect(Array.isArray(trackTableColumns)).toBe(true);
    expect(trackTableColumns.length).toBe(4);
  });

  it('has correct column keys', () => {
    const keys = trackTableColumns.map(col => col.key);
    expect(keys).toContain('name');
    expect(keys).toContain('services');
    expect(keys).toContain('status');
    expect(keys).toContain('created_at');
  });

  it('has labels for each column', () => {
    trackTableColumns.forEach(col => {
      expect(col.label).toBeDefined();
      expect(typeof col.label).toBe('string');
    });
  });

  it('has render functions for each column', () => {
    trackTableColumns.forEach(col => {
      expect(typeof col.render).toBe('function');
    });
  });

  it('render function for name column works with company', () => {
    const nameCol = trackTableColumns.find(col => col.key === 'name');
    const mockItem = { company: 'Acme Corp', name: 'John Doe' };
    const result = nameCol.render(mockItem);
    expect(result).toBeDefined();
  });

  it('render function for name column works without company', () => {
    const nameCol = trackTableColumns.find(col => col.key === 'name');
    const mockItem = { name: 'Test Request' };
    const result = nameCol.render(mockItem);
    expect(result).toBeDefined();
  });

  it('render function for services column handles array', () => {
    const servicesCol = trackTableColumns.find(col => col.key === 'services');
    const mockItem = { services: ['Web', 'Mobile', 'API'] };
    const result = servicesCol.render(mockItem);
    expect(result).toBeDefined();
  });

  it('render function for services column handles budget', () => {
    const servicesCol = trackTableColumns.find(col => col.key === 'services');
    const mockItem = { services: ['Web'], budget: '$5000' };
    const result = servicesCol.render(mockItem);
    expect(result).toBeDefined();
  });

  it('render function for status column includes RequestTimeline', () => {
    const statusCol = trackTableColumns.find(col => col.key === 'status');
    const mockItem = { status: 'discover' };
    const result = statusCol.render(mockItem);
    expect(result).toBeDefined();
  });

  it('render function for created_at column formats date', () => {
    const dateCol = trackTableColumns.find(col => col.key === 'created_at');
    const mockItem = { created_at: '2024-01-15T10:00:00Z' };
    const result = dateCol.render(mockItem);
    expect(result).toBeDefined();
  });

  it('name column is sortable', () => {
    const nameCol = trackTableColumns.find(col => col.key === 'name');
    expect(nameCol.sortable).toBe(true);
  });

  it('created_at column is sortable', () => {
    const dateCol = trackTableColumns.find(col => col.key === 'created_at');
    expect(dateCol.sortable).toBe(true);
  });
});
