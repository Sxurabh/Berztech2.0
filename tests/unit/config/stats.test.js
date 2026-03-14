/**
 * @fileoverview Unit tests for stats config
 *
 * Tests cover:
 * - Company stats structure
 * - Individual stat properties (value, suffix, label, sublabel)
 * - About stats array
 * - Home stats array
 */

import { describe, it, expect } from "vitest";
import { companyStats, aboutStats, homeStats } from "@/config/stats";

describe("companyStats", () => {
    describe("Structure", () => {
        it("exports required stat categories", () => {
            expect(companyStats).toHaveProperty("years");
            expect(companyStats).toHaveProperty("projects");
            expect(companyStats).toHaveProperty("retention");
            expect(companyStats).toHaveProperty("team");
            expect(companyStats).toHaveProperty("response");
            expect(companyStats).toHaveProperty("rating");
        });
    });

    describe("years stat", () => {
        it("has correct value and suffix", () => {
            expect(companyStats.years.value).toBe(7);
            expect(companyStats.years.suffix).toBe("+");
        });

        it("has label and sublabel", () => {
            expect(companyStats.years.label).toBe("Years Active");
            expect(companyStats.years.sublabel).toBe("Since 2017");
        });

        it("has description", () => {
            expect(companyStats.years.description).toBe("Experience");
        });
    });

    describe("projects stat", () => {
        it("has correct value and suffix", () => {
            expect(companyStats.projects.value).toBe(50);
            expect(companyStats.projects.suffix).toBe("+");
        });

        it("has label and sublabel", () => {
            expect(companyStats.projects.label).toBe("Projects");
            expect(companyStats.projects.sublabel).toBe("Delivered");
        });
    });

    describe("retention stat", () => {
        it("has correct value with percentage suffix", () => {
            expect(companyStats.retention.value).toBe(98);
            expect(companyStats.retention.suffix).toBe("%");
        });

        it("has label and sublabel", () => {
            expect(companyStats.retention.label).toBe("Retention");
            expect(companyStats.retention.sublabel).toBe("Client Rate");
        });
    });

    describe("team stat", () => {
        it("has correct value without suffix", () => {
            expect(companyStats.team.value).toBe(12);
            expect(companyStats.team.suffix).toBe("");
        });

        it("has label and sublabel", () => {
            expect(companyStats.team.label).toBe("Team Members");
            expect(companyStats.team.sublabel).toBe("Engineers & Designers");
        });
    });

    describe("response stat", () => {
        it("has correct value with ms suffix", () => {
            expect(companyStats.response.value).toBe(12);
            expect(companyStats.response.suffix).toBe("ms");
        });

        it("has label and sublabel", () => {
            expect(companyStats.response.label).toBe("Avg Response");
            expect(companyStats.response.sublabel).toBe("Global Latency");
        });
    });

    describe("rating stat", () => {
        it("has correct decimal value", () => {
            expect(companyStats.rating.value).toBe(4.9);
            expect(companyStats.rating.suffix).toBe("");
        });

        it("has label and sublabel", () => {
            expect(companyStats.rating.label).toBe("Rating");
            expect(companyStats.rating.sublabel).toBe("Clutch Review");
        });
    });
});

describe("aboutStats", () => {
    it("is an array", () => {
        expect(Array.isArray(aboutStats)).toBe(true);
    });

    it("has 4 items", () => {
        expect(aboutStats).toHaveLength(4);
    });

    it("contains years, projects, team, and retention stats", () => {
        const labels = aboutStats.map(s => s.label);
        expect(labels).toContain("Years Active");
        expect(labels).toContain("Projects");
        expect(labels).toContain("Team Members");
        expect(labels).toContain("Retention");
    });
});

describe("homeStats", () => {
    it("is an array", () => {
        expect(Array.isArray(homeStats)).toBe(true);
    });

    it("has 4 items", () => {
        expect(homeStats).toHaveLength(4);
    });

    it("contains projects, retention, response, and years stats in order", () => {
        const labels = homeStats.map(s => s.label);
        expect(labels[0]).toBe("Projects");
        expect(labels[1]).toBe("Retention");
        expect(labels[2]).toBe("Avg Response");
        expect(labels[3]).toBe("Years Active");
    });
});
