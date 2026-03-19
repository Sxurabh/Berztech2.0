/**
 * @fileoverview Component tests for Textarea
 *
 * Tests cover:
 * - Rendering with label
 * - Error state
 * - Forwarding ref
 * - Standard textarea props
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Textarea from "@/components/ui/Textarea";

describe("Textarea", () => {
    it("renders without label when not provided", () => {
        render(<Textarea placeholder="Enter message" />);
        
        const textarea = screen.getByPlaceholderText("Enter message");
        expect(textarea).toBeInTheDocument();
    });

    it("renders with label when provided", () => {
        render(<Textarea label="Message" placeholder="Enter message" />);
        
        expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("renders with error message", () => {
        render(<Textarea error="Message is required" placeholder="Enter message" />);
        
        expect(screen.getByText("Message is required")).toBeInTheDocument();
    });

    it("applies error styling when error is present", () => {
        render(<Textarea error="Error" placeholder="Enter message" />);
        
        const textarea = screen.getByPlaceholderText("Enter message");
        expect(textarea.className).toContain("border-red-300");
    });

    it("applies default styling when no error", () => {
        render(<Textarea placeholder="Enter message" />);
        
        const textarea = screen.getByPlaceholderText("Enter message");
        expect(textarea.className).toContain("border-neutral-200");
    });

    it("forwards ref to textarea element", () => {
        const ref = { current: null };
        render(<Textarea ref={ref} placeholder="Enter message" />);
        
        expect(ref.current).not.toBeNull();
    });

    it("accepts standard textarea props", async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        
        render(<Textarea placeholder="Enter message" onChange={handleChange} />);
        
        const textarea = screen.getByPlaceholderText("Enter message");
        await user.type(textarea, "hello world");
        
        expect(handleChange).toHaveBeenCalled();
    });

    it("accepts additional className", () => {
        render(<Textarea className="my-custom-class" placeholder="Enter message" />);
        
        const container = screen.getByPlaceholderText("Enter message").parentElement;
        expect(container.className).toContain("my-custom-class");
    });

    it("handles disabled state", () => {
        render(<Textarea placeholder="Enter message" disabled />);
        
        const textarea = screen.getByPlaceholderText("Enter message");
        expect(textarea).toBeDisabled();
    });

    it("has minimum height set", () => {
        render(<Textarea placeholder="Enter message" />);
        
        const textarea = screen.getByPlaceholderText("Enter message");
        expect(textarea.className).toContain("min-h-[100px]");
    });
});
