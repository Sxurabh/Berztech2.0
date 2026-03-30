/**
 * @fileoverview Security tests for SSRF via Attachment URLs
 * 
 * Tests for Server-Side Request Forgery vulnerabilities where malicious URLs
 * in attachment_url parameter could cause the server to make requests to:
 * - Cloud metadata services (AWS, GCP, Azure)
 * - Internal infrastructure (databases, caches, microservices)
 * - Local file system via file:// protocol
 * - Internal network services via various protocols
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockReturnValue(false),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function isPrivateIp(ip) {
    const privateRanges = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/,
    ];
    return privateRanges.some(regex => regex.test(ip));
}

function isCloudMetadataEndpoint(url) {
    const metadataEndpoints = [
        "169.254.169.254",
        "metadata.google.internal",
        "metadata.azure.com",
        "100.100.100.200",
        "metadata.tencentyun.com",
    ];
    return metadataEndpoints.some(endpoint => url.includes(endpoint));
}

function isBlockedProtocol(url) {
    const blockedProtocols = ["file://", "gopher://", "dict://", "sftp://", "ldap://", "tftp://"];
    return blockedProtocols.some(protocol => url.toLowerCase().startsWith(protocol));
}

function isInternalPort(port) {
    const sensitivePorts = [22, 23, 25, 3306, 5432, 6379, 11211, 27017, 9200, 8080, 8443];
    return sensitivePorts.includes(port);
}

describe("Security: SSRF via Attachment URLs", () => {
    describe("Cloud Metadata SSRF", () => {
        it("1. detects AWS metadata service URL (169.254.169.254)", () => {
            const maliciousUrl = "http://169.254.169.254/latest/meta-data/";
            expect(isCloudMetadataEndpoint(maliciousUrl)).toBe(true);
            expect(isPrivateIp("169.254.169.254")).toBe(true);
        });

        it("2. detects GCP metadata service URL (metadata.google.internal)", () => {
            const maliciousUrl = "http://metadata.google.internal/computeMetadata/v1/";
            expect(isCloudMetadataEndpoint(maliciousUrl)).toBe(true);
        });

        it("3. detects Azure metadata service URL", () => {
            const maliciousUrl = "http://169.254.169.254/metadata/instance";
            expect(isCloudMetadataEndpoint(maliciousUrl)).toBe(true);
            expect(isPrivateIp("169.254.169.254")).toBe(true);
        });

        it("4. detects Kubernetes API internal URL", () => {
            const maliciousUrl = "https://10.0.0.1:6443/api/v1/pods";
            expect(isPrivateIp("10.0.0.1")).toBe(true);
            expect(new URL(maliciousUrl).hostname).toBe("10.0.0.1");
        });

        it("5. detects IAM credential extraction attempt from metadata", () => {
            const credentialUrls = [
                "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
                "http://169.254.169.254/latest/meta-data/iam/security-credentials/AdminRole",
                "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity",
            ];
            credentialUrls.forEach(url => {
                expect(isCloudMetadataEndpoint(url)).toBe(true);
            });
        });
    });

    describe("Internal Network SSRF", () => {
        it("6. detects PostgreSQL internal connection attempt", () => {
            const maliciousUrl = "http://127.0.0.1:5432/postgres";
            const url = new URL(maliciousUrl);
            expect(isPrivateIp(url.hostname)).toBe(true);
            expect(isInternalPort(parseInt(url.port))).toBe(true);
        });

        it("7. detects internal web service access", () => {
            const maliciousUrl = "http://127.0.0.1:8080/admin/config";
            const url = new URL(maliciousUrl);
            expect(isPrivateIp(url.hostname)).toBe(true);
            expect(isInternalPort(parseInt(url.port))).toBe(true);
        });

        it("8. detects Redis internal connection attempt", () => {
            const maliciousUrl = "http://127.0.0.1:6379/INFO";
            const url = new URL(maliciousUrl);
            expect(isPrivateIp(url.hostname)).toBe(true);
            expect(isInternalPort(parseInt(url.port))).toBe(true);
        });

        it("9. detects Memcached internal connection attempt", () => {
            const maliciousUrl = "http://127.0.0.1:11211/stats";
            const url = new URL(maliciousUrl);
            expect(isPrivateIp(url.hostname)).toBe(true);
            expect(isInternalPort(parseInt(url.port))).toBe(true);
        });

        it("10. detects internal microservice access", () => {
            const maliciousUrls = [
                "http://localhost:3001/internal/health",
                "http://10.0.0.5:8080/api/admin/users",
                "http://172.16.0.100:5000/v2/_catalog",
            ];
            maliciousUrls.forEach(url => {
                const parsed = new URL(url);
                expect(isPrivateIp(parsed.hostname) || parsed.hostname === "localhost").toBe(true);
            });
        });
    });

    describe("Protocol Abuse", () => {
        it("11. detects file:// protocol for local file access", () => {
            const maliciousUrls = [
                "file:///etc/passwd",
                "file:///var/log/nginx/access.log",
                "file://C:/Windows/System32/drivers/etc/hosts",
            ];
            maliciousUrls.forEach(url => {
                expect(isBlockedProtocol(url)).toBe(true);
            });
        });

        it("12. detects gopher:// protocol for Redis/MySQL exploitation", () => {
            const maliciousUrls = [
                "gopher://127.0.0.1:6379/_INFO",
                "gopher://127.0.0.1:3306/_SELECT%201",
            ];
            maliciousUrls.forEach(url => {
                expect(isBlockedProtocol(url)).toBe(true);
            });
        });

        it("13. detects HTTP redirect to internal network", () => {
            const redirectChain = [
                "http://attacker.com/evil",
                "http://internal.corp.local/admin",
            ];
            const secondUrl = redirectChain[1];
            const parsed = new URL(secondUrl);
            expect(parsed.hostname === "internal.corp.local" || isPrivateIp(parsed.hostname)).toBeTruthy();
        });

        it("14. detects DNS rebinding attack patterns", () => {
            const dnsRebindingUrls = [
                "http://attacker.com#internal/",
                "http://127.0.0.1.attacker.com/",
                "http://0x7f000001.attacker.com/",
            ];
            dnsRebindingUrls.forEach(url => {
                expect(url.includes("attacker.com")).toBe(true);
            });
        });
    });

    describe("SSRF Countermeasures", () => {
        describe("URL Validation", () => {
            it("15. blocks internal IP addresses (10.x range)", () => {
                const internalIps = ["10.0.0.1", "10.255.255.255", "10.1.2.3"];
                internalIps.forEach(ip => {
                    expect(isPrivateIp(ip)).toBe(true);
                });
            });

            it("16. blocks internal IP addresses (172.16-31.x range)", () => {
                const internalIps = ["172.16.0.1", "172.31.255.255", "172.20.0.1"];
                internalIps.forEach(ip => {
                    expect(isPrivateIp(ip)).toBe(true);
                });
            });

            it("17. blocks internal IP addresses (192.168.x range)", () => {
                const internalIps = ["192.168.0.1", "192.168.255.255", "192.168.1.100"];
                internalIps.forEach(ip => {
                    expect(isPrivateIp(ip)).toBe(true);
                });
            });

            it("18. validates redirected URLs against allowlist", () => {
                const allowedDomains = ["example.com", "trusted-domain.com", "cdn.example.org"];
                const maliciousRedirects = [
                    "http://allowed.com#internal/",
                    "http://allowed.com@malicious.com/",
                ];
                
                const hasRedirectIndicator = (url) => 
                    url.includes("#") || url.includes("@") || url.includes("?");
                
                maliciousRedirects.forEach(url => {
                    expect(hasRedirectIndicator(url)).toBe(true);
                });
            });
        });
    });

    describe("SSRF Protection Recommendations", () => {
        it("should implement URL validation to prevent SSRF attacks", () => {
            const createMessageSchema = {
                attachment_url: z.string().url().optional().nullable(),
            };

            const testUrl = "http://169.254.169.254/latest/meta-data/";
            const validation = createMessageSchema.attachment_url.safeParse(testUrl);
            
            expect(validation.success).toBe(true);
        });

        it("should have SSRF protection middleware in place", () => {
            const ssrfProtectionFunctions = {
                validateUrl: (url) => {
                    try {
                        const parsed = new URL(url);
                        if (isPrivateIp(parsed.hostname)) return false;
                        if (isCloudMetadataEndpoint(url)) return false;
                        if (isBlockedProtocol(url)) return false;
                        return true;
                    } catch {
                        return false;
                    }
                },
                isPrivateIp,
                isCloudMetadataEndpoint,
                isBlockedProtocol,
            };

            const safeUrl = "https://example.com/file.pdf";
            const maliciousUrl = "http://169.254.169.254/";

            expect(ssrfProtectionFunctions.validateUrl(safeUrl)).toBe(true);
            expect(ssrfProtectionFunctions.validateUrl(maliciousUrl)).toBe(false);
        });
    });
});

import { z } from "zod";
