import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Input Accessibility', () => {
    it('should have no accessibility violations with label', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        const { container } = render(<Input label="Email" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should associate label with input', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" id="email-input" />);
        
        const input = screen.getByLabelText(/email/i);
        expect(input).toBeInTheDocument();
    });

    it('should have accessible name from label', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="First Name" />);
        
        const input = screen.getByLabelText(/first name/i);
        expect(input).toBeInTheDocument();
    });

    it('should indicate required field', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" required />);
        
        const input = screen.getByLabelText(/email/i);
        expect(input).toHaveAttribute('required');
    });

    it('should have proper placeholder for additional context', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" placeholder="you@example.com" />);
        
        const input = screen.getByPlaceholderText(/you@example.com/i);
        expect(input).toBeInTheDocument();
    });

    it('should indicate disabled state', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" disabled />);
        
        const input = screen.getByLabelText(/email/i);
        expect(input).toBeDisabled();
    });

    it('should have aria-invalid when error is present', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" error="Invalid email" />);
        
        const input = screen.getByLabelText(/email/i);
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby for error message', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" error="Invalid email" />);
        
        const input = screen.getByLabelText(/email/i);
        const errorId = input.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        
        const errorMessage = document.getElementById(errorId);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        render(<Input label="Email" />);
        
        const input = screen.getByLabelText(/email/i);
        input.focus();
        expect(input).toHaveFocus();
    });

    it('should have no accessibility violations with error', async () => {
        const Input = (await import('@/components/ui/Input')).default;
        const { container } = render(<Input label="Email" error="Invalid email address" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

describe('Textarea Accessibility', () => {
    it('should have no accessibility violations with label', async () => {
        const Textarea = (await import('@/components/ui/Textarea')).default;
        const { container } = render(<Textarea label="Message" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should associate label with textarea', async () => {
        const Textarea = (await import('@/components/ui/Textarea')).default;
        render(<Textarea label="Message" id="message-input" />);
        
        const textarea = screen.getByLabelText(/message/i);
        expect(textarea).toBeInTheDocument();
    });

    it('should indicate required field', async () => {
        const Textarea = (await import('@/components/ui/Textarea')).default;
        render(<Textarea label="Message" required />);
        
        const textarea = screen.getByLabelText(/message/i);
        expect(textarea).toHaveAttribute('required');
    });

    it('should have aria-invalid when error is present', async () => {
        const Textarea = (await import('@/components/ui/Textarea')).default;
        render(<Textarea label="Message" error="Message is required" />);
        
        const textarea = screen.getByLabelText(/message/i);
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have no accessibility violations with error', async () => {
        const Textarea = (await import('@/components/ui/Textarea')).default;
        const { container } = render(<Textarea label="Message" error="Message is required" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
