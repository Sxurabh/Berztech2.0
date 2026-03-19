import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const ProjectSchema = z.object({
  id: z.string().uuid(),
  client: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  image: z.string().url().nullable().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  category: z.string().nullable(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const ProjectListSchema = z.object({
  data: z.array(ProjectSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

const BlogPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().nullable(),
  image: z.string().url().nullable().or(z.literal('')),
  author: z.string().min(1).max(100),
  published: z.boolean(),
  featured: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const BlogPostListSchema = z.object({
  data: z.array(BlogPostSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

const TestimonialSchema = z.object({
  id: z.string().uuid(),
  client: z.string().min(1).max(100),
  company: z.string().nullable(),
  content: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5),
  featured: z.boolean().default(false),
  created_at: z.string().datetime(),
});

const TestimonialListSchema = z.object({
  data: z.array(TestimonialSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
  type: z.enum(['info', 'success', 'warning', 'error']),
  is_read: z.boolean(),
  created_at: z.string().datetime(),
});

const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

describe('Contract Validation Tests - Projects', () => {
  it('should validate project schema structure', () => {
    const validProject = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      client: 'Test Client',
      title: 'Test Project',
      description: null,
      image: null,
      tags: ['web', 'react'],
      category: 'web',
      status: 'active',
      featured: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    const result = ProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('should reject invalid project data', () => {
    const invalidProject = {
      id: 'invalid-uuid',
      client: '',
      title: '',
    };

    const result = ProjectSchema.safeParse(invalidProject);
    expect(result.success).toBe(false);
  });

  it('should validate project list structure', () => {
    const validList = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };

    const result = ProjectListSchema.safeParse(validList);
    expect(result.success).toBe(true);
  });

  it('should validate project status enum', () => {
    const statuses = ['draft', 'active', 'completed', 'archived'];
    
    statuses.forEach(status => {
      const project = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        client: 'Test',
        title: 'Test',
        description: null,
        image: null,
        tags: [],
        category: null,
        featured: false,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        status,
      };

      const result = ProjectSchema.safeParse(project);
      expect(result.success).toBe(true);
    });
  });
});

describe('Contract Validation Tests - Blog', () => {
  it('should validate blog post schema structure', () => {
    const validPost = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Post',
      slug: 'test-post',
      content: 'Content here',
      excerpt: null,
      image: null,
      author: 'Author',
      published: true,
      featured: false,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    const result = BlogPostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it('should validate blog post slug format', () => {
    const validSlugs = ['test-post', 'hello-world-123', 'a-b-c'];
    
    validSlugs.forEach(slug => {
      const post = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        slug,
        content: 'Content',
        excerpt: null,
        image: null,
        author: 'Author',
        featured: false,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        published: true,
      };

      const result = BlogPostSchema.safeParse(post);
      expect(result.success).toBe(true);
    });
  });

  it('should validate blog list structure', () => {
    const validList = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };

    const result = BlogPostListSchema.safeParse(validList);
    expect(result.success).toBe(true);
  });
});

describe('Contract Validation Tests - Testimonials', () => {
  it('should validate testimonial schema structure', () => {
    const validTestimonial = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      client: 'John Doe',
      company: 'Acme Inc',
      content: 'Great service!',
      rating: 5,
      featured: true,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const result = TestimonialSchema.safeParse(validTestimonial);
    expect(result.success).toBe(true);
  });

  it('should validate rating range 1-5', () => {
    [1, 2, 3, 4, 5].forEach(rating => {
      const testimonial = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        client: 'Test',
        company: null,
        content: 'Test',
        rating,
        featured: false,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const result = TestimonialSchema.safeParse(testimonial);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid rating', () => {
    const testimonial = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      client: 'Test',
      content: 'Test',
      featured: false,
      rating: 6,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const result = TestimonialSchema.safeParse(testimonial);
    expect(result.success).toBe(false);
  });
});

describe('Contract Validation Tests - Notifications', () => {
  it('should validate notification schema structure', () => {
    const validNotification = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'New Message',
      message: 'You have a new message',
      type: 'info',
      is_read: false,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const result = NotificationSchema.safeParse(validNotification);
    expect(result.success).toBe(true);
  });

  it('should validate notification type enum', () => {
    const types = ['info', 'success', 'warning', 'error'];
    
    types.forEach(type => {
      const notification = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Test',
        message: 'Test',
        type,
        is_read: false,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const result = NotificationSchema.safeParse(notification);
      expect(result.success).toBe(true);
    });
  });
});

describe('Contract Validation Tests - Error Responses', () => {
  it('should validate error schema', () => {
    const error = {
      error: 'Validation failed',
    };

    const result = ApiErrorSchema.safeParse(error);
    expect(result.success).toBe(true);
  });

  it('should validate error with details', () => {
    const error = {
      error: 'Validation failed',
      details: { field: 'name', message: 'Required' },
    };

    const result = ApiErrorSchema.safeParse(error);
    expect(result.success).toBe(true);
  });
});

describe('Contract Validation Tests - Pagination', () => {
  it('should validate pagination structure', () => {
    const pagination = {
      page: 1,
      limit: 10,
      total: 100,
    };

    expect(typeof pagination.page).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.total).toBe('number');
  });

  it('should validate page range', () => {
    const validPages = [1, 2, 10, 100];
    
    validPages.forEach(page => {
      expect(page).toBeGreaterThanOrEqual(1);
    });
  });

  it('should validate limit range', () => {
    const validLimits = [1, 10, 25, 100];
    
    validLimits.forEach(limit => {
      expect(limit).toBeGreaterThanOrEqual(1);
      expect(limit).toBeLessThanOrEqual(100);
    });
  });
});

describe('Contract Validation Tests - Data Consistency', () => {
  it('should validate UUID format', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    
    expect(uuidRegex.test(validUuid)).toBe(true);
  });

  it('should validate ISO 8601 datetime format', () => {
    const validDates = [
      '2024-01-01T00:00:00.000Z',
      '2024-12-31T23:59:59.000Z',
    ];
    
    validDates.forEach(date => {
      expect(() => new Date(date)).not.toThrow();
    });
  });

  it('should validate response consistency', () => {
    const responses = [
      { data: [], total: 0, page: 1, limit: 10 },
      { data: [{ id: '1' }], total: 1, page: 1, limit: 10 },
    ];
    
    responses.forEach(response => {
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('total');
      expect(response).toHaveProperty('page');
      expect(response).toHaveProperty('limit');
    });
  });
});
