/**
 * @fileoverview Integration tests for Projects API
 *
 * Tests cover:
 * - GET /api/projects — Public listing
 * - POST /api/projects — Admin-only create (auth guard, validation)
 * - GET /api/projects/[id] — Single project
 * - PUT /api/projects/[id] — Admin-only update (field whitelist)
 * - DELETE /api/projects/[id] — Admin-only delete
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

vi.mock("@/lib/data/projects", () => ({
    getProjects: vi.fn(),
    getProjectById: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from "@/lib/data/projects";
import { GET as getProjectsList, POST as createProjectRoute } from "@/app/api/projects/route";
import { GET as getProject, PUT as updateProjectRoute, DELETE as deleteProjectRoute } from "@/app/api/projects/[id]/route";

describe("Projects API", () => {
    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
    };

    const mockProject = {
        id: "proj-1",
        slug: "test-project",
        title: "Test Project",
        client: "Acme Corp",
        description: "A test project",
        category: "Web",
        featured: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(url: string, body?: unknown, method = "POST"): NextRequest {
        const options: any = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        return new NextRequest(url, options);
    }

    function setupAdmin() {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "admin-1", email: "admin@berztech.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
    }

    function setupNonAdmin() {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1", email: "client@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(false);
    }

    function setupUnauthed() {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });
    }

    describe("GET /api/projects", () => {
        it("1. Returns all projects (public)", async () => {
            (getProjects as any).mockResolvedValue([mockProject]);

            const response = await getProjectsList();
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json).toEqual([mockProject]);
        });

        it("2. Returns 500 on service error", async () => {
            (getProjects as any).mockRejectedValue(new Error("DB failure"));

            const response = await getProjectsList();
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toBe("Internal server error");
        });
    });

    describe("POST /api/projects", () => {
        it("3. Unauthenticated → 401", async () => {
            setupUnauthed();

            const response = await createProjectRoute(
                createJsonRequest("http://localhost/api/projects", { title: "Test", client: "Acme", description: "Desc" })
            );

            expect(response.status).toBe(401);
        });

        it("4. Non-admin → 403", async () => {
            setupNonAdmin();

            const response = await createProjectRoute(
                createJsonRequest("http://localhost/api/projects", { title: "Test", client: "Acme", description: "Desc" })
            );

            expect(response.status).toBe(403);
        });

        it("5. Admin with valid payload → 201", async () => {
            setupAdmin();
            (createProject as any).mockResolvedValue(mockProject);

            const response = await createProjectRoute(
                createJsonRequest("http://localhost/api/projects", { title: "Test Project", client: "Acme Corp", description: "A test project" })
            );
            const json = await response.json();

            expect(response.status).toBe(201);
            expect(json.title).toBe("Test Project");
        });

        it("6. Admin missing required fields → 400", async () => {
            setupAdmin();

            const response = await createProjectRoute(
                createJsonRequest("http://localhost/api/projects", { title: "Test" })
            );
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("required");
        });

        it("7. Admin with malformed JSON → 400", async () => {
            setupAdmin();

            const req = new NextRequest("http://localhost/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "not json",
            });
            const response = await createProjectRoute(req);

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/projects/[id]", () => {
        it("8. Returns project by ID", async () => {
            (getProjectById as any).mockResolvedValue(mockProject);

            const response = await getProject(
                createJsonRequest("http://localhost/api/projects/proj-1", null, "GET"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.id).toBe("proj-1");
        });

        it("9. Returns 404 when not found", async () => {
            (getProjectById as any).mockResolvedValue(null);

            const response = await getProject(
                createJsonRequest("http://localhost/api/projects/missing", null, "GET"),
                { params: Promise.resolve({ id: "missing" }) }
            );

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/projects/[id]", () => {
        it("10. Non-admin → 403", async () => {
            setupNonAdmin();

            const response = await updateProjectRoute(
                createJsonRequest("http://localhost/api/projects/proj-1", { title: "Updated" }, "PUT"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );

            expect(response.status).toBe(403);
        });

        it("11. Admin updates → 200", async () => {
            setupAdmin();
            (updateProject as any).mockResolvedValue({ ...mockProject, title: "Updated" });

            const response = await updateProjectRoute(
                createJsonRequest("http://localhost/api/projects/proj-1", { title: "Updated" }, "PUT"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.title).toBe("Updated");
        });

        it("12. No valid fields → 400", async () => {
            setupAdmin();

            const response = await updateProjectRoute(
                createJsonRequest("http://localhost/api/projects/proj-1", { invalidField: "test" }, "PUT"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );

            expect(response.status).toBe(400);
        });

        it("13. Non-existent project → 404", async () => {
            setupAdmin();
            (updateProject as any).mockResolvedValue(null);

            const response = await updateProjectRoute(
                createJsonRequest("http://localhost/api/projects/missing", { title: "Updated" }, "PUT"),
                { params: Promise.resolve({ id: "missing" }) }
            );

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/projects/[id]", () => {
        it("14. Unauthenticated → 401", async () => {
            setupUnauthed();

            const response = await deleteProjectRoute(
                createJsonRequest("http://localhost/api/projects/proj-1", null, "DELETE"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );

            expect(response.status).toBe(401);
        });

        it("15. Non-admin → 403", async () => {
            setupNonAdmin();

            const response = await deleteProjectRoute(
                createJsonRequest("http://localhost/api/projects/proj-1", null, "DELETE"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );

            expect(response.status).toBe(403);
        });

        it("16. Admin deletes → 200 { success: true }", async () => {
            setupAdmin();
            (deleteProject as any).mockResolvedValue(undefined);

            const response = await deleteProjectRoute(
                createJsonRequest("http://localhost/api/projects/proj-1", null, "DELETE"),
                { params: Promise.resolve({ id: "proj-1" }) }
            );
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.success).toBe(true);
        });
    });
});
