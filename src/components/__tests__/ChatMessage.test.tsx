import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  describe('User messages', () => {
    it('renders user message correctly', () => {
      render(<ChatMessage role="user" content="Test question" />);
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });

    it('displays user icon for user messages', () => {
      const { container } = render(<ChatMessage role="user" content="Test" />);
      // Check for Scale icon (lucide-react renders as svg)
      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
    });
  });

  describe('Assistant messages', () => {
    it('renders simple assistant message', () => {
      render(<ChatMessage role="assistant" content="Simple response" />);
      expect(screen.getByText('Simple response')).toBeInTheDocument();
    });

    it('parses PODSTAWA PRAWNA section correctly', () => {
      const content = `**PODSTAWA PRAWNA:**
Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27`;

      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(/Podstawa Prawna/i)).toBeInTheDocument();
      expect(screen.getByText(/Ustawa z dnia 30 maja 2014 r/)).toBeInTheDocument();
    });

    it('parses CO TO OZNACZA section correctly', () => {
      const content = `**CO TO OZNACZA:**
Konsument może zwrócić towar w ciągu 14 dni.`;

      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(/Co To Oznacza/i)).toBeInTheDocument();
      expect(screen.getByText(/Konsument może zwrócić towar/)).toBeInTheDocument();
    });

    it('parses POWIĄZANE PRZEPISY section correctly', () => {
      const content = `**POWIĄZANE PRZEPISY:**
• Art. 28 - złożenie oświadczenia
• Art. 29 - zwrot pieniędzy`;

      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(/Powiązane Przepisy/i)).toBeInTheDocument();
      expect(screen.getByText(/Art. 28 - złożenie oświadczenia/)).toBeInTheDocument();
    });

    it('parses ŹRÓDŁO section with link', () => {
      const content = `**ŹRÓDŁO:**
https://isap.sejm.gov.pl/`;

      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(/Źródło/i)).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://isap.sejm.gov.pl/');
    });

    it('renders multiple sections correctly', () => {
      const content = `**PODSTAWA PRAWNA:**
Art. 27 Ustawy

**CO TO OZNACZA:**
Wyjaśnienie

**UWAGA:**
To nie jest porada prawna.`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText(/Podstawa Prawna/i)).toBeInTheDocument();
      expect(screen.getByText(/Co To Oznacza/i)).toBeInTheDocument();
      expect(screen.getByText(/Uwaga/i)).toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('shows copy button for assistant messages', () => {
      render(<ChatMessage role="assistant" content="Test content" />);
      const copyButton = screen.getByRole('button', { name: /kopiuj/i });
      expect(copyButton).toBeInTheDocument();
    });

    it('copies content to clipboard when copy button is clicked', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<ChatMessage role="assistant" content="Test content to copy" />);

      const copyButton = screen.getByRole('button', { name: /kopiuj/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Test content to copy');
      });
    });
  });

  describe('Feedback functionality', () => {
    it('shows thumbs up/down buttons for assistant messages with messageId', () => {
      render(
        <ChatMessage
          role="assistant"
          content="Test"
          messageId="test-id"
          onFeedback={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /pozytywna ocena/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /negatywna ocena/i })).toBeInTheDocument();
    });

    it('calls onFeedback when thumbs up is clicked', () => {
      const mockFeedback = vi.fn();
      render(
        <ChatMessage
          role="assistant"
          content="Test"
          messageId="test-id"
          onFeedback={mockFeedback}
        />
      );

      const thumbsUpButton = screen.getByRole('button', { name: /pozytywna ocena/i });
      fireEvent.click(thumbsUpButton);

      expect(mockFeedback).toHaveBeenCalledWith('test-id', 'positive');
    });

    it('calls onFeedback when thumbs down is clicked', () => {
      const mockFeedback = vi.fn();
      render(
        <ChatMessage
          role="assistant"
          content="Test"
          messageId="test-id"
          onFeedback={mockFeedback}
        />
      );

      const thumbsDownButton = screen.getByRole('button', { name: /negatywna ocena/i });
      fireEvent.click(thumbsDownButton);

      expect(mockFeedback).toHaveBeenCalledWith('test-id', 'negative');
    });

    it('toggles feedback when clicking same button twice', () => {
      const mockFeedback = vi.fn();
      render(
        <ChatMessage
          role="assistant"
          content="Test"
          messageId="test-id"
          onFeedback={mockFeedback}
          feedback="positive"
        />
      );

      const thumbsUpButton = screen.getByRole('button', { name: /pozytywna ocena/i });
      fireEvent.click(thumbsUpButton);

      expect(mockFeedback).toHaveBeenCalledWith('test-id', null);
    });
  });

  describe('Retry functionality', () => {
    it('shows retry button when onRetry and userContent are provided', () => {
      render(
        <ChatMessage
          role="assistant"
          content="Error occurred"
          messageId="test-id"
          userContent="Original question"
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /ponów/i })).toBeInTheDocument();
    });

    it('calls onRetry with userContent when retry button is clicked', () => {
      const mockRetry = vi.fn();
      render(
        <ChatMessage
          role="assistant"
          content="Error"
          messageId="test-id"
          userContent="Original question"
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /ponów/i });
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledWith('Original question');
    });
  });

  describe('Edge cases', () => {
    it('handles empty content gracefully', () => {
      render(<ChatMessage role="assistant" content="" />);
      // Should not crash
    });

    it('handles malformed markdown', () => {
      const content = '**PODSTAWA PRAWNA:\nNo closing asterisks';
      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(/PODSTAWA PRAWNA/)).toBeInTheDocument();
    });

    it('handles content without sections', () => {
      const content = 'Just plain text without any sections';
      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });
});
