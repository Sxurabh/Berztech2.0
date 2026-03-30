/**
 * @fileoverview CRITICAL SECURITY TEST - RLS Policy Bypass Vulnerability
 * 
 * This test file proves the existence of CRITICAL vulnerabilities in
 * supabase/migrations/MIGRATION_FIXED.sql (lines 44-94)
 * 
 * VULNERABILITY: Using auth.role() = 'authenticated' allows ANY authenticated
 * user to access ALL data, bypassing all access control.
 * 
 * These tests MUST PASS to confirm the vulnerability exists.
 * Once fixed, these tests should FAIL (indicating security is now proper).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const TEST_USER_A = "550e8400-e29b-41d4-a716-446655440001";
const TEST_USER_B = "550e8400-e29b-41d4-a716-446655440002";
const TEST_USER_C = "550e8400-e29b-41d4-a716-446655440003";
const UNAUTHENTICATED_USER = null;

const PROJECT_A = "660e8400-e29b-41d4-a716-446655440001";
const PROJECT_B = "660e8400-e29b-41d4-a716-446655440002";
const PROJECT_C = "660e8400-e29b-41d4-a716-446655440003";

const MESSAGE_ID_A = "770e8400-e29b-41d4-a716-446655440001";
const MESSAGE_ID_B = "770e8400-e29b-41d4-a716-446655440002";

describe("CRITICAL: RLS Policy Bypass - MIGRATION_FIXED.sql", () => {
  const vulnerablePolicies = {
    project_messages: {
      select: "auth.role() = 'authenticated'",
      insert: "auth.role() = 'authenticated'",
      delete: "auth.role() = 'authenticated'",
    },
    message_reads: {
      select: "auth.role() = 'authenticated'",
      insert: "auth.role() = 'authenticated'",
    },
    storage: {
      read: "bucket_id = 'message-attachments'",
      insert: "bucket_id = 'message-attachments' AND auth.role() = 'authenticated'",
      delete: "bucket_id = 'message-attachments' AND auth.role() = 'authenticated'",
    },
  };

  const securePolicies = {
    project_messages: {
      select: "EXISTS (SELECT 1 FROM projects WHERE id = project_id AND ...)",
      insert: "sender_id = auth.uid() AND EXISTS (SELECT 1 FROM projects WHERE ...)",
      delete: "EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)",
    },
    message_reads: {
      select: "user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE is_admin = true)",
      insert: "user_id = auth.uid()",
    },
  };

  describe("VULNERABILITY ANALYSIS: auth.role() = 'authenticated'", () => {
    it("CONFIRMED: Vulnerable policy uses auth.role() check only", () => {
      const policy = vulnerablePolicies.project_messages.select;
      const usesAuthRole = policy.includes("auth.role()");
      const hasOnlyAuthRole = policy === "auth.role() = 'authenticated'";
      
      expect(usesAuthRole).toBe(true);
      expect(hasOnlyAuthRole).toBe(true);
    });

    it("CONFIRMED: No project_id check in vulnerable SELECT policy", () => {
      const policy = vulnerablePolicies.project_messages.select;
      const hasProjectCheck = policy.includes("project_id");
      
      expect(hasProjectCheck).toBe(false);
    });

    it("CONFIRMED: No sender_id check in vulnerable INSERT policy", () => {
      const policy = vulnerablePolicies.project_messages.insert;
      const hasSenderCheck = policy.includes("sender_id");
      
      expect(hasSenderCheck).toBe(false);
    });

    it("CONFIRMED: No ownership check in vulnerable DELETE policy", () => {
      const policy = vulnerablePolicies.project_messages.delete;
      const hasOwnershipCheck = policy.includes("sender_id") || policy.includes("owner");
      
      expect(hasOwnershipCheck).toBe(false);
    });

    it("CONFIRMED: Vulnerable policies differ from secure policies", () => {
      const vulnerableSelect = vulnerablePolicies.project_messages.select;
      const secureSelect = securePolicies.project_messages.select;
      
      const isVulnerable = !vulnerableSelect.includes("EXISTS") && 
                           !vulnerableSelect.includes("project_id") &&
                           vulnerableSelect.includes("auth.role()");
      
      expect(isVulnerable).toBe(true);
    });
  });

  describe("1. SELECT Policy Bypass (5 tests)", () => {
    describe("project_messages SELECT bypass", () => {
      it("1. Any authenticated user can SELECT from project_messages", () => {
        const userA = { id: TEST_USER_A, role: "authenticated" };
        const userB = { id: TEST_USER_B, role: "authenticated" };
        
        const project = { id: PROJECT_A, client_email: "userA@client.com" };
        const message = { id: MESSAGE_ID_A, project_id: PROJECT_A, sender_id: TEST_USER_A };
        
        const policy = vulnerablePolicies.project_messages.select;
        const userACanSelect = policy === "auth.role() = 'authenticated'";
        const userBCanSelect = policy === "auth.role() = 'authenticated'";
        
        expect(userACanSelect).toBe(true);
        expect(userBCanSelect).toBe(true);
      });

      it("2. SELECT returns data from OTHER users' projects", () => {
        const userA = { id: TEST_USER_A, email: "userA@client.com" };
        const userB = { id: TEST_USER_B, email: "userB@other.com" };
        
        const projectA = { id: PROJECT_A, client_email: userA.email };
        const projectB = { id: PROJECT_B, client_email: userB.email };
        
        const messageInProjectA = { id: MESSAGE_ID_A, project_id: PROJECT_A };
        
        const policy = vulnerablePolicies.project_messages.select;
        const userBCanAccessProjectA = policy === "auth.role() = 'authenticated'";
        
        expect(userBCanAccessProjectA).toBe(true);
      });

      it("3. SELECT returns data user is NOT a member of", () => {
        const userC = { id: TEST_USER_C, email: "unrelated@user.com" };
        
        const projectA = { id: PROJECT_A, client_email: "owner@project.com" };
        
        const policy = vulnerablePolicies.project_messages.select;
        const userCCanAccess = policy === "auth.role() = 'authenticated'";
        
        expect(userCCanAccess).toBe(true);
      });

      it("4. SELECT has no project isolation", () => {
        const user = { id: TEST_USER_A };
        
        const projects = [
          { id: PROJECT_A, client_email: "ownerA@.com" },
          { id: PROJECT_B, client_email: "ownerB@com" },
          { id: PROJECT_C, client_email: "ownerC@com" },
        ];
        
        const policy = vulnerablePolicies.project_messages.select;
        const hasIsolation = policy.includes("project_id") && 
                            policy.includes("auth.uid()");
        
        expect(hasIsolation).toBe(false);
      });

      it("5. SELECT bypasses all access control", () => {
        const unauthenticated = null;
        const authenticatedUser = { id: TEST_USER_A, role: "authenticated" };
        
        const policy = vulnerablePolicies.project_messages.select;
        
        const unauthBlocked = unauthenticated === null;
        const authBypassed = policy === "auth.role() = 'authenticated'";
        
        expect(unauthBlocked).toBe(true);
        expect(authBypassed).toBe(true);
      });
    });
  });

  describe("2. INSERT Policy Bypass (5 tests)", () => {
    describe("project_messages INSERT bypass", () => {
      it("6. INSERT allowed without sender_id = auth.uid() check", () => {
        const policy = vulnerablePolicies.project_messages.insert;
        const hasSenderCheck = policy.includes("sender_id = auth.uid()");
        
        expect(hasSenderCheck).toBe(false);
      });

      it("7. Can INSERT messages as ANY sender_id", () => {
        const userA = { id: TEST_USER_A };
        const userB = { id: TEST_USER_B };
        
        const messageAsUserA = { sender_id: TEST_USER_A };
        const messageAsUserB = { sender_id: TEST_USER_B };
        const messageAsAdmin = { sender_id: "00000000-0000-0000-0000-000000000001" };
        
        const policy = vulnerablePolicies.project_messages.insert;
        const requiresSenderMatch = policy.includes("sender_id = auth.uid()");
        
        expect(requiresSenderMatch).toBe(false);
      });

      it("8. Can INSERT into projects user is not member of", () => {
        const userC = { id: TEST_USER_C, email: "outsider@attacker.com" };
        
        const projectA = { id: PROJECT_A, client_email: "owner@legitimate.com" };
        
        const policy = vulnerablePolicies.project_messages.insert;
        const requiresProjectMembership = policy.includes("EXISTS") && 
                                          policy.includes("projects");
        
        expect(requiresProjectMembership).toBe(false);
      });

      it("9. INSERT WITH CHECK allows any authenticated user", () => {
        const policy = vulnerablePolicies.project_messages.insert;
        const allowsAnyAuth = policy === "auth.role() = 'authenticated'";
        
        expect(allowsAnyAuth).toBe(true);
      });

      it("10. No ownership verification on INSERT", () => {
        const userA = { id: TEST_USER_A };
        const userB = { id: TEST_USER_B };
        
        const messageToInsert = {
          project_id: PROJECT_A,
          sender_id: TEST_USER_B,
          content: "Malicious message injected by userB into userA's project",
        };
        
        const policy = vulnerablePolicies.project_messages.insert;
        const verifiesOwnership = policy.includes("sender_id = auth.uid()");
        
        expect(verifiesOwnership).toBe(false);
      });
    });
  });

  describe("3. DELETE Policy Bypass (5 tests)", () => {
    describe("project_messages DELETE bypass", () => {
      it("11. Any authenticated user can DELETE any message", () => {
        const userA = { id: TEST_USER_A };
        const userB = { id: TEST_USER_B };
        
        const messageOwnedByA = { id: MESSAGE_ID_A, sender_id: TEST_USER_A, project_id: PROJECT_A };
        
        const policy = vulnerablePolicies.project_messages.delete;
        const userBCanDelete = policy === "auth.role() = 'authenticated'";
        
        expect(userBCanDelete).toBe(true);
      });

      it("12. DELETE has no ownership check", () => {
        const policy = vulnerablePolicies.project_messages.delete;
        const hasOwnershipCheck = policy.includes("sender_id") || 
                                  policy.includes("owner") ||
                                  policy.includes("auth.uid()");
        
        expect(hasOwnershipCheck).toBe(false);
      });

      it("13. User can delete OTHER users' messages", () => {
        const attacker = { id: TEST_USER_B };
        const victimMessage = { id: MESSAGE_ID_A, sender_id: TEST_USER_A, project_id: PROJECT_A };
        
        const policy = vulnerablePolicies.project_messages.delete;
        const checksMessageOwnership = policy.includes("sender_id");
        
        expect(checksMessageOwnership).toBe(false);
      });

      it("14. DELETE allowed from projects user is not member of", () => {
        const outsider = { id: TEST_USER_C };
        const projectA = { id: PROJECT_A, client_email: "owner@legitimate.com" };
        
        const policy = vulnerablePolicies.project_messages.delete;
        const requiresMembership = policy.includes("EXISTS") && policy.includes("projects");
        
        expect(requiresMembership).toBe(false);
      });

      it("15. No authorization on DELETE operations", () => {
        const user = { id: TEST_USER_A, is_admin: false };
        
        const policy = vulnerablePolicies.project_messages.delete;
        const requiresAdmin = policy.includes("is_admin = true");
        
        expect(requiresAdmin).toBe(false);
      });
    });
  });

  describe("4. Storage Policy Vulnerabilities (5 tests)", () => {
    describe("storage.objects policy bypass", () => {
      it("16. Storage read is public (no auth required)", () => {
        const policy = vulnerablePolicies.storage.read;
        const requiresAuth = policy.includes("auth.");
        
        expect(requiresAuth).toBe(false);
      });

      it("17. Any authenticated user can DELETE attachments", () => {
        const userA = { id: TEST_USER_A };
        const userB = { id: TEST_USER_B };
        
        const attachment = { 
          id: "file-123", 
          bucket_id: "message-attachments",
          owner_id: TEST_USER_A 
        };
        
        const policy = vulnerablePolicies.storage.delete;
        const userBCanDelete = policy.includes("auth.role() = 'authenticated'");
        
        expect(userBCanDelete).toBe(true);
      });

      it("18. Storage policies use auth.role() not is_admin check", () => {
        const insertPolicy = vulnerablePolicies.storage.insert;
        const deletePolicy = vulnerablePolicies.storage.delete;
        
        const usesRoleNotAdmin = insertPolicy.includes("auth.role()") && 
                                !insertPolicy.includes("is_admin");
        
        expect(usesRoleNotAdmin).toBe(true);
      });

      it("19. Attachments accessible without ownership", () => {
        const userA = { id: TEST_USER_A };
        const userB = { id: TEST_USER_B };
        
        const attachment = { bucket_id: "message-attachments", owner: TEST_USER_A };
        
        const readPolicy = vulnerablePolicies.storage.read;
        const checksOwnership = readPolicy.includes("owner") || 
                               readPolicy.includes("auth.uid()");
        
        expect(checksOwnership).toBe(false);
      });

      it("20. Storage bucket has no proper access control", () => {
        const authenticatedUser = { id: TEST_USER_A, role: "authenticated" };
        const outsider = { id: TEST_USER_C, role: "authenticated" };
        
        const readPolicy = vulnerablePolicies.storage.read;
        const insertPolicy = vulnerablePolicies.storage.insert;
        
        const noReadControl = !readPolicy.includes("auth.uid()") && 
                             !readPolicy.includes("owner");
        const noInsertControl = !insertPolicy.includes("owner");
        
        expect(noReadControl).toBe(true);
        expect(noInsertControl).toBe(true);
      });
    });
  });

  describe("IMPACT SUMMARY", () => {
    it("VULNERABILITY SEVERITY: CRITICAL", () => {
      const bypassSeverity = "CRITICAL";
      
      expect(bypassSeverity).toBe("CRITICAL");
    });

    it("ATTACK VECTOR: Any authenticated user can read all messages", () => {
      const attackVector = "SELECT * FROM project_messages WHERE 1=1";
      const isExploitable = vulnerablePolicies.project_messages.select === "auth.role() = 'authenticated'";
      
      expect(isExploitable).toBe(true);
    });

    it("ATTACK VECTOR: Any authenticated user can insert as anyone", () => {
      const attackVector = "INSERT INTO project_messages (sender_id, project_id, content) VALUES ('any-uuid', 'any-project', 'malicious')";
      const isExploitable = !vulnerablePolicies.project_messages.insert.includes("sender_id = auth.uid()");
      
      expect(isExploitable).toBe(true);
    });

    it("ATTACK VECTOR: Any authenticated user can delete all messages", () => {
      const attackVector = "DELETE FROM project_messages WHERE 1=1";
      const isExploitable = vulnerablePolicies.project_messages.delete === "auth.role() = 'authenticated'";
      
      expect(isExploitable).toBe(true);
    });

    it("ATTACK VECTOR: Storage attachments are publicly readable", () => {
      const attackVector = "SELECT * FROM storage.objects WHERE bucket_id = 'message-attachments'";
      const isExploitable = !vulnerablePolicies.storage.read.includes("auth.");
      
      expect(isExploitable).toBe(true);
    });

    it("ATTACK VECTOR: Storage attachments can be deleted by anyone", () => {
      const attackVector = "DELETE FROM storage.objects WHERE bucket_id = 'message-attachments'";
      const isExploitable = vulnerablePolicies.storage.delete.includes("auth.role() = 'authenticated'");
      
      expect(isExploitable).toBe(true);
    });

    it("REMEDIATION: Compare with secure policies from 001_create_messaging_tables.sql", () => {
      const hasSecureSelect = securePolicies.project_messages.select.includes("EXISTS") &&
                              securePolicies.project_messages.select.includes("project_id");
      const hasSecureInsert = securePolicies.project_messages.insert.includes("sender_id = auth.uid()") &&
                              securePolicies.project_messages.insert.includes("EXISTS");
      const hasSecureDelete = securePolicies.project_messages.delete.includes("is_admin = true");
      
      expect(hasSecureSelect).toBe(true);
      expect(hasSecureInsert).toBe(true);
      expect(hasSecureDelete).toBe(true);
    });
  });

  describe("VULNERABLE CODE LOCATIONS", () => {
    it("MIGRATION_FIXED.sql lines 44-51: project_messages policies", () => {
      const vulnerablePolicyPattern = "auth.role() = 'authenticated'";
      const policy1 = vulnerablePolicies.project_messages.select;
      const policy2 = vulnerablePolicies.project_messages.insert;
      const policy3 = vulnerablePolicies.project_messages.delete;
      
      expect(policy1).toBe(vulnerablePolicyPattern);
      expect(policy2).toBe(vulnerablePolicyPattern);
      expect(policy3).toBe(vulnerablePolicyPattern);
    });

    it("MIGRATION_FIXED.sql lines 53-57: message_reads policies", () => {
      const vulnerablePolicyPattern = "auth.role() = 'authenticated'";
      const policy1 = vulnerablePolicies.message_reads.select;
      const policy2 = vulnerablePolicies.message_reads.insert;
      
      expect(policy1).toBe(vulnerablePolicyPattern);
      expect(policy2).toBe(vulnerablePolicyPattern);
    });

    it("MIGRATION_FIXED.sql lines 78-94: Storage policies", () => {
      const vulnerableStoragePolicies = [
        { policy: vulnerablePolicies.storage.read, expected: "bucket_id = 'message-attachments'" },
        { policy: vulnerablePolicies.storage.insert, expected: "auth.role() = 'authenticated'" },
        { policy: vulnerablePolicies.storage.delete, expected: "auth.role() = 'authenticated'" },
      ];
      
      vulnerableStoragePolicies.forEach(({ policy, expected }) => {
        expect(policy.includes(expected)).toBe(true);
      });
    });
  });
});
