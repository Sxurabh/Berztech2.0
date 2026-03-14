/**
 * @fileoverview Unit tests for layout config
 *
 * Tests cover:
 * - Layout configuration structure
 * - Padding values for different breakpoints
 * - Grid system configuration
 * - Typography scale
 * - Card and bracket configurations
 */

import { describe, it, expect } from "vitest";
import { layoutConfig } from "@/config/layout";

describe("layoutConfig", () => {
    describe("Structure", () => {
        it("exports required top-level properties", () => {
            expect(layoutConfig).toHaveProperty("maxWidth");
            expect(layoutConfig).toHaveProperty("padding");
            expect(layoutConfig).toHaveProperty("spacing");
            expect(layoutConfig).toHaveProperty("grid");
            expect(layoutConfig).toHaveProperty("typography");
            expect(layoutConfig).toHaveProperty("card");
            expect(layoutConfig).toHaveProperty("bracket");
        });
    });

    describe("maxWidth", () => {
        it("has valid maxWidth value", () => {
            expect(layoutConfig.maxWidth).toBe("max-w-5xl");
        });
    });

    describe("padding", () => {
        it("has mobile, tablet, and desktop padding", () => {
            expect(layoutConfig.padding).toHaveProperty("mobile");
            expect(layoutConfig.padding).toHaveProperty("tablet");
            expect(layoutConfig.padding).toHaveProperty("desktop");
        });

        it("mobile padding is correct", () => {
            expect(layoutConfig.padding.mobile).toBe("px-4");
        });

        it("tablet padding is correct", () => {
            expect(layoutConfig.padding.tablet).toBe("sm:px-6");
        });

        it("desktop padding is correct", () => {
            expect(layoutConfig.padding.desktop).toBe("lg:px-8");
        });
    });

    describe("spacing", () => {
        it("has section spacing", () => {
            expect(layoutConfig.spacing.section).toContain("py-");
        });

        it("has tight spacing", () => {
            expect(layoutConfig.spacing.tight).toContain("py-");
        });

        it("has hero spacing", () => {
            expect(layoutConfig.spacing.hero).toContain("min-h-screen");
        });
    });

    describe("grid", () => {
        it("has container grid configuration", () => {
            expect(layoutConfig.grid).toHaveProperty("container");
            expect(layoutConfig.grid.container).toContain("grid-cols-12");
        });

        it("has full, half, third column spans", () => {
            expect(layoutConfig.grid).toHaveProperty("full");
            expect(layoutConfig.grid).toHaveProperty("half");
            expect(layoutConfig.grid).toHaveProperty("third");
        });

        it("has content and sidebar layouts", () => {
            expect(layoutConfig.grid).toHaveProperty("content");
            expect(layoutConfig.grid).toHaveProperty("sidebar");
        });
    });

    describe("typography", () => {
        it("has h1 through h3 heading styles", () => {
            expect(layoutConfig.typography).toHaveProperty("h1");
            expect(layoutConfig.typography).toHaveProperty("h2");
            expect(layoutConfig.typography).toHaveProperty("h3");
        });

        it("has body text styles", () => {
            expect(layoutConfig.typography).toHaveProperty("body");
            expect(layoutConfig.typography).toHaveProperty("bodyLarge");
            expect(layoutConfig.typography).toHaveProperty("small");
        });

        it("has card title and subtitle styles", () => {
            expect(layoutConfig.typography).toHaveProperty("cardTitle");
            expect(layoutConfig.typography).toHaveProperty("cardSubtitle");
        });

        it("has eyebrow style", () => {
            expect(layoutConfig.typography).toHaveProperty("eyebrow");
        });

        it("h1 uses space-grotesk font", () => {
            expect(layoutConfig.typography.h1).toContain("font-space-grotesk");
        });
    });

    describe("card", () => {
        it("has base card styles", () => {
            expect(layoutConfig.card).toHaveProperty("base");
            expect(layoutConfig.card.base).toContain("bg-white");
        });

        it("has hover styles", () => {
            expect(layoutConfig.card).toHaveProperty("hover");
            expect(layoutConfig.card.hover).toContain("hover:");
        });

        it("has padding", () => {
            expect(layoutConfig.card).toHaveProperty("padding");
        });
    });

    describe("bracket", () => {
        it("has small, medium, and large bracket sizes", () => {
            expect(layoutConfig.bracket).toHaveProperty("sm");
            expect(layoutConfig.bracket).toHaveProperty("md");
            expect(layoutConfig.bracket).toHaveProperty("lg");
        });

        it("brackets have border styles", () => {
            expect(layoutConfig.bracket.sm).toContain("border-");
            expect(layoutConfig.bracket.md).toContain("border-");
            expect(layoutConfig.bracket.lg).toContain("border-");
        });
    });
});
