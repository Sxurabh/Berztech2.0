/**
 * @fileoverview Integration tests for Projects [id] API routes
 *
 * Tests cover:
 * - GET /api/projects/[id] — Public single project retrieval
 * - PUT /api/projects/[id] — Admin-only update
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
    getProjectById: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { getProjectById, updateProject, deleteProject } from "@/lib/data/projects";
import { GET as getProject, PUT as updateProjectRoute, DELETE as deleteProjectRoute } from "@/app/api/projects/[id]/route";

describe("GET /api/projects/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns project when found", async () => {
        const mockProject = { id: "proj-1", client: "Acme", title: "Website Redesign" };
        (getProjectById as any).mockResolvedValue(mockProject);

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1");
        const response = await getProject(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockProject);
    });

    it("returns 404 when project not found", async () => {
        (getProjectById as any).mockResolvedValue(null);

        const request = new NextRequest("http://localhost:3000/api/projects/not-found");
        const response = await getProject(request, { params: Promise.resolve({ id: "not-found" }) });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("Not found");
    });

    it("returns 500 on internal error", async () => {
        (getProjectById as any).mockRejectedValue(new Error("DB error"));

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1");
        const response = await getProject(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Internal server error");
    });
});

describe("PUT /api/projects/[id]", () => {
    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    function createJsonRequest(body: unknown, id: string = "proj-1") {
        return new NextRequest(`http://localhost:3000/api/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    it("returns 401 when not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const request = createJsonRequest({ title: "New Title" });
        const response = await updateProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 403 when user is not admin", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "user@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(false);

        const request = createJsonRequest({ title: "New Title" });
        const response = await updateProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error).toBe("Forbidden");
    });

    it("returns 400 for invalid JSON body", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: "invalid json",
        });

        const response = await updateProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid JSON body");
    });

    it("returns 400 when no valid fields provided", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        const request = createJsonRequest({});
        const response = await updateProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("No valid fields to update");
    });

    it("updates project with valid fields", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
        (updateProject as any).mockResolvedValue({ id: "proj-1", title: "Updated Title" });

        const request = createJsonRequest({ title: "Updated Title", featured: true });
        const response = await updateProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.title).toBe("Updated Title");
    });

    it("returns 404 when project not found", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
        (updateProject as any).mockResolvedValue(null);

        const request = createJsonRequest({ title: "Updated" });
        const response = await updateProjectRoute(request, { params: Promise.resolve({ id: "not-found" }) });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("Project not found");
    });
});

describe("DELETE /api/projects/[id]", () => {
    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    it("returns 401 when not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1", { method: "DELETE" });
        const response = await deleteProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 403 when user is not admin", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "user@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(false);

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1", { method: "DELETE" });
        const response = await deleteProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error).toBe("Forbidden");
    });

    it("deletes project successfully", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
        (deleteProject as any).mockResolvedValue(true);

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1", { method: "DELETE" });
        const response = await deleteProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
    });

    it("returns 500 on delete error", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
        (deleteProject as any).mockRejectedValue(new Error("DB error"));

        const request = new NextRequest("http://localhost:3000/api/projects/proj-1", { method: "DELETE" });
        const response = await deleteProjectRoute(request, { params: Promise.resolve({ id: "proj-1" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Internal server error");
    });
});
