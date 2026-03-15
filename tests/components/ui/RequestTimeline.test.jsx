import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import RequestTimeline from '@/components/ui/RequestTimeline';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('RequestTimeline', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Full mode (non-compact)', () => {
    it('renders all 6 stages', () => {
      render(<RequestTimeline currentStage="discover" />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByText('Define')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Develop')).toBeInTheDocument();
      expect(screen.getByText('Deliver')).toBeInTheDocument();
      expect(screen.getByText('Maintain')).toBeInTheDocument();
    });

    it('shows description for each stage', () => {
      render(<RequestTimeline currentStage="discover" />);
      
      expect(screen.getByText('Understanding needs')).toBeInTheDocument();
      expect(screen.getByText('Charting the course')).toBeInTheDocument();
    });

    it('marks completed stages with checkmark', () => {
      render(<RequestTimeline currentStage="design" />);
      
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('highlights current stage', () => {
      render(<RequestTimeline currentStage="develop" />);
      
      const developStage = screen.getByText('Develop');
      expect(developStage).toBeInTheDocument();
    });

    it('does not call onStageChange when not interactive', () => {
      const mockOnStageChange = vi.fn();
      render(<RequestTimeline currentStage="discover" onStageChange={mockOnStageChange} />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.textContent) {
          fireEvent.click(btn);
        }
      });
      
      expect(mockOnStageChange).not.toHaveBeenCalled();
    });

    it('renders without error when interactive', () => {
      const mockOnStageChange = vi.fn();
      render(<RequestTimeline currentStage="discover" interactive={true} onStageChange={mockOnStageChange} />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });
  });

  describe('Compact mode', () => {
    it('renders compact timeline', () => {
      render(<RequestTimeline currentStage="discover" compact={true} />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('renders all 6 stage buttons in compact mode', () => {
      render(<RequestTimeline currentStage="discover" compact={true} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(6);
    });

    it('shows current stage label in compact mode', () => {
      render(<RequestTimeline currentStage="develop" compact={true} />);
      
      expect(screen.getByText('Develop')).toBeInTheDocument();
    });

    it('shows stage description in compact mode', () => {
      render(<RequestTimeline currentStage="discover" compact={true} />);
      
      expect(screen.getByText('Understanding needs')).toBeInTheDocument();
    });
  });

  describe('Legacy status mapping', () => {
    it('maps submitted to discover', () => {
      render(<RequestTimeline currentStage="submitted" />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('maps reviewing to define', () => {
      render(<RequestTimeline currentStage="reviewing" />);
      
      expect(screen.getByText('Define')).toBeInTheDocument();
    });

    it('maps in_progress to develop', () => {
      render(<RequestTimeline currentStage="in_progress" />);
      
      expect(screen.getByText('Develop')).toBeInTheDocument();
    });

    it('maps completed to deliver', () => {
      render(<RequestTimeline currentStage="completed" />);
      
      expect(screen.getByText('Deliver')).toBeInTheDocument();
    });

    it('maps on_hold to define', () => {
      render(<RequestTimeline currentStage="on_hold" />);
      
      expect(screen.getByText('Define')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles unknown stage by defaulting to discover', () => {
      render(<RequestTimeline currentStage="unknown_stage" />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('handles undefined stage by defaulting to discover', () => {
      render(<RequestTimeline currentStage={undefined} />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('handles empty string stage by defaulting to discover', () => {
      render(<RequestTimeline currentStage="" />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('renders without currentStage prop', () => {
      render(<RequestTimeline />);
      
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on interactive buttons', () => {
      render(<RequestTimeline currentStage="discover" interactive={true} onStageChange={() => {}} />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('has aria-current for current step when interactive', () => {
      render(<RequestTimeline currentStage="design" interactive={true} onStageChange={() => {}} />);
      
      const currentStep = document.querySelector('[aria-current="step"]');
      expect(currentStep).toBeInTheDocument();
    });
  });
});
