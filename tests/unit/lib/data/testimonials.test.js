import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn()
}));

vi.mock('react', () => ({
  cache: (fn) => fn
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/data/testimonials';

describe('getTestimonials', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('returns data on success', async () => {
    const mockData = [{ id: '1', client: 'Test Client', content: 'Great!' }];
    mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

    const result = await getTestimonials();

    expect(result).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('testimonials');
  });

  it('returns empty array when table has no rows', async () => {
    mockSupabase.order.mockResolvedValue({ data: null, error: null });

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });

  it('returns empty array on DB error', async () => {
    mockSupabase.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });

  it('throws when Supabase not configured', async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    const result = await getTestimonials();

    expect(result).toEqual([]);
  });
});

describe('getTestimonialById', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('returns data on success', async () => {
    const mockData = { id: '1', client: 'Test Client' };
    mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

    const result = await getTestimonialById('1');

    expect(result).toEqual(mockData);
  });

  it('returns null when not found', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: null });

    const result = await getTestimonialById('999');

    expect(result).toBeNull();
  });

  it('returns null on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getTestimonialById('1');

    expect(result).toBeNull();
  });
});

describe('createTestimonial', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('creates testimonial with correct payload', async () => {
    const input = { client: 'Test', role: 'CEO', company: 'Acme', content: 'Great!', featured: true };
    const mockData = { id: '1', ...input };
    mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

    const result = await createTestimonial(input);

    expect(result).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('testimonials');
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      client: 'Test',
      role: 'CEO',
      company: 'Acme',
      content: 'Great!',
      featured: true,
      color: 'blue'
    }));
  });

  it('throws on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await expect(createTestimonial({ client: 'Test' })).rejects.toThrow('DB error');
  });

  it('defaults color to blue when not provided', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '1' }, error: null });

    await createTestimonial({ client: 'Test' });

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ color: 'blue' }));
  });
});

describe('updateTestimonial', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('updates testimonial with partial data', async () => {
    const mockData = { id: '1', client: 'Updated' };
    mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

    const result = await updateTestimonial('1', { client: 'Updated' });

    expect(result).toEqual(mockData);
    expect(mockSupabase.update).toHaveBeenCalledWith({ client: 'Updated' });
  });

  it('throws on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await expect(updateTestimonial('1', { client: 'Test' })).rejects.toThrow('DB error');
  });
});

describe('deleteTestimonial', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('deletes testimonial and returns true', async () => {
    const result = await deleteTestimonial('1');

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('testimonials');
    expect(mockSupabase.delete).toHaveBeenCalled();
  });

  it('throws on DB error', async () => {
    mockSupabase.eq.mockResolvedValue({ error: { message: 'DB error' } });

    await expect(deleteTestimonial('1')).rejects.toThrow('DB error');
  });
});
