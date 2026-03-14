/**
 * @fileoverview Unit tests for design-tokens
 *
 * Tests cover:
 * - serviceColors structure
 * - typography exports
 * - spacing exports
 * - animation exports
 */

import { describe, it, expect } from "vitest";
import { serviceColors, typography, spacing, animation } from "@/lib/design-tokens";

describe("design-tokens", () => {
    describe("serviceColors", () => {
        const expectedColors = ["blue", "indigo", "purple", "emerald", "amber", "rose", "cyan"];

        expectedColors.forEach((color) => {
            it(`includes ${color} color scheme`, () => {
                expect(serviceColors).toHaveProperty(color);
            });

            it(`${color} has required properties`, () => {
                const scheme = serviceColors[color];
                expect(scheme).toHaveProperty("bg");
                expect(scheme).toHaveProperty("bgHover");
                expect(scheme).toHaveProperty("bgLight");
                expect(scheme).toHaveProperty("text");
                expect(scheme).toHaveProperty("textHover");
                expect(scheme).toHaveProperty("border");
                expect(scheme).toHaveProperty("borderHover");
                expect(scheme).toHaveProperty("glow");
                expect(scheme).toHaveProperty("glowHover");
                expect(scheme).toHaveProperty("line");
                expect(scheme).toHaveProperty("bracket");
                expect(scheme).toHaveProperty("fill");
                expect(scheme).toHaveProperty("stroke");
            });

            it(`${color} has valid Tailwind classes`, () => {
                const scheme = serviceColors[color];
                expect(scheme.bg).toMatch(/^bg-/);
                expect(scheme.text).toMatch(/^text-/);
                expect(scheme.border).toMatch(/^border-/);
            });
        });

        it("emerald has textDark property", () => {
            expect(serviceColors.emerald).toHaveProperty("textDark");
        });
    });

    describe("typography", () => {
        it("includes fontFamily", () => {
            expect(typography.fontFamily).toHaveProperty("sans");
            expect(typography.fontFamily).toHaveProperty("mono");
        });

        it("includes fontSize", () => {
            expect(typography.fontSize).toHaveProperty("tiny");
            expect(typography.fontSize).toHaveProperty("xs");
            expect(typography.fontSize).toHaveProperty("sm");
            expect(typography.fontSize).toHaveProperty("base");
            expect(typography.fontSize).toHaveProperty("lg");
            expect(typography.fontSize).toHaveProperty("xl");
            expect(typography.fontSize).toHaveProperty("2xl");
            expect(typography.fontSize).toHaveProperty("3xl");
            expect(typography.fontSize).toHaveProperty("4xl");
            expect(typography.fontSize).toHaveProperty("5xl");
            expect(typography.fontSize).toHaveProperty("6xl");
            expect(typography.fontSize).toHaveProperty("7xl");
        });

        it("includes fontWeight", () => {
            expect(typography.fontWeight).toHaveProperty("normal");
            expect(typography.fontWeight).toHaveProperty("medium");
            expect(typography.fontWeight).toHaveProperty("semibold");
            expect(typography.fontWeight).toHaveProperty("bold");
        });

        it("includes tracking", () => {
            expect(typography.tracking).toHaveProperty("tight");
            expect(typography.tracking).toHaveProperty("wide");
            expect(typography.tracking).toHaveProperty("wider");
            expect(typography.tracking).toHaveProperty("widest");
        });

        it("fontFamily values are valid CSS classes", () => {
            expect(typography.fontFamily.sans).toMatch(/^font-/);
            expect(typography.fontFamily.mono).toMatch(/^font-/);
        });
    });

    describe("spacing", () => {
        it("includes container spacing", () => {
            expect(spacing.container).toHaveProperty("padding");
            expect(spacing.container).toHaveProperty("maxWidth");
            expect(spacing.container).toHaveProperty("wrapper");
        });

        it("includes section spacing", () => {
            expect(spacing.section).toHaveProperty("padding");
            expect(spacing.section).toHaveProperty("paddingSm");
        });

        it("includes gap spacing", () => {
            expect(spacing.gap).toHaveProperty("default");
            expect(spacing.gap).toHaveProperty("sm");
        });

        it("spacing values contain valid Tailwind classes", () => {
            expect(spacing.container.padding).toMatch(/px-/);
            expect(spacing.section.padding).toMatch(/py-/);
        });
    });

    describe("animation", () => {
        it("includes transition timings", () => {
            expect(animation.transition).toHaveProperty("default");
            expect(animation.transition).toHaveProperty("fast");
            expect(animation.transition).toHaveProperty("slow");
        });

        it("includes hover effects", () => {
            expect(animation.hover).toHaveProperty("scale");
            expect(animation.hover).toHaveProperty("lift");
        });

        it("transition values contain valid animation classes", () => {
            expect(animation.transition.default).toMatch(/transition-/);
            expect(animation.transition.default).toMatch(/duration-/);
        });
    });
});
