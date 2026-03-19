import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container, Grid, GridItem, SectionHeader } from '@/components/ui/Container';

describe('Container Component', () => {
    it('renders children correctly', () => {
        render(
            <Container>
                <span>Content</span>
            </Container>
        );
        
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders as div by default', () => {
        const { container } = render(
            <Container>Content</Container>
        );
        
        expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('renders as custom component when as prop is provided', () => {
        const { container } = render(
            <Container as="section">Content</Container>
        );
        
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('applies default size class', () => {
        const { container } = render(
            <Container size="default">Content</Container>
        );
        
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('applies tight size class', () => {
        const { container } = render(
            <Container size="tight">Content</Container>
        );
        
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('applies hero size class', () => {
        const { container } = render(
            <Container size="hero">Content</Container>
        );
        
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('applies full size class', () => {
        const { container } = render(
            <Container size="full">Content</Container>
        );
        
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('applies custom className', () => {
        const { container } = render(
            <Container className="custom-class">Content</Container>
        );
        
        expect(container.firstChild).toHaveClass('custom-class');
    });
});

describe('Grid Component', () => {
    it('renders children correctly', () => {
        render(
            <Grid>
                <span>Grid Content</span>
            </Grid>
        );
        
        expect(screen.getByText('Grid Content')).toBeInTheDocument();
    });

    it('applies grid classes', () => {
        const { container } = render(
            <Grid>Content</Grid>
        );
        
        expect(container.firstChild).toHaveClass('grid');
        expect(container.firstChild).toHaveClass('grid-cols-12');
    });

    it('applies custom className', () => {
        const { container } = render(
            <Grid className="custom-grid">Content</Grid>
        );
        
        expect(container.firstChild).toHaveClass('custom-grid');
    });
});

describe('GridItem Component', () => {
    it('renders children correctly', () => {
        render(
            <GridItem>
                <span>Item Content</span>
            </GridItem>
        );
        
        expect(screen.getByText('Item Content')).toBeInTheDocument();
    });

    it('applies full span by default', () => {
        const { container } = render(
            <GridItem>Content</GridItem>
        );
        
        expect(container.firstChild).toHaveClass('col-span-12');
    });

    it('applies half span', () => {
        const { container } = render(
            <GridItem colSpan="half">Content</GridItem>
        );
        
        expect(container.firstChild).toHaveClass('col-span-12');
        expect(container.firstChild).toHaveClass('lg:col-span-6');
    });

    it('applies third span', () => {
        const { container } = render(
            <GridItem colSpan="third">Content</GridItem>
        );
        
        expect(container.firstChild).toHaveClass('col-span-12');
        expect(container.firstChild).toHaveClass('lg:col-span-4');
    });

    it('applies twoThirds span', () => {
        const { container } = render(
            <GridItem colSpan="twoThirds">Content</GridItem>
        );
        
        expect(container.firstChild).toHaveClass('lg:col-span-8');
    });

    it('applies quarter span', () => {
        const { container } = render(
            <GridItem colSpan="quarter">Content</GridItem>
        );
        
        expect(container.firstChild).toHaveClass('col-span-6');
    });

    it('applies custom className', () => {
        const { container } = render(
            <GridItem className="custom-item">Content</GridItem>
        );
        
        expect(container.firstChild).toHaveClass('custom-item');
    });
});

describe('SectionHeader Component', () => {
    it('renders title correctly', () => {
        render(
            <SectionHeader title="Test Title" />
        );
        
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders eyebrow when provided', () => {
        render(
            <SectionHeader title="Test Title" eyebrow="Eyebrow Text" />
        );
        
        expect(screen.getByText('Eyebrow Text')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
        render(
            <SectionHeader title="Test Title" subtitle="Subtitle Text" />
        );
        
        expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
    });

    it('renders action when provided', () => {
        render(
            <SectionHeader title="Test Title" action={<button>Action</button>} />
        );
        
        expect(screen.getByRole('button')).toHaveTextContent('Action');
    });

    it('applies left alignment by default', () => {
        const { container } = render(
            <SectionHeader title="Test Title" />
        );
        
        expect(container.firstChild).toHaveClass('text-left');
    });

    it('applies center alignment', () => {
        const { container } = render(
            <SectionHeader title="Test Title" align="center" />
        );
        
        expect(container.firstChild).toHaveClass('text-center');
    });

    it('applies right alignment', () => {
        const { container } = render(
            <SectionHeader title="Test Title" align="right" />
        );
        
        expect(container.firstChild).toHaveClass('text-right');
    });
});
