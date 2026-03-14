import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn()
}));

vi.mock('react', () => ({
  cache: (fn) => fn
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPosts, getPostById, getBlogCategories, createPost, updatePost, deletePost } from '@/lib/data/blogPosts';

describe('getPosts', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('returns published posts by default', async () => {
    const mockData = [{ id: 1, title: 'Post 1', published: true }];
    mockSupabase.order.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: mockData, error: null }) });

    const result = await getPosts();

    expect(result).toEqual(mockData);
  });

  it('returns all posts when published=false', async () => {
    const mockData = [{ id: 1, title: 'Post 1', published: false }];
    mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

    await getPosts({ published: false });

    expect(mockSupabase.eq).not.toHaveBeenCalled();
  });

  it('returns empty array when no rows', async () => {
    mockSupabase.order.mockResolvedValue({ data: null, error: null });

    const result = await getPosts();

    expect(result).toEqual([]);
  });

  it('returns empty array on error', async () => {
    mockSupabase.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getPosts();

    expect(result).toEqual([]);
  });
});

describe('getPostById', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('finds post by UUID', async () => {
    const mockData = { id: '123e4567-e89b-12d3-a456-426614174000', title: 'Post' };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockData, error: null });

    const result = await getPostById('123e4567-e89b-12d3-a456-426614174000');

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    expect(result).toEqual(mockData);
  });

  it('finds post by numeric id', async () => {
    const mockData = { id: 123, title: 'Post' };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockData, error: null });

    const result = await getPostById('123');

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 123);
    expect(result).toEqual(mockData);
  });

  it('finds post by slug', async () => {
    const mockData = { id: 1, slug: 'my-post', title: 'My Post' };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockData, error: null });

    const result = await getPostById('my-post');

    expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-post');
    expect(result).toEqual(mockData);
  });

  it('returns null when not found', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await getPostById('nonexistent');

    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getPostById('some-id');

    expect(result).toBeNull();
  });
});

describe('getBlogCategories', () => {
  let mockQueryBuilder;

  beforeEach(() => {
    mockQueryBuilder = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    createServerSupabaseClient.mockResolvedValue(mockQueryBuilder);
  });

  it('returns unique categories with All', async () => {
    mockQueryBuilder.eq.mockReturnValue({
      data: [
        { category: 'Tech' },
        { category: 'Design' },
        { category: 'Tech' }
      ],
      error: null
    });

    const result = await getBlogCategories();

    expect(result).toContain('All');
    expect(result).toContain('Tech');
    expect(result).toContain('Design');
  });

  it('returns empty array when no categories', async () => {
    mockQueryBuilder.eq.mockReturnValue({ data: [], error: null });

    const result = await getBlogCategories();

    expect(result).toBeUndefined();
  });

  it('returns empty array on error', async () => {
    mockQueryBuilder.eq.mockReturnValue({ data: null, error: { message: 'DB error' } });

    const result = await getBlogCategories();

    expect(result).toEqual([]);
  });
});

describe('createPost', () => {
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

  it('creates post with auto-generated slug', async () => {
    const input = { title: 'My New Post', content: 'Content' };
    const mockData = { id: 1, slug: 'my-new-post', ...input };
    mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

    const result = await createPost(input);

    expect(result.slug).toBe('my-new-post');
  });

  it('uses provided slug', async () => {
    const input = { title: 'My Post', slug: 'custom-slug' };
    mockSupabase.single.mockResolvedValue({ data: input, error: null });

    await createPost(input);

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'custom-slug' }));
  });

  it('throws on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await expect(createPost({ title: 'Test' })).rejects.toThrow('DB error');
  });
});

describe('updatePost', () => {
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

  it('updates post by numeric id', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: 123 }, error: null });

    await updatePost('123', { title: 'Updated' });

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 123);
  });

  it('updates post by string id', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: 'abc' }, error: null });

    await updatePost('abc', { title: 'Updated' });

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'abc');
  });

  it('throws on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await expect(updatePost('1', { title: 'Test' })).rejects.toThrow('DB error');
  });
});

describe('deletePost', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('deletes post by numeric id', async () => {
    await deletePost('123');

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 123);
  });

  it('deletes post by string id', async () => {
    await deletePost('abc');

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'abc');
  });

  it('returns true on success', async () => {
    const result = await deletePost('1');

    expect(result).toBe(true);
  });

  it('throws on DB error', async () => {
    mockSupabase.eq.mockResolvedValue({ error: { message: 'DB error' } });

    await expect(deletePost('1')).rejects.toThrow('DB error');
  });
});
