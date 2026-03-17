import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Select Accessibility', () => {
    it('should have no accessibility violations with label', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        const { container } = render(<Select label="Country" options={options} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should associate label with select', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Country" options={options} id="country-select" />);
        
        const select = screen.getByLabelText(/country/i);
        expect(select).toBeInTheDocument();
    });

    it('should have accessible name from label', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Select Option" options={options} />);
        
        const select = screen.getByLabelText(/select option/i);
        expect(select).toBeInTheDocument();
    });

    it('should indicate required field', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Country" options={options} required />);
        
        const select = screen.getByLabelText(/country/i);
        expect(select).toHaveAttribute('required');
    });

    it('should have proper options', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' }
        ];
        render(<Select label="Country" options={options} />);
        
        const select = screen.getByLabelText(/country/i);
        const opts = screen.getAllByRole('option');
        expect(opts).toHaveLength(3);
    });

    it('should indicate disabled state', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Country" options={options} disabled />);
        
        const select = screen.getByLabelText(/country/i);
        expect(select).toBeDisabled();
    });

    it('should have aria-invalid when error is present', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Country" options={options} error="Please select a country" />);
        
        const select = screen.getByLabelText(/country/i);
        expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby for error message', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Country" options={options} error="Please select a country" />);
        
        const select = screen.getByLabelText(/country/i);
        const errorId = select.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        
        const errorMessage = document.getElementById(errorId);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        render(<Select label="Country" options={options} />);
        
        const select = screen.getByLabelText(/country/i);
        select.focus();
        expect(select).toHaveFocus();
    });

    it('should have no accessibility violations with error', async () => {
        const Select = (await import('@/components/ui/Select')).default;
        const options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ];
        const { container } = render(<Select label="Country" options={options} error="Please select a country" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
