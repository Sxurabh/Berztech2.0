/**
 * @fileoverview Unit tests for colors config
 *
 * Tests cover:
 * - colorSchemes exports
 * - statusColors exports
 */

import { describe, it, expect } from "vitest";
import { colorSchemes, statusColors } from "@/config/colors";

describe("colors config", () => {
    describe("colorSchemes", () => {
        const expectedColors = ["blue", "purple", "emerald", "amber", "rose", "cyan"];

        expectedColors.forEach((color) => {
            it(`includes ${color} color scheme`, () => {
                expect(colorSchemes).toHaveProperty(color);
            });

            it(`${color} has required properties`, () => {
                const scheme = colorSchemes[color];
                expect(scheme).toHaveProperty("bg");
                expect(scheme).toHaveProperty("text");
                expect(scheme).toHaveProperty("bgLight");
                expect(scheme).toHaveProperty("border");
                expect(scheme).toHaveProperty("bracket");
                expect(scheme).toHaveProperty("gradient");
            });

            it(`${color} has valid Tailwind classes`, () => {
                const scheme = colorSchemes[color];
                expect(scheme.bg).toMatch(/^bg-/);
                expect(scheme.text).toMatch(/^text-/);
                expect(scheme.border).toMatch(/^border-/);
                expect(scheme.gradient).toMatch(/^from-/);
            });
        });

        it("has exactly 6 color schemes", () => {
            expect(Object.keys(colorSchemes)).toHaveLength(6);
        });
    });

    describe("statusColors", () => {
        const expectedStatuses = ["success", "warning", "error", "info"];

        expectedStatuses.forEach((status) => {
            it(`includes ${status} status color`, () => {
                expect(statusColors).toHaveProperty(status);
            });

            it(`${status} has required properties`, () => {
                const scheme = statusColors[status];
                expect(scheme).toHaveProperty("bg");
                expect(scheme).toHaveProperty("bgLight");
                expect(scheme).toHaveProperty("text");
                expect(scheme).toHaveProperty("border");
            });

            it(`${status} has valid Tailwind classes`, () => {
                const scheme = statusColors[status];
                expect(scheme.bg).toMatch(/^bg-/);
                expect(scheme.text).toMatch(/^text-/);
                expect(scheme.border).toMatch(/^border-/);
            });
        });

        it("has exactly 4 status colors", () => {
            expect(Object.keys(statusColors)).toHaveLength(4);
        });
    });
});
