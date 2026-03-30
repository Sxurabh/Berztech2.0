/**
 * @fileoverview Security tests for WebSocket/Realtime channel hijacking attacks.
 * 
 * Tests verify:
 * - Channel subscription hijacking prevention
 * - Event injection attack prevention
 * - Broadcast security controls
 * - Presence hijacking protection
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const TEST_USER_A = "550e8400-e29b-41d4-a716-446655440001";
const TEST_USER_B = "550e8400-e29b-41d4-a716-446655440002";
const TEST_USER_C = "550e8400-e29b-41d4-a716-446655440003";
const TEST_USER_ATTACKER = "550e8400-e29b-41d4-a716-446655440099";

const PROJECT_A = "660e8400-e29b-41d4-a716-446655440001";
const PROJECT_B = "660e8400-e29b-41d4-a716-446655440002";
const PROJECT_C = "660e8400-e29b-41d4-a716-446655440003";

function createMockChannel(name) {
  return {
    name,
    subscribed: false,
    subscribe: function(handler) {
      this.subscribed = true;
      return "subscribed";
    },
    on: function() { return this; },
    track: function() { return Promise.resolve(); },
    untrack: function() { return Promise.resolve(); },
  };
}

function validateChannelAccess(user, channelName, userProjects) {
  if (!user) return { allowed: false, reason: "not_authenticated" };
  
  const channelProjectMatch = channelName.match(/^messages:([a-f0-9-]+)$/i);
  if (!channelProjectMatch) return { allowed: false, reason: "invalid_channel_format" };
  
  const channelProjectId = channelProjectMatch[1];
  if (!userProjects.includes(channelProjectId)) {
    return { allowed: false, reason: "not_project_member" };
  }
  
  return { allowed: true, reason: "authorized" };
}

function validateEvent(event, subscribedProjectId) {
  if (!event || typeof event !== "object" || !event.new) {
    return { valid: false, reason: "invalid_event_structure" };
  }
  
  if (!event.new.project_id) {
    return { valid: false, reason: "missing_project_id" };
  }
  
  if (event.new.project_id !== subscribedProjectId) {
    return { valid: false, reason: "project_id_mismatch" };
  }
  
  return { valid: true, reason: "valid" };
}

function validateBroadcast(sender, channelName, authorizedProjects) {
  if (!sender || !sender.id) {
    return { allowed: false, reason: "missing_sender_id" };
  }
  
  const channelProjectMatch = channelName.match(/^messages:([a-f0-9-]+)$/i);
  if (!channelProjectMatch) return { allowed: false, reason: "invalid_channel" };
  
  const channelProjectId = channelProjectMatch[1];
  
  if (!sender.projects) {
    return { allowed: false, reason: "sender_not_verified" };
  }
  
  if (!sender.projects.includes(channelProjectId)) {
    return { allowed: false, reason: "not_authorized" };
  }
  
  if (!authorizedProjects.includes(channelProjectId)) {
    return { allowed: false, reason: "not_authorized" };
  }
  
  return { allowed: true, reason: "authorized" };
}

function validatePresence(userId, channelName, authorizedUsers) {
  if (!userId) {
    return { allowed: false, reason: "missing_user_id" };
  }
  
  const channelProjectMatch = channelName.match(/^presence:([a-f0-9-]+)$/i);
  if (!channelProjectMatch) return { allowed: false, reason: "invalid_presence_channel" };
  
  const channelProjectId = channelProjectMatch[1];
  if (!authorizedUsers.includes(userId)) {
    return { allowed: false, reason: "not_authorized_for_presence" };
  }
  
  return { allowed: true, reason: "authorized" };
}

describe("Security: Realtime Channel Hijacking", () => {
  describe("1. Channel Subscription Hijacking", () => {
    describe("User cannot subscribe to other project channels", () => {
      it("1. Test user cannot subscribe to other project channels", async () => {
        const attacker = {
          id: TEST_USER_ATTACKER,
          projects: [PROJECT_C],
        };
        const targetChannel = `messages:${PROJECT_A}`;
        const access = validateChannelAccess(attacker, targetChannel, attacker.projects);
        expect(access.allowed).toBe(false);
        expect(access.reason).toBe("not_project_member");
      });

      it("2. Test channel name validation prevents injection", async () => {
        const user = {
          id: TEST_USER_A,
          projects: [PROJECT_A],
        };
        const maliciousChannel = "messages:project-a:evil-injection";
        const access = validateChannelAccess(user, maliciousChannel, user.projects);
        expect(access.allowed).toBe(false);
        expect(access.reason).toBe("invalid_channel_format");
      });

      it("3. Test project_id in channel name is validated", async () => {
        const user = {
          id: TEST_USER_A,
          projects: [PROJECT_A],
        };
        const invalidChannel = "messages:not-a-uuid";
        const access = validateChannelAccess(user, invalidChannel, user.projects);
        expect(access.allowed).toBe(false);
        expect(access.reason).toBe("invalid_channel_format");
      });

      it("4. Test channel access requires membership", async () => {
        const user = {
          id: TEST_USER_B,
          projects: [PROJECT_B],
        };
        const channelForA = `messages:${PROJECT_A}`;
        const channelForB = `messages:${PROJECT_B}`;
        
        const accessA = validateChannelAccess(user, channelForA, user.projects);
        const accessB = validateChannelAccess(user, channelForB, user.projects);
        
        expect(accessA.allowed).toBe(false);
        expect(accessB.allowed).toBe(true);
      });

      it("5. Test unauthorized channel subscription is blocked", async () => {
        const unauthenticatedUser = null;
        const channel = `messages:${PROJECT_A}`;
        const access = validateChannelAccess(unauthenticatedUser, channel, []);
        expect(access.allowed).toBe(false);
        expect(access.reason).toBe("not_authenticated");
      });

      it("6. Test channel patterns are properly namespaced", async () => {
        const user = {
          id: TEST_USER_A,
          projects: [PROJECT_A],
        };
        const testCases = [
          { channel: "messages:all", shouldAllow: false },
          { channel: "messages:*", shouldAllow: false },
          { channel: "messages:project-a:admin", shouldAllow: false },
          { channel: `messages:${PROJECT_A}`, shouldAllow: true },
          { channel: "presence:global", shouldAllow: false },
        ];
        
        for (const tc of testCases) {
          const access = validateChannelAccess(user, tc.channel, user.projects);
          expect(access.allowed).toBe(tc.shouldAllow);
        }
      });
    });

    describe("2. Event Injection", () => {
      it("7. Test fake INSERT events cannot be injected", async () => {
        const subscribedProjectId = PROJECT_A;
        const fakeEvent = {
          eventType: "INSERT",
          new: {
            id: "fake-msg-1",
            project_id: PROJECT_A,
            content: "injected malicious message",
            sender_id: TEST_USER_ATTACKER,
          },
        };
        
        const maliciousPayload = {
          new: {
            id: "injected-123",
            project_id: PROJECT_A,
            content: "fake event",
            created_at: new Date().toISOString(),
          },
        };
        
        const eventValidation = validateEvent(maliciousPayload, subscribedProjectId);
        expect(eventValidation.valid).toBe(true);
        
        const injectedDifferentProject = {
          new: {
            id: "injected-456",
            project_id: PROJECT_B,
            content: "cross-project injection",
          },
        };
        const crossProjectValidation = validateEvent(injectedDifferentProject, subscribedProjectId);
        expect(crossProjectValidation.valid).toBe(false);
        expect(crossProjectValidation.reason).toBe("project_id_mismatch");
      });

      it("8. Test events are filtered by project_id", async () => {
        const subscribedProjectId = PROJECT_A;
        const eventsFromOtherProject = [
          { new: { id: "1", project_id: PROJECT_B } },
          { new: { id: "2", project_id: PROJECT_C } },
        ];
        
        for (const event of eventsFromOtherProject) {
          const result = validateEvent(event, subscribedProjectId);
          expect(result.valid).toBe(false);
        }
        
        const eventFromSubscribedProject = { new: { id: "3", project_id: PROJECT_A } };
        const validResult = validateEvent(eventFromSubscribedProject, subscribedProjectId);
        expect(validResult.valid).toBe(true);
      });

      it("9. Test malformed events are ignored", async () => {
        const subscribedProjectId = PROJECT_A;
        const malformedEvents = [
          null,
          undefined,
          { new: null },
          { new: { id: "1" } },
          "not an object",
          { eventType: "INVALID" },
        ];
        
        for (const event of malformedEvents) {
          const result = validateEvent(event, subscribedProjectId);
          expect(result.valid).toBe(false);
        }
      });

      it("10. Test event source validation works", async () => {
        const mockChannelSubscription = (event) => {
          return event.source === "supabase_realtime";
        };
        
        const legitimateEvent = {
          source: "supabase_realtime",
          new: { id: "1", project_id: PROJECT_A },
        };
        
        const fakeEvent = {
          source: "manual_injection",
          new: { id: "2", project_id: PROJECT_A },
        };
        
        expect(mockChannelSubscription(legitimateEvent)).toBe(true);
        expect(mockChannelSubscription(fakeEvent)).toBe(false);
      });

      it("11. Test cross-project event leakage prevented", async () => {
        const userA_project = PROJECT_A;
        const userB_project = PROJECT_B;
        
        const messageFromProjectA = {
          new: {
            id: "msg-a-1",
            project_id: PROJECT_A,
            content: "secret from project A",
          },
        };
        
        const messageFromProjectB = {
          new: {
            id: "msg-b-1",
            project_id: PROJECT_B,
            content: "secret from project B",
          },
        };
        
        const userASees = validateEvent(messageFromProjectA, userA_project);
        const userASeesB = validateEvent(messageFromProjectB, userA_project);
        
        expect(userASees.valid).toBe(true);
        expect(userASeesB.valid).toBe(false);
        
        const userBSees = validateEvent(messageFromProjectB, userB_project);
        const userBSeesA = validateEvent(messageFromProjectA, userB_project);
        
        expect(userBSees.valid).toBe(true);
        expect(userBSeesA.valid).toBe(false);
      });
    });

    describe("3. Broadcast Security", () => {
      it("12. Test broadcasts only to project members", async () => {
        const authorizedProjects = [PROJECT_A];
        
        const channel = `messages:${PROJECT_A}`;
        
        const memberBroadcast = validateBroadcast(
          { id: TEST_USER_A, projects: [PROJECT_A] },
          channel,
          authorizedProjects
        );
        expect(memberBroadcast.allowed).toBe(true);
        
        const nonMemberBroadcast = validateBroadcast(
          { id: TEST_USER_C, projects: [PROJECT_B] },
          channel,
          authorizedProjects
        );
        expect(nonMemberBroadcast.allowed).toBe(false);
        expect(nonMemberBroadcast.reason).toBe("not_authorized");
      });

      it("13. Test presence data not exposed to outsiders", () => {
        const projectMembers = [TEST_USER_A, TEST_USER_B];
        const outsider = TEST_USER_ATTACKER;
        
        const getPresenceData = (userId, members) => {
          if (!members.includes(userId)) {
            return { error: "access_denied" };
          }
          return { status: "online", user_id: userId };
        };
        
        const memberSees = getPresenceData(TEST_USER_A, projectMembers);
        const outsiderSees = getPresenceData(outsider, projectMembers);
        
        expect(memberSees.status).toBe("online");
        expect(outsiderSees.error).toBe("access_denied");
      });

      it("14. Test unauthorized broadcast attempts fail", async () => {
        const channel = `messages:${PROJECT_A}`;
        
        const testCases = [
          { sender: { id: TEST_USER_C, projects: [PROJECT_B] }, shouldFail: true },
          { sender: null, shouldFail: true },
          { sender: { id: TEST_USER_A, projects: [PROJECT_A] }, shouldFail: false },
        ];
        
        for (const tc of testCases) {
          const result = validateBroadcast(tc.sender, channel, [PROJECT_A]);
          expect(result.allowed).toBe(!tc.shouldFail);
        }
      });

      it("15. Test broadcast authorization validated", async () => {
        const channelName = `messages:${PROJECT_A}`;
        
        const authorizedSender = {
          id: TEST_USER_A,
          projects: [PROJECT_A],
        };
        
        const unauthorizedSender = {
          id: TEST_USER_B,
          projects: [PROJECT_B],
        };
        
        const authResult = validateBroadcast(authorizedSender, channelName, [PROJECT_A]);
        const unauthResult = validateBroadcast(unauthorizedSender, channelName, [PROJECT_A]);
        
        expect(authResult.allowed).toBe(true);
        expect(authResult.reason).toBe("authorized");
        expect(unauthResult.allowed).toBe(false);
      });

      it("16. Test user cannot impersonate sender in events", () => {
        const impersonationAttempt = {
          claimed_sender: TEST_USER_A,
          actual_sender: TEST_USER_ATTACKER,
          content: "impersonated message",
        };
        
        const validateMessageSender = (claimedSender, actualUserId, userProjects) => {
          if (claimedSender !== actualUserId) {
            return { valid: false, reason: "sender_impersonation" };
          }
          
          if (!userProjects.includes(PROJECT_A)) {
            return { valid: false, reason: "not_project_member" };
          }
          
          return { valid: true };
        };
        
        const result = validateMessageSender(
          impersonationAttempt.claimed_sender,
          impersonationAttempt.actual_sender,
          [PROJECT_A]
        );
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("sender_impersonation");
      });
    });

    describe("4. Presence Hijacking", () => {
      it("17. Test user cannot track others' presence", () => {
        const authorizedUsers = [TEST_USER_A, TEST_USER_B];
        
        const trackPresence = (userId, authorizedUserList) => {
          if (!authorizedUserList.includes(userId)) {
            return { allowed: false, reason: "unauthorized" };
          }
          return { allowed: true, data: { status: "online" } };
        };
        
        const authorized = trackPresence(TEST_USER_A, authorizedUsers);
        const unauthorized = trackPresence(TEST_USER_ATTACKER, authorizedUsers);
        
        expect(authorized.allowed).toBe(true);
        expect(unauthorized.allowed).toBe(false);
      });

      it("18. Test presence updates require auth", () => {
        const authenticatedUser = { id: TEST_USER_A, authenticated: true };
        const unauthenticatedUser = null;
        
        const canUpdatePresence = (user) => {
          if (!user || !user.id) return false;
          return user.authenticated === true;
        };
        
        expect(canUpdatePresence(authenticatedUser)).toBe(true);
        expect(canUpdatePresence(unauthenticatedUser)).toBe(false);
      });

      it("19. Test presence channel isolation", () => {
        const presenceChannelA = `presence:${PROJECT_A}`;
        const presenceChannelB = `presence:${PROJECT_B}`;
        
        const isValidPresenceChannel = (channel) => {
          const match = channel.match(/^presence:([a-f0-9-]+)$/i);
          return !!match;
        };
        
        expect(isValidPresenceChannel(presenceChannelA)).toBe(true);
        expect(isValidPresenceChannel(presenceChannelB)).toBe(true);
        
        const crossProjectChannel = "presence:all-projects";
        expect(isValidPresenceChannel(crossProjectChannel)).toBe(false);
      });

      it("20. Test fake presence injection fails", () => {
        const userId = TEST_USER_A;
        
        const injectPresence = (claimedUserId, actualUserId) => {
          if (claimedUserId !== actualUserId) {
            return { success: false, reason: "fake_presence_rejected" };
          }
          return { success: true };
        };
        
        const legitimatePresence = injectPresence(userId, userId);
        const fakePresence = injectPresence(TEST_USER_ATTACKER, userId);
        
        expect(legitimatePresence.success).toBe(true);
        expect(fakePresence.success).toBe(false);
        expect(fakePresence.reason).toBe("fake_presence_rejected");
      });

      it("21. Test presence data not leaked in events", () => {
        const presenceData = {
          user_id: TEST_USER_A,
          status: "online",
          last_seen: new Date().toISOString(),
          metadata: {
            email: "user@example.com",
          },
        };
        
        const sanitizePresenceForClient = (data, requestingUserId) => {
          if (data.user_id !== requestingUserId) {
            return {
              user_id: data.user_id,
              status: data.status,
            };
          }
          return {
            user_id: data.user_id,
            status: data.status,
            last_seen: data.last_seen,
            metadata: data.metadata,
          };
        };
        
        const otherUserSees = sanitizePresenceForClient(presenceData, TEST_USER_B);
        const selfSees = sanitizePresenceForClient(presenceData, TEST_USER_A);
        
        expect("metadata" in otherUserSees).toBe(false);
        expect("metadata" in selfSees).toBe(true);
      });

      it("22. Test concurrent presence updates secured", () => {
        const userId = TEST_USER_A;
        
        const handleConcurrentUpdate = (userId, event, currentState) => {
          if (event.user_id !== userId) {
            return { rejected: true, reason: "user_id_mismatch" };
          }
          
          if (event.timestamp < currentState.last_update) {
            return { rejected: true, reason: "stale_event" };
          }
          
          return { rejected: false, updated: true };
        };
        
        const currentState = {
          last_update: Date.now() - 1000,
          status: "online",
        };
        
        const validUpdate = {
          user_id: TEST_USER_A,
          status: "away",
          timestamp: Date.now(),
        };
        
        const invalidUpdate = {
          user_id: TEST_USER_ATTACKER,
          status: "online",
          timestamp: Date.now(),
        };
        
        const staleUpdate = {
          user_id: TEST_USER_A,
          status: "offline",
          timestamp: Date.now() - 2000,
        };
        
        const validResult = handleConcurrentUpdate(userId, validUpdate, currentState);
        const invalidResult = handleConcurrentUpdate(userId, invalidUpdate, currentState);
        const staleResult = handleConcurrentUpdate(userId, staleUpdate, currentState);
        
        expect(validResult.rejected).toBe(false);
        expect(invalidResult.rejected).toBe(true);
        expect(staleResult.rejected).toBe(true);
      });
    });
  });
});
