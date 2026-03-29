/**
 * @fileoverview Test utilities for chat integration tests
 *
 * Provides helper functions to create and cleanup test data
 * using the Supabase admin client for direct database access.
 */

import { createAdminClient } from "@/lib/supabase/admin";

let adminClient = null;

function getAdminClient() {
    if (!adminClient) {
        adminClient = createAdminClient();
    }
    return adminClient;
}

function isSupabaseConfigured() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(supabaseUrl && supabaseKey);
}

export async function createTestUser(userData = {}) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, skipping user creation");
        return null;
    }

    const supabase = getAdminClient();
    if (!supabase) {
        console.warn("Admin client unavailable, skipping user creation");
        return null;
    }

    const email = userData.email || `test-${Date.now()}@example.com`;
    const password = userData.password || "testpassword123";

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: userData.metadata || { full_name: "Test User" },
        });

        if (error) {
            console.warn("Failed to create test user:", error.message);
            return null;
        }

        await supabase
            .from("profiles")
            .update({ 
                full_name: userData.metadata?.full_name || "Test User",
                is_admin: userData.isAdmin || false
            })
            .eq("id", data.user.id);

        return {
            id: data.user.id,
            email: data.user.email,
            ...data.user,
        };
    } catch (err) {
        console.warn("Error creating test user:", err.message);
        return null;
    }
}

export async function createTestProject(creatorId, projectData = {}) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, skipping project creation");
        return null;
    }

    const supabase = getAdminClient();
    if (!supabase) {
        console.warn("Admin client unavailable, skipping project creation");
        return null;
    }

    const name = projectData.name || `Test Project ${Date.now()}`;
    const description = projectData.description || "Test project description";

    try {
        const { data, error } = await supabase
            .from("projects")
            .insert({
                name,
                description,
                created_by: creatorId,
                status: projectData.status || "active",
                client_email: projectData.clientEmail || "test@example.com",
            })
            .select()
            .single();

        if (error) {
            console.warn("Failed to create test project:", error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn("Error creating test project:", err.message);
        return null;
    }
}

export async function createTestMessage(senderId, projectId, messageData = {}) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, skipping message creation");
        return null;
    }

    const supabase = getAdminClient();
    if (!supabase) {
        console.warn("Admin client unavailable, skipping message creation");
        return null;
    }

    const content = messageData.content || `Test message ${Date.now()}`;

    try {
        const { data, error } = await supabase
            .from("project_messages")
            .insert({
                project_id: projectId,
                sender_id: senderId,
                sender_name: messageData.sender_name || "Test Sender",
                sender_email: messageData.sender_email || "sender@example.com",
                content,
                task_id: messageData.task_id || null,
                attachment_url: messageData.attachment_url || null,
                attachment_type: messageData.attachment_type || null,
                attachment_name: messageData.attachment_name || null,
            })
            .select()
            .single();

        if (error) {
            console.warn("Failed to create test message:", error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn("Error creating test message:", err.message);
        return null;
    }
}

export async function createTestReadReceipt(messageId, userId, userEmail) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, skipping read receipt creation");
        return null;
    }

    const supabase = getAdminClient();
    if (!supabase) {
        console.warn("Admin client unavailable, skipping read receipt creation");
        return null;
    }

    try {
        const { data, error } = await supabase
            .from("message_reads")
            .upsert({
                message_id: messageId,
                user_id: userId,
                user_email: userEmail,
                read_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.warn("Failed to create test read receipt:", error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn("Error creating test read receipt:", err.message);
        return null;
    }
}

export async function getMessagesByProject(projectId) {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const supabase = getAdminClient();
    if (!supabase) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from("project_messages")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: true });

        if (error) {
            console.warn("Failed to get messages:", error.message);
            return [];
        }

        return data || [];
    } catch (err) {
        console.warn("Error getting messages:", err.message);
        return [];
    }
}

export async function getReadReceipts(messageId) {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const supabase = getAdminClient();
    if (!supabase) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from("message_reads")
            .select("*")
            .eq("message_id", messageId);

        if (error) {
            console.warn("Failed to get read receipts:", error.message);
            return [];
        }

        return data || [];
    } catch (err) {
        console.warn("Error getting read receipts:", err.message);
        return [];
    }
}

export async function cleanupTestData(userId = null, projectId = null, messageIds = []) {
    if (!isSupabaseConfigured()) {
        return;
    }

    const supabase = getAdminClient();
    if (!supabase) {
        return;
    }

    try {
        if (messageIds.length > 0) {
            await supabase
                .from("message_reads")
                .delete()
                .in("message_id", messageIds);
            
            await supabase
                .from("project_messages")
                .delete()
                .in("id", messageIds);
        }

        if (projectId) {
            const { data: messages } = await supabase
                .from("project_messages")
                .select("id")
                .eq("project_id", projectId);
            
            if (messages?.length > 0) {
                const ids = messages.map(m => m.id);
                await supabase
                    .from("message_reads")
                    .delete()
                    .in("message_id", ids);
                
                await supabase
                    .from("project_messages")
                    .delete()
                    .in("id", ids);
            }

            await supabase
                .from("projects")
                .delete()
                .eq("id", projectId);
        }

        if (userId) {
            await supabase.auth.admin.deleteUser(userId);
        }
    } catch (err) {
        console.warn("Error cleaning up test data:", err.message);
    }
}

export function skipIfNoSupabase() {
    if (!isSupabaseConfigured()) {
        return true;
    }
    const supabase = getAdminClient();
    if (!supabase) {
        return true;
    }
    return false;
}

export { isSupabaseConfigured };
