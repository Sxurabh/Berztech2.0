import { describe, it, expect, vi } from "vitest";

describe("formatLastSeen", () => {
    function formatLastSeen(dateString) {
        if (!dateString) return "Unknown";
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 30) return "Just now";
        if (diffSec < 60) return `${diffSec}s ago`;
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay === 1) return "Yesterday";
        if (diffDay < 7) return `${diffDay}d ago`;
        
        return date.toLocaleDateString();
    }

    it("returns Unknown for null", () => {
        expect(formatLastSeen(null)).toBe("Unknown");
    });

    it("returns Unknown for undefined", () => {
        expect(formatLastSeen(undefined)).toBe("Unknown");
    });

    it("formats seconds correctly", () => {
        const now = new Date();
        const thirtySecAgo = new Date(now.getTime() - 30 * 1000).toISOString();
        expect(formatLastSeen(thirtySecAgo)).toBe("30s ago");
    });

    it("formats minutes correctly", () => {
        const now = new Date();
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        expect(formatLastSeen(fiveMinAgo)).toBe("5m ago");
    });

    it("formats hours correctly", () => {
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
        expect(formatLastSeen(twoHoursAgo)).toBe("2h ago");
    });

    it("formats yesterday correctly", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        expect(formatLastSeen(yesterday)).toBe("Yesterday");
    });

    it("formats days correctly", () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatLastSeen(threeDaysAgo)).toBe("3d ago");
    });

    it("formats old dates as date string", () => {
        const oldDate = new Date(2020, 0, 1).toISOString();
        const result = formatLastSeen(oldDate);
        expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    });
});

describe("Presence API Validation", () => {
    it("validates is_online field", async () => {
        const { z } = await import("zod");
        
        const UpdatePresenceSchema = z.object({
            is_online: z.boolean().optional(),
        });
        
        expect(() => UpdatePresenceSchema.parse({})).not.toThrow();
        expect(UpdatePresenceSchema.parse({ is_online: true }).is_online).toBe(true);
        expect(() => UpdatePresenceSchema.parse({ is_online: "not boolean" })).toThrow();
    });
});
