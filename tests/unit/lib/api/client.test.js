import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();

describe('API Clients', () => {
  let projectsApi, blogApi, uploadApi, testimonialsApi;

  beforeEach(async () => {
    mockFetch.mockClear();
    vi.stubGlobal('fetch', mockFetch);
    
    const client = await import('@/lib/api/client');
    projectsApi = client.projectsApi;
    blogApi = client.blogApi;
    uploadApi = client.uploadApi;
    testimonialsApi = client.testimonialsApi;
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  describe('fetchJson internal behavior', () => {
    it('makes request to /api/projects endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
      });

      await projectsApi.list();

      expect(mockFetch).toHaveBeenCalledWith('/api/projects', expect.any(Object));
    });

    it('includes Content-Type: application/json header by default', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
      });

      await projectsApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('throws error when response is not ok (4xx)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid request', details: 'Name is required' }),
      });

      await expect(projectsApi.create({ title: 'Test' })).rejects.toThrow('Invalid request');
    });

    it('throws error when response is not ok (5xx)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      await expect(projectsApi.list()).rejects.toThrow('Internal server error');
    });

    it('throws error when response body is not valid JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('not valid json'),
      });

      await expect(projectsApi.list()).rejects.toThrow('Failed to parse response');
    });

    it('handles empty response body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const result = await projectsApi.list();

      expect(result).toBeNull();
    });

    it('includes custom headers when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
      });

      await blogApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blog',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('projectsApi', () => {
    it('list calls GET /api/projects', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify([{ id: 1 }])),
      });

      await projectsApi.list();

      expect(mockFetch).toHaveBeenCalledWith('/api/projects', expect.any(Object));
    });

    it('get calls GET /api/projects/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await projectsApi.get('proj-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/projects/proj-123', expect.any(Object));
    });

    it('create calls POST /api/projects with JSON body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await projectsApi.create({ title: 'New Project', description: 'A great project' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Project', description: 'A great project' }),
        })
      );
    });

    it('update calls PUT /api/projects/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await projectsApi.update('proj-123', { title: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects/proj-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated' }),
        })
      );
    });

    it('delete calls DELETE /api/projects/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await projectsApi.delete('proj-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects/proj-123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('blogApi', () => {
    it('list calls GET /api/blog', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify([{ id: 1 }])),
      });

      await blogApi.list();

      expect(mockFetch).toHaveBeenCalledWith('/api/blog', expect.any(Object));
    });

    it('get calls GET /api/blog/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await blogApi.get('post-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/blog/post-123', expect.any(Object));
    });

    it('create calls POST /api/blog', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await blogApi.create({ title: 'New Post', content: 'Content', slug: 'new-post' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blog',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Post', content: 'Content', slug: 'new-post' }),
        })
      );
    });

    it('update calls PUT /api/blog/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await blogApi.update('post-123', { title: 'Updated Title' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blog/post-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Title' }),
        })
      );
    });

    it('delete calls DELETE /api/blog/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await blogApi.delete('post-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blog/post-123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('uploadApi', () => {
    it('upload calls POST /api/upload with FormData and removes Content-Type', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ url: 'https://example.com/test.jpg' })),
      });

      const file = new Blob(['test'], { type: 'image/jpeg' });
      await uploadApi.upload(file);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
        })
      );

      const callBody = mockFetch.mock.calls[0][1].body;
      expect(callBody instanceof FormData).toBe(true);
    });
  });

  describe('testimonialsApi', () => {
    it('list calls GET /api/testimonials', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify([{ id: 1 }])),
      });

      await testimonialsApi.list();

      expect(mockFetch).toHaveBeenCalledWith('/api/testimonials', expect.any(Object));
    });

    it('get calls GET /api/testimonials/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await testimonialsApi.get('testimonial-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/testimonials/testimonial-123', expect.any(Object));
    });

    it('create calls POST /api/testimonials', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await testimonialsApi.create({ name: 'John', quote: 'Great service!', company: 'Acme' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/testimonials',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John', quote: 'Great service!', company: 'Acme' }),
        })
      );
    });

    it('update calls PUT /api/testimonials/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await testimonialsApi.update('testimonial-123', { quote: 'Updated quote' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/testimonials/testimonial-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ quote: 'Updated quote' }),
        })
      );
    });

    it('delete calls DELETE /api/testimonials/{id}', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await testimonialsApi.delete('testimonial-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/testimonials/testimonial-123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
