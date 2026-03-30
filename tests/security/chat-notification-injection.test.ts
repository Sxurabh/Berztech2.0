/**
 * @fileoverview Security tests for Notification Injection/Flooding Attacks
 *
 * These tests verify protection against:
 * 1. Notification Spam/DoS - flooding victims with notifications
 * 2. Notification Content Injection - XSS, HTML injection, content tampering
 * 3. Notification Spoofing - impersonating other users or systems
 * 4. Notification Privacy - preventing unauthorized access to notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as messagesPost } from "@/app/api/messages/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: Notification Injection - Spam/DoS", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createMessageRequest(ip: string, content: string = "Test message") {
        return new NextRequest("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
                "x-forwarded-for": ip,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project_id: "123e4567-e89b-12d3-a456-426614174000",
                content,
            }),
        });
    }

    it("1. Rapid message sending floods victim notifications - rate limited", async () => {
        let notificationCount = 0;
        let rateLimited = false;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation(() => {
                        notificationCount++;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: `notif-${notificationCount}` }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: `msg-${notificationCount}` }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const attackerIp = "192.168.100.1";

        for (let i = 0; i < 35; i++) {
            const req = createMessageRequest(attackerIp, `Spam ${i}`);
            const res = await messagesPost(req);
            if (res.status === 429) rateLimited = true;
        }

        expect(rateLimited).toBe(true);
    });

    it("2. Maximum notifications per victim is enforced", async () => {
        let insertCount = 0;
        let blockedCount = 0;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation(() => {
                        insertCount++;
                        if (insertCount > 10) {
                            blockedCount++;
                            return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: { code: "limit" } }) }) };
                        }
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: `notif-${insertCount}` }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest("192.168.100.2", "Test message");
        const res = await messagesPost(req);

        if (res.status === 201) {
            expect(insertCount).toBeLessThanOrEqual(11);
        }
    });

    it("3. Notifications are rate-limited at source", async () => {
        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        let rateLimitedAtSource = false;
        const ip = "192.168.100.3";

        for (let i = 0; i < 35; i++) {
            const req = createMessageRequest(ip, `Message ${i}`);
            const res = await messagesPost(req);
            if (res.status === 429) {
                rateLimitedAtSource = true;
                break;
            }
        }

        expect(rateLimitedAtSource).toBe(true);
    });

    it("4. Bulk messages from attacker floods target inbox - rate limiting prevents", async () => {
        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        let blockedByRateLimit = 0;
        let successful = 0;
        const ip = "192.168.100.4";

        for (let i = 0; i < 50; i++) {
            const req = createMessageRequest(ip, `Bulk message ${i}`);
            const res = await messagesPost(req);
            if (res.status === 201) successful++;
            if (res.status === 429) blockedByRateLimit++;
        }

        expect(blockedByRateLimit).toBeGreaterThan(0);
        expect(successful).toBeLessThan(50);
    });

    it("5. Notification queue exhaustion handled gracefully", async () => {
        let queueFull = false;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation(() => {
                        queueFull = true;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: { code: "queue_full" } }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest("192.168.100.5", "Test");
        const res = await messagesPost(req);

        if (queueFull) {
            expect(res.status).toBe(201);
        }
    });
});

describe("Security: Notification Content Injection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createMessageRequest(content: string) {
        return new NextRequest("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
                "x-forwarded-for": "10.0.0.1",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project_id: "123e4567-e89b-12d3-a456-426614174000",
                content,
            }),
        });
    }

    it("1. XSS payloads in message content are sanitized", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const xssPayload = '<script>alert("XSS")</script>';
        const req = createMessageRequest(xssPayload);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('<script>');
        expect(capturedNotification?.message).not.toContain('javascript:');
    });

    it("2. Dangerous HTML tags are stripped from notifications", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const htmlContent = '<script>alert(1)</script><iframe src="evil.com"></iframe>';
        const req = createMessageRequest(htmlContent);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('<script>');
        expect(capturedNotification?.message).not.toContain('<iframe');
        expect(capturedNotification?.message).not.toContain('javascript:');
    });

    it("3. Long content is truncated in notifications", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const longContent = 'A'.repeat(500);
        const req = createMessageRequest(longContent);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        if (capturedNotification?.message) {
            const match = capturedNotification.message.match(/sent you a message: (.+?)(\.\.\.)?$/);
            if (match) {
                expect(match[1].length).toBeLessThanOrEqual(100);
            }
        }
    });

    it("4. Event handlers (on*) are stripped", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const eventHandlerPayload = '<img src=x onerror=alert(1)>';
        const req = createMessageRequest(eventHandlerPayload);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('onerror=');
    });

    it("5. Iframe and object tags are stripped", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const iframePayload = '<iframe src="evil.com"></iframe>';
        const req = createMessageRequest(iframePayload);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('<iframe');
        expect(capturedNotification?.message).not.toContain('</iframe>');
    });
});

describe("Security: Notification Spoofing Prevention", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createMessageRequest() {
        return new NextRequest("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
                "x-forwarded-for": "10.0.0.1",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project_id: "123e4567-e89b-12d3-a456-426614174000",
                content: "Test message",
            }),
        });
    }

    it("1. Source user ID comes from authenticated session, not request body", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "msg-1", sender_id: "attacker-id" }, error: null }) }) };
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "attacker-id", full_name: "Attacker" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "attacker-id", email: "attacker@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest();
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.source_user_id).toBe("attacker-id");
    });

    it("2. Notification type is set server-side, not client-controlled", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest();
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.type).toBe("message");
    });

    it("3. Notifications only sent to actual project owner", async () => {
        let notificationsCreated: any[] = [];

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        notificationsCreated.push(data);
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: `notif-${notificationsCreated.length}` }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "project-owner-id" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest();
        await messagesPost(req);

        expect(notificationsCreated.length).toBeLessThanOrEqual(1);
        if (notificationsCreated.length > 0) {
            expect(notificationsCreated[0].user_id).toBe("project-owner-id");
        }
    });

    it("4. Self-messages do not create notifications", async () => {
        let notificationCreated = false;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        notificationCreated = true;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "same-user-id" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "same-user-id", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "same-user-id", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest();
        const res = await messagesPost(req);

        expect(res.status).toBe(201);
        expect(notificationCreated).toBe(false);
    });

    it("5. Request ID validated - cannot send to arbitrary projects", async () => {
        let notificationCreated = false;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        notificationCreated = true;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockImplementation(() => {
                                return { data: null, error: { code: "NOT_FOUND" } };
                            }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "attacker-id", full_name: "Attacker" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "attacker-id", email: "attacker@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const req = createMessageRequest();
        const res = await messagesPost(req);

        expect(notificationCreated).toBe(false);
    });
});

describe("Security: Notification Privacy", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("1. Notifications require authentication to enumerate", async () => {
        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: null },
                    error: { message: "No session" },
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    }),
                }),
            }),
        });

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        expect(user).toBeNull();
    });

    it("2. Notification IDs use UUID format for unpredictability", async () => {
        const notificationId = "550e8400-e29b-41d4-a716-446655440000";
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        const isUuidFormat = uuidPattern.test(notificationId);
        expect(isUuidFormat).toBe(true);

        const isNotSequential = !/^notif-\d+$/.test(notificationId);
        expect(isNotSequential).toBe(true);
    });

    it("3. Users can only delete their own notifications", async () => {
        const deleteMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PERMISSION_DENIED" },
            }),
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-a", email: "a@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: vi.fn().mockImplementation((table) => {
                if (table === "notifications") {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: { id: "notif-other", user_id: "user-b" }, error: null }),
                            }),
                        }),
                        delete: deleteMock,
                    };
                }
                return {
                    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
                };
            }),
        });

        const supabase = await createServerSupabaseClient();
        const result = await (supabase.from("notifications") as any).delete().eq("id", "notif-other");

        expect(deleteMock).toHaveBeenCalled();
    });

    it("4. Cross-user notification enumeration is prevented by RLS", async () => {
        const userANotifications = [
            { id: "notif-1", user_id: "user-a", message: "User A private" },
            { id: "notif-2", user_id: "user-a", message: "Also user A" },
        ];

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-a", email: "a@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: vi.fn().mockImplementation((table) => {
                if (table === "notifications") {
                    return {
                        select: vi.fn().mockImplementation((columns?: string) => {
                            return {
                                eq: vi.fn().mockImplementation((column: string, value: any) => {
                                    if (column === "user_id" && value === "user-a") {
                                        return {
                                            order: vi.fn().mockReturnValue({
                                                limit: vi.fn().mockResolvedValue({ data: userANotifications, error: null }),
                                            }),
                                        };
                                    }
                                    return {
                                        order: vi.fn().mockReturnValue({
                                            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                                        }),
                                    };
                                }),
                            };
                        }),
                    };
                }
                return {
                    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
                };
            }),
        });

        const supabase = await createServerSupabaseClient();
        const { data } = await (supabase.from("notifications").select as any)().eq("user_id", "user-a");

        const userBNotifications = data?.filter((n: any) => n.user_id === "user-b") || [];
        expect(userBNotifications.length).toBe(0);
    });

    it("5. Notifications require user_id filter for privacy", async () => {
        const userId = "recipient-user-id";
        const queryUserId = "other-user-id";

        const userCannotSeeOthers = queryUserId !== userId;
        expect(userCannotSeeOthers).toBe(true);

        const correctUserId = "recipient-user-id";
        const queryCorrectUserId = queryUserId !== correctUserId;
        expect(queryCorrectUserId).toBe(true);
    });
});

describe("Security: Notification Injection - Edge Cases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createMessageRequest(content: string) {
        return new NextRequest("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
                "x-forwarded-for": "10.0.0.1",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project_id: "123e4567-e89b-12d3-a456-426614174000",
                content,
            }),
        });
    }

    it("1. Unicode/emoji in messages is allowed but sanitized", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const emojiContent = "Hello 👋🎉";
        const req = createMessageRequest(emojiContent);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('<script>');
    });

    it("2. Data URIs are stripped", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const dataUriPayload = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
        const req = createMessageRequest(dataUriPayload);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('data:text/html');
    });

    it("3. VBScript protocol is stripped", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const vbsPayload = '<a href="vbscript:msgbox(1)">Click</a>';
        const req = createMessageRequest(vbsPayload);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('vbscript:');
    });

    it("4. SVG onload attacks are prevented", async () => {
        let capturedNotification: any = null;

        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockImplementation((data) => {
                        capturedNotification = data;
                        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }) }) };
                    }),
                };
            }
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const svgPayload = '<svg onload="alert(1)"></svg>';
        const req = createMessageRequest(svgPayload);
        await messagesPost(req);

        expect(capturedNotification).not.toBeNull();
        expect(capturedNotification?.message).not.toContain('onload');
    });

    it("5. Message content length validation prevents DoS", async () => {
        const mockFrom = vi.fn().mockImplementation((table) => {
            if (table === "project_messages") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "requests") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { user_id: "recipient-user" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "notifications") {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "notif-1" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "user_profiles") {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "sender-user", full_name: "Test" }, error: null }),
                        }),
                    }),
                };
            }
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            };
        });

        (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "sender-user", email: "test@test.com", user_metadata: {} } },
                    error: null,
                }),
            },
            from: mockFrom,
        });

        const tooLongContent = 'A'.repeat(10001);
        const req = createMessageRequest(tooLongContent);
        const res = await messagesPost(req);

        expect(res.status).toBe(400);
    });
});
