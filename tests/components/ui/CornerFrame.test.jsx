import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CornerFrame } from '@/components/ui/CornerFrame';

describe('CornerFrame Component', () => {
    it('renders children correctly', () => {
        render(
            <CornerFrame>
                <span>Content</span>
            </CornerFrame>
        );
        
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <CornerFrame className="custom-class">
                <span>Content</span>
            </CornerFrame>
        );
        
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies bracketClassName to bracket elements', () => {
        const { container } = render(
            <CornerFrame bracketClassName="custom-bracket">
                <span>Content</span>
            </CornerFrame>
        );
        
        const brackets = container.querySelectorAll('span.absolute');
        brackets.forEach(bracket => {
            expect(bracket.className).toContain('custom-bracket');
        });
    });

    it('renders all four corner brackets', () => {
        const { container } = render(
            <CornerFrame>
                <span>Content</span>
            </CornerFrame>
        );
        
        const brackets = container.querySelectorAll('span.absolute');
        expect(brackets.length).toBe(4);
    });

    it('has group class for hover effects', () => {
        const { container } = render(
            <CornerFrame>
                <span>Content</span>
            </CornerFrame>
        );
        
        expect(container.firstChild).toHaveClass('group');
    });
});
