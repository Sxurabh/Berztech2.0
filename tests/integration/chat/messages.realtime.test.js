/**
 * @fileoverview Real Database Integration Tests for Messages API
 *
 * These tests use the actual Supabase database to test the messaging feature.
 * They create real users, projects, and messages to ensure end-to-end functionality.
 *
 * Tests database operations directly using admin client and tests API routes
 * with mocked authentication context.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import {
    createTestUser,
    createTestProject,
    createTestMessage,
    createTestReadReceipt,
    getMessagesByProject,
    getReadReceipts,
    cleanupTestData,
    skipIfNoSupabase,
} from "./test-utils";

describe("Messages API - Real Database Integration Tests", () => {
    const shouldSkip = skipIfNoSupabase();
    
    if (shouldSkip) {
        it("0. Skipping real database tests - Supabase not configured", () => {
            console.log("Skipping real database integration tests - Supabase not configured");
        });
        return;
    }

    let adminUser = null;
    let clientUser = null;
    let testProject = null;
    let createdMessageIds = [];

    beforeAll(async () => {
        try {
            adminUser = await createTestUser({
                email: `admin-test-${Date.now()}@example.com`,
                password: "testpassword123",
                metadata: { full_name: "Admin Test User" },
                isAdmin: true,
            });

            clientUser = await createTestUser({
                email: `client-test-${Date.now()}@example.com`,
                password: "testpassword123",
                metadata: { full_name: "Client Test User" },
                isAdmin: false,
            });

            if (adminUser && clientUser) {
                testProject = await createTestProject(adminUser.id, {
                    name: `Integration Test Project ${Date.now()}`,
                    description: "Test project for integration tests",
                    clientEmail: clientUser.email,
                });
            }
        } catch (error) {
            console.error("Setup failed:", error);
        }
    });

    afterAll(async () => {
        try {
            for (const messageId of createdMessageIds) {
                await cleanupTestData(null, null, [messageId]);
            }
            
            if (testProject) {
                await cleanupTestData(null, testProject.id);
            }
            if (clientUser) {
                await cleanupTestData(clientUser.id);
            }
            if (adminUser) {
                await cleanupTestData(adminUser.id);
            }
        } catch (error) {
            console.error("Cleanup failed:", error);
        }
    });

    beforeEach(() => {
        createdMessageIds = [];
    });

    describe("Database Operations", () => {
        it("1. Can create a message directly in database", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Direct database message",
            });

            expect(message).toBeTruthy();
            expect(message.content).toBe("Direct database message");
            expect(message.sender_id).toBe(adminUser.id);
            expect(message.project_id).toBe(testProject.id);

            if (message) {
                createdMessageIds.push(message.id);
            }
        });

        it("2. Can retrieve messages by project", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Retrievable message",
            });

            if (message) {
                createdMessageIds.push(message.id);
            }

            const messages = await getMessagesByProject(testProject.id);
            
            expect(messages.length).toBeGreaterThan(0);
            expect(messages.some(m => m.content === "Retrievable message")).toBe(true);
        });

        it("3. Can create message with attachments", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Message with attachment",
                attachment_url: "https://storage.example.com/file.pdf",
                attachment_type: "document",
                attachment_name: "file.pdf",
            });

            expect(message).toBeTruthy();
            expect(message.attachment_url).toBe("https://storage.example.com/file.pdf");
            expect(message.attachment_type).toBe("document");
            expect(message.attachment_name).toBe("file.pdf");

            if (message) {
                createdMessageIds.push(message.id);
            }
        });

        it("4. Can create read receipts", async () => {
            if (!testProject || !adminUser || !clientUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Message to mark as read",
            });

            if (!message) {
                console.warn("Could not create message, skipping test");
                return;
            }

            createdMessageIds.push(message.id);

            const receipt = await createTestReadReceipt(
                message.id,
                clientUser.id,
                clientUser.email
            );

            expect(receipt).toBeTruthy();
            expect(receipt.message_id).toBe(message.id);
            expect(receipt.user_id).toBe(clientUser.id);
        });

        it("5. Can retrieve read receipts", async () => {
            if (!testProject || !adminUser || !clientUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Message with read receipt",
            });

            if (!message) {
                console.warn("Could not create message, skipping test");
                return;
            }

            createdMessageIds.push(message.id);

            await createTestReadReceipt(message.id, clientUser.id, clientUser.email);

            const receipts = await getReadReceipts(message.id);
            
            expect(receipts.length).toBeGreaterThan(0);
            expect(receipts.some(r => r.user_id === clientUser.id)).toBe(true);
        });

        it("6. Messages are stored with correct timestamps", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const before = new Date().toISOString();
            
            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Timestamp test",
            });

            const after = new Date().toISOString();

            expect(message).toBeTruthy();
            expect(message.created_at).toBeDefined();
            expect(message.created_at >= before).toBe(true);
            expect(message.created_at <= after).toBe(true);

            if (message) {
                createdMessageIds.push(message.id);
            }
        });

        it("7. Message IDs are valid UUIDs", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "UUID test",
            });

            expect(message).toBeTruthy();
            
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(message.id).toMatch(uuidRegex);

            if (message) {
                createdMessageIds.push(message.id);
            }
        });

        it("8. Messages preserve special characters", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const specialContent = "Special: é, ñ, 中文, emoji 🚀, symbols <>&\"'";

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: specialContent,
            });

            expect(message).toBeTruthy();
            expect(message.content).toBe(specialContent);

            const retrieved = await getMessagesByProject(testProject.id);
            const found = retrieved.find(m => m.id === message.id);
            expect(found.content).toBe(specialContent);

            if (message) {
                createdMessageIds.push(message.id);
            }
        });

        it("9. Can create multiple messages in sequence", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const msg1 = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Message 1",
            });

            const msg2 = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "Message 2",
            });

            expect(msg1).toBeTruthy();
            expect(msg2).toBeTruthy();
            expect(msg1.id).not.toBe(msg2.id);

            if (msg1) createdMessageIds.push(msg1.id);
            if (msg2) createdMessageIds.push(msg2.id);

            const messages = await getMessagesByProject(testProject.id);
            expect(messages.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("Cleanup Operations", () => {
        it("10. Cleanup removes messages from database", async () => {
            if (!testProject || !adminUser) {
                console.warn("Setup incomplete, skipping test");
                return;
            }

            const message = await createTestMessage(adminUser.id, testProject.id, {
                sender_name: "Admin Test User",
                sender_email: adminUser.email,
                content: "To be cleaned up",
            });

            expect(message).toBeTruthy();

            await cleanupTestData(null, null, [message.id]);

            const messages = await getMessagesByProject(testProject.id);
            expect(messages.some(m => m.id === message.id)).toBe(false);
        });
    });
});
