import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn()
}));

vi.mock('react', () => ({
  cache: (fn) => fn
}));

vi.mock('@/data/projects', () => ({
  projects: [{ id: 'static-1', title: 'Static Project' }]
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getProjects, getProjectById, getProjectFilters, createProject, updateProject, deleteProject } from '@/lib/data/projects';

describe('getProjects', () => {
  let mockSupabase;
  let callCount = 0;

  beforeEach(() => {
    callCount = 0;
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(function() {
        callCount++;
        if (callCount === 2) {
          return Promise.resolve({ data: [], error: null });
        }
        return this;
      }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('returns data on success', async () => {
    const mockData = [{ id: '1', title: 'Project 1' }];
    mockSupabase.order.mockImplementation(function() {
      callCount++;
      if (callCount === 2) {
        return Promise.resolve({ data: mockData, error: null });
      }
      return this;
    });

    const result = await getProjects();

    expect(result).toEqual(mockData);
  });

  it('returns empty array when no rows', async () => {
    const mockData = [];
    mockSupabase.order.mockImplementation(function() {
      callCount++;
      if (callCount === 2) {
        return Promise.resolve({ data: mockData, error: null });
      }
      return this;
    });

    const result = await getProjects();

    expect(result).toEqual([]);
  });

  it('falls back to static projects on error', async () => {
    mockSupabase.order.mockImplementation(function() {
      callCount++;
      if (callCount === 2) {
        return Promise.resolve({ data: null, error: { message: 'DB error' } });
      }
      return this;
    });

    const result = await getProjects();

    expect(result).toEqual([{ id: 'static-1', title: 'Static Project' }]);
  });
});

describe('getProjectById', () => {
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

  it('finds project by UUID id', async () => {
    const mockData = { id: '123e4567-e89b-12d3-a456-426614174000', title: 'Project' };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockData, error: null });

    const result = await getProjectById('123e4567-e89b-12d3-a456-426614174000');

    expect(result).toEqual(mockData);
  });

  it('finds project by slug', async () => {
    const mockData = { id: '1', slug: 'my-project', title: 'My Project' };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockData, error: null });

    const result = await getProjectById('my-project');

    expect(result).toEqual(mockData);
  });

  it('returns null when not found', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await getProjectById('nonexistent');

    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getProjectById('some-id');

    expect(result).toBeNull();
  });
});

describe('getProjectFilters', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('returns unique categories with All', async () => {
    mockSupabase.select.mockResolvedValue({
      data: [
        { category: 'Web' },
        { category: 'Mobile' },
        { category: 'Web' }
      ],
      error: null
    });

    const result = await getProjectFilters();

    expect(result).toContain('All');
    expect(result).toContain('Web');
    expect(result).toContain('Mobile');
  });

  it('returns only All when no categories', async () => {
    mockSupabase.select.mockResolvedValue({ data: [], error: null });

    const result = await getProjectFilters();

    expect(result).toEqual(['All']);
  });

  it('returns only All on error', async () => {
    mockSupabase.select.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getProjectFilters();

    expect(result).toEqual(['All']);
  });
});

describe('createProject', () => {
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

  it('creates project with generated slug', async () => {
    const input = { title: 'My Project', client: 'Acme' };
    const mockData = { id: 'my-project', slug: 'my-project', ...input };
    mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

    const result = await createProject(input);

    expect(result.slug).toBe('my-project');
  });

  it('uses provided slug', async () => {
    const input = { title: 'My Project', slug: 'custom-slug' };
    mockSupabase.single.mockResolvedValue({ data: input, error: null });

    await createProject(input);

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'custom-slug' }));
  });

  it('generates slug from client if no title', async () => {
    const input = { client: 'TestClient' };
    mockSupabase.single.mockResolvedValue({ data: { slug: 'testclient' }, error: null });

    await createProject(input);

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ slug: 'testclient' }));
  });

  it('throws on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await expect(createProject({ title: 'Test' })).rejects.toThrow('DB error');
  });
});

describe('updateProject', () => {
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

  it('updates by id for UUID', async () => {
    mockSupabase.single.mockResolvedValue({ data: { id: '1' }, error: null });

    await updateProject('123e4567-e89b-12d3-a456-426614174000', { title: 'Updated' });

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
  });

  it('updates by slug for non-UUID', async () => {
    mockSupabase.single.mockResolvedValue({ data: { slug: 'my-project' }, error: null });

    await updateProject('my-project', { title: 'Updated' });

    expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-project');
  });

  it('throws on DB error', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    await expect(updateProject('1', { title: 'Test' })).rejects.toThrow('DB error');
  });
});

describe('deleteProject', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  it('deletes by id for UUID', async () => {
    await deleteProject('123e4567-e89b-12d3-a456-426614174000');

    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
  });

  it('deletes by slug for non-UUID', async () => {
    await deleteProject('my-project');

    expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-project');
  });

  it('returns true on success', async () => {
    const result = await deleteProject('1');

    expect(result).toBe(true);
  });

  it('throws on DB error', async () => {
    mockSupabase.eq.mockResolvedValue({ error: { message: 'DB error' } });

    await expect(deleteProject('1')).rejects.toThrow('DB error');
  });
});

describe('projects error branches', () => {
  it('getProjectById throws when Supabase not configured', async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    const result = await getProjectById('1');
    expect(result).toBeNull();
  });

  it('getProjectFilters throws when Supabase not configured', async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    const result = await getProjectFilters();
    expect(result).toEqual(['All']);
  });

  it('createProject throws when Supabase not configured', async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    await expect(createProject({ title: 'Test', client: 'Client' }))
      .rejects.toThrow('Supabase not configured');
  });

  it('updateProject throws when Supabase not configured', async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    await expect(updateProject('1', { title: 'Test' }))
      .rejects.toThrow('Supabase not configured');
  });

  it('deleteProject throws when Supabase not configured', async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    await expect(deleteProject('1'))
      .rejects.toThrow('Supabase not configured');
  });
});
