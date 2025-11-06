import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExampleQuestions } from './ExampleQuestions';

describe('ExampleQuestions', () => {
  let onSelectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSelectMock = vi.fn();
    vi.clearAllMocks();

    // Mock Math.random for consistent test results
    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      return callCount * 0.1; // Returns predictable sequence: 0.1, 0.2, 0.3, etc.
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render example questions', () => {
      render(<ExampleQuestions onSelect={onSelectMock} />);

      // Should render 6 question buttons when no context
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });

    it('should render buttons with correct styling', () => {
      render(<ExampleQuestions onSelect={onSelectMock} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:scale-105');
        expect(button).toHaveClass('transition-transform');
      });
    });

    it('should apply staggered animation delays', () => {
      render(<ExampleQuestions onSelect={onSelectMock} />);

      const buttons = screen.getAllByRole('button');

      // First button should have 0ms delay
      expect(buttons[0]).toHaveStyle({ animationDelay: '0ms' });

      // Second button should have 100ms delay
      expect(buttons[1]).toHaveStyle({ animationDelay: '100ms' });

      // Third button should have 200ms delay
      expect(buttons[2]).toHaveStyle({ animationDelay: '200ms' });
    });
  });

  describe('Question selection', () => {
    it('should call onSelect when a question is clicked', async () => {
      const user = userEvent.setup();
      render(<ExampleQuestions onSelect={onSelectMock} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const questionText = firstButton.textContent;

      await user.click(firstButton);

      expect(onSelectMock).toHaveBeenCalledTimes(1);
      expect(onSelectMock).toHaveBeenCalledWith(questionText);
    });

    it('should not call onSelect when disabled', async () => {
      const user = userEvent.setup();
      render(<ExampleQuestions onSelect={onSelectMock} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];

      await user.click(firstButton);

      expect(onSelectMock).not.toHaveBeenCalled();
    });

    it('should disable all buttons when disabled prop is true', () => {
      render(<ExampleQuestions onSelect={onSelectMock} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Contextual questions - Consumer Law', () => {
    it('should show contextual questions for "zwrot towaru"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak mogę zwrócić towar?"
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6); // 3 contextual + 3 random

      // Should include consumer law related questions
      const buttonTexts = buttons.map(b => b.textContent);
      const hasConsumerLawQuestion = buttonTexts.some(text =>
        text?.includes('Zwrot') ||
        text?.includes('Reklamacja') ||
        text?.includes('odstąpienie') ||
        text?.includes('kredyt')
      );
      expect(hasConsumerLawQuestion).toBe(true);
    });

    it('should show contextual questions for "reklamacja"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak złożyć reklamację produktu?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasConsumerLawQuestion = buttonTexts.some(text =>
        text?.includes('Zwrot') ||
        text?.includes('Reklamacja') ||
        text?.includes('odstąpienie') ||
        text?.includes('kredyt')
      );
      expect(hasConsumerLawQuestion).toBe(true);
    });
  });

  describe('Contextual questions - Labor Law', () => {
    it('should show contextual questions for "urlop"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Ile mam dni urlopu?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasLaborLawQuestion = buttonTexts.some(text =>
        text?.includes('Urlop') ||
        text?.includes('praca') ||
        text?.includes('Wypowiedzenie') ||
        text?.includes('Nadgodziny') ||
        text?.includes('Mobbing')
      );
      expect(hasLaborLawQuestion).toBe(true);
    });

    it('should show contextual questions for "wypowiedzenie umowy o pracę"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak wypowiedzieć umowę o pracę?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasLaborLawQuestion = buttonTexts.some(text =>
        text?.includes('Urlop') ||
        text?.includes('Wypowiedzenie') ||
        text?.includes('Nadgodziny') ||
        text?.includes('macierzyński')
      );
      expect(hasLaborLawQuestion).toBe(true);
    });
  });

  describe('Contextual questions - Rental Law', () => {
    it('should show contextual questions for "najem"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak wypowiedzieć umowę najmu?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasRentalLawQuestion = buttonTexts.some(text =>
        text?.includes('najem') ||
        text?.includes('Kaucja') ||
        text?.includes('czynszu') ||
        text?.includes('Eksmisja')
      );
      expect(hasRentalLawQuestion).toBe(true);
    });
  });

  describe('Contextual questions - Tax Law', () => {
    it('should show contextual questions for "podatek"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak odliczyć podatek VAT?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasTaxLawQuestion = buttonTexts.some(text =>
        text?.includes('VAT') ||
        text?.includes('Ulga') ||
        text?.includes('darowizny') ||
        text?.includes('PIT')
      );
      expect(hasTaxLawQuestion).toBe(true);
    });
  });

  describe('Contextual questions - Family Law', () => {
    it('should show contextual questions for "rozwód"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak przebiega rozwód?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasFamilyLawQuestion = buttonTexts.some(text =>
        text?.includes('Alimenty') ||
        text?.includes('Rozwód') ||
        text?.includes('rodzicielska') ||
        text?.includes('majątku')
      );
      expect(hasFamilyLawQuestion).toBe(true);
    });
  });

  describe('Contextual questions - Criminal Law', () => {
    it('should show contextual questions for "mandat"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak odwołać się od mandatu?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasCriminalLawQuestion = buttonTexts.some(text =>
        text?.includes('Przedawnienie') ||
        text?.includes('Obrona') ||
        text?.includes('Zniesławienie')
      );
      expect(hasCriminalLawQuestion).toBe(true);
    });
  });

  describe('Contextual questions - Traffic Law', () => {
    it('should show contextual questions for "prawo jazdy"', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Kiedy mogą cofnąć prawo jazdy?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      const hasTrafficLawQuestion = buttonTexts.some(text =>
        text?.includes('Punkty karne') ||
        text?.includes('prawo jazdy') ||
        text?.includes('prędkość') ||
        text?.includes('parking')
      );
      expect(hasTrafficLawQuestion).toBe(true);
    });
  });

  describe('No contextual match', () => {
    it('should show only random questions when no category matches', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="This is a completely unrelated question about cooking"
        />
      );

      // When there's no matching category, it should show contextual (empty) + 3 random
      // Since contextual returns empty array, getRandomQuestions gets called with count=3
      // Then popular with count=3, total should be 6 questions
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Memoization', () => {
    it('should memoize questions based on lastUserQuestion', () => {
      const { rerender } = render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak zwrócić towar?"
        />
      );

      const firstButtons = screen.getAllByRole('button');
      const firstQuestions = firstButtons.map(b => b.textContent);

      // Re-render with same lastUserQuestion
      rerender(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak zwrócić towar?"
        />
      );

      const secondButtons = screen.getAllByRole('button');
      const secondQuestions = secondButtons.map(b => b.textContent);

      // Questions should be the same due to memoization
      expect(secondQuestions).toEqual(firstQuestions);
    });

    it('should update questions when lastUserQuestion changes', () => {
      const { rerender } = render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Jak zwrócić towar?"
        />
      );

      const firstButtons = screen.getAllByRole('button');
      const firstQuestions = firstButtons.map(b => b.textContent);

      // Re-render with different lastUserQuestion
      rerender(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="Ile mam urlopu?"
        />
      );

      const secondButtons = screen.getAllByRole('button');
      const secondQuestions = secondButtons.map(b => b.textContent);

      // At least some questions should be different due to different context
      const allSame = secondQuestions.every((q, i) => q === firstQuestions[i]);
      expect(allSame).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty lastUserQuestion', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion=""
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle undefined lastUserQuestion', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });

    it('should handle case-insensitive keyword matching', () => {
      render(
        <ExampleQuestions
          onSelect={onSelectMock}
          lastUserQuestion="JAK ZWRÓCIĆ TOWAR?"
        />
      );

      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      // Should still match consumer law category
      const hasConsumerLawQuestion = buttonTexts.some(text =>
        text?.includes('Zwrot') ||
        text?.includes('Reklamacja') ||
        text?.includes('odstąpienie')
      );
      expect(hasConsumerLawQuestion).toBe(true);
    });
  });
});
