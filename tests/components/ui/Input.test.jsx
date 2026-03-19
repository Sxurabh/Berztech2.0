/**
 * @fileoverview Component tests for Input
 *
 * Tests cover:
 * - Rendering with label
 * - Error state
 * - Forwarding ref
 * - Additional className
 * - Standard input props
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "@/components/ui/Input";

describe("Input", () => {
    it("renders without label when not provided", () => {
        render(<Input placeholder="Enter text" />);
        
        const input = screen.getByPlaceholderText("Enter text");
        expect(input).toBeInTheDocument();
    });

    it("renders with label when provided", () => {
        render(<Input label="Email Address" placeholder="Enter email" />);
        
        expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("renders with error message", () => {
        render(<Input error="This field is required" placeholder="Enter text" />);
        
        expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error styling when error is present", () => {
        render(<Input error="Error" placeholder="Enter text" />);
        
        const input = screen.getByPlaceholderText("Enter text");
        expect(input.className).toContain("border-red-300");
    });

    it("applies default styling when no error", () => {
        render(<Input placeholder="Enter text" />);
        
        const input = screen.getByPlaceholderText("Enter text");
        expect(input.className).toContain("border-neutral-200");
    });

    it("forwards ref to input element", () => {
        const ref = { current: null };
        render(<Input ref={ref} placeholder="Enter text" />);
        
        expect(ref.current).not.toBeNull();
    });

    it("accepts standard input props", async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        
        render(<Input placeholder="Enter text" onChange={handleChange} />);
        
        const input = screen.getByPlaceholderText("Enter text");
        await user.type(input, "hello");
        
        expect(handleChange).toHaveBeenCalled();
    });

    it("accepts additional className", () => {
        render(<Input className="my-custom-class" placeholder="Enter text" />);
        
        const container = screen.getByPlaceholderText("Enter text").parentElement;
        expect(container.className).toContain("my-custom-class");
    });

    it("handles disabled state", () => {
        render(<Input placeholder="Enter text" disabled />);
        
        const input = screen.getByPlaceholderText("Enter text");
        expect(input).toBeDisabled();
    });

    it("handles required attribute", () => {
        render(<Input placeholder="Enter text" required />);
        
        const input = screen.getByPlaceholderText("Enter text");
        expect(input).toHaveAttribute("required");
    });
});
