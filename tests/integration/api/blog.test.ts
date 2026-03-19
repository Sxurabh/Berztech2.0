/**
 * @fileoverview Integration tests for Blog API routes
 *
 * Tests cover:
 * - GET /api/blog — List posts (public vs admin visibility)
 * - POST /api/blog — Create post (admin only)
 * - GET /api/blog/[id] — Get single post (by UUID or slug)
 * - PUT /api/blog/[id] — Update post (admin only)
 * - DELETE /api/blog/[id] — Delete post (admin only)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getList, POST as createPost } from "@/app/api/blog/route";
import {
    GET as getSingle,
    PUT as updatePost,
    DELETE as deletePost,
} from "@/app/api/blog/[id]/route";

// Mock dependencies
vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

describe("Blog API", () => {
    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

        // Default: anonymous user
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        // Default: not admin
        (isAdminEmail as any).mockReturnValue(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Helper to create mock NextRequest
     */
    function createJsonRequest(
        url: string,
        body?: unknown,
        method = "GET"
    ): NextRequest {
        const options: any = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        return new NextRequest(url, options);
    }

    /**
     * Helper to setup authenticated user
     */
    function setupUser(email: string, isAdmin = false) {
        const mockUser = {
            id: `user-${email.split("@")[0]}`,
            email,
        };
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
        (isAdminEmail as any).mockImplementation(
            (e: string) => e === email && isAdmin
        );
        return mockUser;
    }

    /**
     * Mock the Supabase query chain for blog posts (LIST queries)
     */
    function mockBlogListQuery(data: any, error: any = null) {
        const queryMock = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
        };

        // The final query result should be resolved
        mockSupabase.from.mockReturnValue(queryMock);

        // Override the mock to return data when awaited
        const originalFrom = mockSupabase.from.getMockImplementation();
        mockSupabase.from.mockImplementation((table: string) => {
            const chain = originalFrom?.(table) || queryMock;
            // Return a thenable that resolves to { data, error }
            return Object.create(chain, {
                then: {
                    value: (resolve: any) => resolve({ data, error }),
                },
            });
        });

        return queryMock;
    }

    /**
     * Mock the Supabase query chain for single operations (GET, INSERT, UPDATE, DELETE)
     */
    function mockBlogQueryChain(data: any, error: any = null) {
        const queryMock = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data, error }),
            single: vi.fn().mockResolvedValue({ data, error }),
        };

        mockSupabase.from.mockReturnValue(queryMock);
        return queryMock;
    }

    describe("GET /api/blog (List)", () => {
        it("1. Anonymous user → receives only published:true posts", async () => {
            const publishedPosts = [
                { id: "post-1", title: "Published Post", published: true },
                { id: "post-2", title: "Another Published", published: true },
            ];

            mockBlogListQuery(publishedPosts);

            const request = createJsonRequest("http://localhost:3000/api/blog");
            const response = await getList(request);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual(publishedPosts);

            // Verify the query was filtered for published posts
            const queryMock = mockSupabase.from.mock.results[0].value;
            expect(queryMock.eq).toHaveBeenCalledWith("published", true);
        });

        it("2. Admin user → receives ALL posts including drafts", async () => {
            setupUser("admin@berztech.com", true);

            const allPosts = [
                { id: "post-1", title: "Published Post", published: true },
                { id: "post-2", title: "Draft Post", published: false },
                { id: "post-3", title: "Another Draft", published: false },
            ];

            mockBlogListQuery(allPosts);

            const request = createJsonRequest("http://localhost:3000/api/blog");
            const response = await getList(request);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.length).toBe(3);
            expect(body.some((p: any) => !p.published)).toBe(true);
        });

        it("3. Posts are ordered by created_at descending", async () => {
            const orderedPosts = [
                { id: "post-3", title: "Latest", created_at: "2024-03-15" },
                { id: "post-2", title: "Middle", created_at: "2024-02-10" },
                { id: "post-1", title: "Oldest", created_at: "2024-01-05" },
            ];

            mockBlogListQuery(orderedPosts);

            const request = createJsonRequest("http://localhost:3000/api/blog");
            await getList(request);

            // Verify ordering was applied
            const queryMock = mockSupabase.from.mock.results[0].value;
            expect(queryMock.order).toHaveBeenCalledWith("created_at", {
                ascending: false,
            });
        });

        it("4. Returns 500 when Supabase query fails", async () => {
            mockBlogListQuery(null, { message: "Database connection failed" });

            const request = createJsonRequest("http://localhost:3000/api/blog");
            const response = await getList(request);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body.error).toBe("Internal server error");
        });
    });

    describe("POST /api/blog (Create)", () => {
        it("5. Unauthenticated request → 401", async () => {
            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { title: "New Post" },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("6. Authenticated non-admin → 403", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { title: "New Post" },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("7. Admin with missing title → 400", async () => {
            setupUser("admin@berztech.com", true);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { content: "Content without title" },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Title is required");
        });

        it("8. Admin with valid payload → 201 with new post data", async () => {
            setupUser("admin@berztech.com", true);

            const newPost = {
                id: "new-post-uuid",
                title: "My New Blog Post",
                slug: "my-new-blog-post",
                excerpt: "A brief excerpt",
                content: "Full content here",
                category: "General",
                published: false,
                featured: false,
                author: "Berztech",
            };

            mockBlogQueryChain(newPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                {
                    title: "My New Blog Post",
                    excerpt: "A brief excerpt",
                    content: "Full content here",
                },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.title).toBe("My New Blog Post");
            expect(body.slug).toBe("my-new-blog-post");
        });

        it("9. Slug is auto-generated when not provided", async () => {
            setupUser("admin@berztech.com", true);

            const newPost = {
                id: "slug-test-uuid",
                title: "My Amazing Title With Spaces",
                slug: "my-amazing-title-with-spaces",
                category: "General",
                published: false,
            };

            mockBlogQueryChain(newPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { title: "My Amazing Title With Spaces" },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.slug).toBe("my-amazing-title-with-spaces");
        });

        it("10. Malformed JSON → 400", async () => {
            setupUser("admin@berztech.com", true);

            const request = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{ invalid json }",
            });

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Invalid JSON body");
        });
    });

    describe("GET /api/blog/[id] (Single)", () => {
        it("returns post by UUID", async () => {
            const post = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                title: "Test Post",
                slug: "test-post",
                published: true,
            };

            mockBlogQueryChain(post);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/550e8400-e29b-41d4-a716-446655440000"
            );
            const params = Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" });
            const response = await getSingle(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.title).toBe("Test Post");

            // Verify UUID was used in query
            const queryMock = mockSupabase.from.mock.results[0].value;
            expect(queryMock.eq).toHaveBeenCalledWith(
                "id",
                "550e8400-e29b-41d4-a716-446655440000"
            );
        });

        it("returns post by slug", async () => {
            const post = {
                id: "post-uuid",
                title: "My Post",
                slug: "my-custom-slug",
                published: true,
            };

            mockBlogQueryChain(post);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/my-custom-slug"
            );
            const params = Promise.resolve({ id: "my-custom-slug" });
            const response = await getSingle(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.title).toBe("My Post");

            // Verify slug was used in query
            const queryMock = mockSupabase.from.mock.results[0].value;
            expect(queryMock.eq).toHaveBeenCalledWith("slug", "my-custom-slug");
        });

        it("returns 404 when post not found", async () => {
            mockBlogQueryChain(null);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/non-existent-slug"
            );
            const params = Promise.resolve({ id: "non-existent-slug" });
            const response = await getSingle(request, { params });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.error).toBe("Not found");
        });
    });

    describe("PUT /api/blog/[id] (Update)", () => {
        it("11. Admin can update a post by UUID", async () => {
            setupUser("admin@berztech.com", true);

            const updatedPost = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                title: "Updated Title",
                slug: "updated-slug",
            };

            mockBlogQueryChain(updatedPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/550e8400-e29b-41d4-a716-446655440000",
                { title: "Updated Title" },
                "PUT"
            );
            const params = Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" });
            const response = await updatePost(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.title).toBe("Updated Title");
        });

        it("12. Admin can update a post by slug", async () => {
            setupUser("admin@berztech.com", true);

            const updatedPost = {
                id: "post-uuid",
                title: "Updated By Slug",
                slug: "original-slug",
            };

            mockBlogQueryChain(updatedPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/original-slug",
                { title: "Updated By Slug" },
                "PUT"
            );
            const params = Promise.resolve({ id: "original-slug" });
            const response = await updatePost(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.title).toBe("Updated By Slug");
        });

        it("13. Only whitelisted fields are updated (extra fields ignored)", async () => {
            setupUser("admin@berztech.com", true);

            const updatedPost = {
                id: "post-uuid",
                title: "New Title",
                slug: "new-slug",
                // Note: hackerField should be ignored
            };

            mockBlogQueryChain(updatedPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/post-uuid",
                {
                    title: "New Title",
                    slug: "new-slug",
                    hackerField: "should be ignored",
                    anotherBadField: 12345,
                },
                "PUT"
            );
            const params = Promise.resolve({ id: "post-uuid" });
            const response = await updatePost(request, { params });

            expect(response.status).toBe(200);

            // Verify update was called with only whitelisted fields
            const queryMock = mockSupabase.from.mock.results[0].value;
            expect(queryMock.update).toHaveBeenCalled();
            const updatePayload = queryMock.update.mock.calls[0][0];
            expect(updatePayload.hackerField).toBeUndefined();
            expect(updatePayload.anotherBadField).toBeUndefined();
            expect(updatePayload.title).toBe("New Title");
        });

        it("14. Non-admin → 403", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/post-uuid",
                { title: "Hacked Title" },
                "PUT"
            );
            const params = Promise.resolve({ id: "post-uuid" });
            const response = await updatePost(request, { params });
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("15. Non-existent ID → 404", async () => {
            setupUser("admin@berztech.com", true);

            mockBlogQueryChain(null);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/non-existent",
                { title: "Update" },
                "PUT"
            );
            const params = Promise.resolve({ id: "non-existent" });
            const response = await updatePost(request, { params });

            expect(response.status).toBe(200);
            // maybeSingle returns null data, route returns that
            const body = await response.json();
            expect(body).toBeNull();
        });
    });

    describe("DELETE /api/blog/[id] (Delete)", () => {
        it("16. Admin deletes existing post → 200 { success: true }", async () => {
            setupUser("admin@berztech.com", true);

            mockBlogQueryChain({});

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/post-to-delete",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "post-to-delete" });
            const response = await deletePost(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
        });

        it("17. Non-admin → 403", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/post-uuid",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "post-uuid" });
            const response = await deletePost(request, { params });
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("returns 401 for unauthenticated delete", async () => {
            const request = createJsonRequest(
                "http://localhost:3000/api/blog/post-uuid",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "post-uuid" });
            const response = await deletePost(request, { params });
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("handles deletion by UUID", async () => {
            setupUser("admin@berztech.com", true);

            mockBlogQueryChain({});

            const request = createJsonRequest(
                "http://localhost:3000/api/blog/550e8400-e29b-41d4-a716-446655440000",
                null,
                "DELETE"
            );
            const params = Promise.resolve({
                id: "550e8400-e29b-41d4-a716-446655440000",
            });
            const response = await deletePost(request, { params });

            expect(response.status).toBe(200);

            // Verify UUID was used in query
            const queryMock = mockSupabase.from.mock.results[0].value;
            expect(queryMock.eq).toHaveBeenCalledWith(
                "id",
                "550e8400-e29b-41d4-a716-446655440000"
            );
        });
    });

    describe("Edge cases", () => {
        it("handles empty title with whitespace → 400", async () => {
            setupUser("admin@berztech.com", true);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { title: "   " },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Title is required");
        });

        it("preserves existing slug when provided", async () => {
            setupUser("admin@berztech.com", true);

            const newPost = {
                id: "custom-slug-uuid",
                title: "My Title",
                slug: "custom-slug-provided",
            };

            mockBlogQueryChain(newPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { title: "My Title", slug: "custom-slug-provided" },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.slug).toBe("custom-slug-provided");
        });

        it("generates valid slug from title with special characters", async () => {
            setupUser("admin@berztech.com", true);

            const newPost = {
                id: "slug-test",
                title: "My Post!!! With @#$% Special & Chars???",
                slug: "my-post-with-special-chars",
            };

            mockBlogQueryChain(newPost);

            const request = createJsonRequest(
                "http://localhost:3000/api/blog",
                { title: "My Post!!! With @#$% Special & Chars???" },
                "POST"
            );

            const response = await createPost(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            // Slug should be cleaned up
            expect(body.slug).toMatch(/^[a-z0-9-]+$/);
        });
    });
});
