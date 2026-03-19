/**
 * @fileoverview Component tests for Select
 *
 * Tests cover:
 * - Rendering with label
 * - Rendering options (string and object)
 * - Error state
 * - Forwarding ref
 * - Standard select props
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Select from "@/components/ui/Select";

describe("Select", () => {
    it("renders without label when not provided", () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        render(<Select options={options} />);
        
        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();
    });

    it("renders with label when provided", () => {
        const options = ["Option 1"];
        render(<Select label="Select Option" options={options} />);
        
        expect(screen.getByText("Select Option")).toBeInTheDocument();
    });

    it("renders string options", () => {
        const options = ["Option A", "Option B", "Option C"];
        render(<Select options={options} />);
        
        expect(screen.getByText("Option A")).toBeInTheDocument();
        expect(screen.getByText("Option B")).toBeInTheDocument();
        expect(screen.getByText("Option C")).toBeInTheDocument();
    });

    it("renders object options with value and label", () => {
        const options = [
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
        ];
        render(<Select options={options} />);
        
        expect(screen.getByText("Option A")).toBeInTheDocument();
        expect(screen.getByText("Option B")).toBeInTheDocument();
    });

    it("renders with error message", () => {
        const options = ["Option 1"];
        render(<Select error="Selection required" options={options} />);
        
        expect(screen.getByText("Selection required")).toBeInTheDocument();
    });

    it("applies error styling when error is present", () => {
        const options = ["Option 1"];
        render(<Select error="Error" options={options} />);
        
        const select = screen.getByRole("combobox");
        expect(select.className).toContain("border-red-300");
    });

    it("applies default styling when no error", () => {
        const options = ["Option 1"];
        render(<Select options={options} />);
        
        const select = screen.getByRole("combobox");
        expect(select.className).toContain("border-neutral-200");
    });

    it("forwards ref to select element", () => {
        const ref = { current: null };
        const options = ["Option 1"];
        
        render(<Select ref={ref} options={options} />);
        
        expect(ref.current).not.toBeNull();
    });

    it("handles value change", async () => {
        const handleChange = vi.fn();
        const options = ["Option A", "Option B"];
        
        render(<Select options={options} onChange={handleChange} />);
        
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "Option B" } });
        
        expect(handleChange).toHaveBeenCalled();
    });

    it("accepts additional className", () => {
        const options = ["Option 1"];
        render(<Select className="my-custom-class" options={options} />);
        
        const container = screen.getByRole("combobox").parentElement;
        expect(container.className).toContain("my-custom-class");
    });

    it("handles disabled state", () => {
        const options = ["Option 1"];
        render(<Select options={options} disabled />);
        
        const select = screen.getByRole("combobox");
        expect(select).toBeDisabled();
    });

    it("handles defaultValue", () => {
        const options = ["Option A", "Option B"];
        render(<Select options={options} defaultValue="Option B" />);
        
        const select = screen.getByRole("combobox");
        expect(select.value).toBe("Option B");
    });

    it("handles empty options array", () => {
        render(<Select options={[]} />);
        
        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();
    });
});
