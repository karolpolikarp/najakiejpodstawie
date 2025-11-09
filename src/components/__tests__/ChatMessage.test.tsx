import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  describe('User messages', () => {
    it('renders user message correctly', () => {
      render(<ChatMessage role="user" content="Test question" />);
      expect(screen.getByText('Test question')).toBeInTheDocument();
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

    it('parses ŹRÓDŁO section correctly', () => {
      const content = `**ŹRÓDŁO:**
https://isap.sejm.gov.pl/`;

      render(<ChatMessage role="assistant" content={content} />);
      expect(screen.getByText(/Źródło/i)).toBeInTheDocument();
      // URL should be rendered in the content
      expect(screen.getByText(/isap.sejm.gov.pl/)).toBeInTheDocument();
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
    it('shows thumbs up/down buttons for non-error assistant messages with messageId', () => {
      // Use normal legal response (not an error)
      const normalContent = `**PODSTAWA PRAWNA:**
Art. 27 Ustawy`;

      render(
        <ChatMessage
          role="assistant"
          content={normalContent}
          messageId="test-id"
          onFeedback={vi.fn()}
        />
      );

      const thumbsUpButtons = screen.getAllByTitle(/pomocna odpowiedź/i);
      const thumbsDownButtons = screen.getAllByTitle(/niepomocna odpowiedź/i);

      expect(thumbsUpButtons.length).toBeGreaterThan(0);
      expect(thumbsDownButtons.length).toBeGreaterThan(0);
    });

    it('calls onFeedback when thumbs up is clicked', () => {
      const mockFeedback = vi.fn();
      const normalContent = `**PODSTAWA PRAWNA:**
Art. 27 Ustawy`;

      render(
        <ChatMessage
          role="assistant"
          content={normalContent}
          messageId="test-id"
          onFeedback={mockFeedback}
        />
      );

      const thumbsUpButtons = screen.getAllByTitle(/pomocna odpowiedź/i);
      fireEvent.click(thumbsUpButtons[0]);

      expect(mockFeedback).toHaveBeenCalledWith('test-id', 'positive');
    });

    it('calls onFeedback when thumbs down is clicked', () => {
      const mockFeedback = vi.fn();
      const normalContent = `**PODSTAWA PRAWNA:**
Art. 27 Ustawy`;

      render(
        <ChatMessage
          role="assistant"
          content={normalContent}
          messageId="test-id"
          onFeedback={mockFeedback}
        />
      );

      const thumbsDownButtons = screen.getAllByTitle(/niepomocna odpowiedź/i);
      fireEvent.click(thumbsDownButtons[0]);

      expect(mockFeedback).toHaveBeenCalledWith('test-id', 'negative');
    });

    it('toggles feedback when clicking same button twice', () => {
      const mockFeedback = vi.fn();
      const normalContent = `**PODSTAWA PRAWNA:**
Art. 27 Ustawy`;

      render(
        <ChatMessage
          role="assistant"
          content={normalContent}
          messageId="test-id"
          onFeedback={mockFeedback}
          feedback="positive"
        />
      );

      const thumbsUpButtons = screen.getAllByTitle(/pomocna odpowiedź/i);
      fireEvent.click(thumbsUpButtons[0]);

      expect(mockFeedback).toHaveBeenCalledWith('test-id', null);
    });
  });

  describe('Retry functionality', () => {
    it('shows retry button for error messages when onRetry and userContent are provided', () => {
      // Must use error message pattern
      const errorContent = "Niestety coś poszło nie tak. Spróbuj ponownie.";

      render(
        <ChatMessage
          role="assistant"
          content={errorContent}
          messageId="test-id"
          userContent="Original question"
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /ponów/i })).toBeInTheDocument();
    });

    it('calls onRetry with userContent when retry button is clicked', () => {
      const mockRetry = vi.fn();
      const errorContent = "Niestety coś poszło nie tak. Spróbuj ponownie.";

      render(
        <ChatMessage
          role="assistant"
          content={errorContent}
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

  describe('Suggested questions functionality', () => {
    it('parses SUGEROWANE PYTANIA section and renders clickable buttons', () => {
      const content = `**SUGEROWANE PYTANIA:**
- Zwrot towaru kupionego online
- Reklamacja wadliwego produktu
- Odstąpienie od umowy`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      expect(screen.getByText(/Sugerowane Pytania/i)).toBeInTheDocument();

      // Check if all questions are rendered as buttons
      expect(screen.getByRole('button', { name: /Zwrot towaru kupionego online/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reklamacja wadliwego produktu/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Odstąpienie od umowy/i })).toBeInTheDocument();
    });

    it('calls onSendMessage when suggested question button is clicked', () => {
      const content = `**PYTANIA POMOCNICZE:**
- Urlop na żądanie - ile dni w roku?
- Wypowiedzenie umowy o pracę`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      const questionButton = screen.getByRole('button', { name: /Urlop na żądanie - ile dni w roku?/i });
      fireEvent.click(questionButton);

      expect(mockSendMessage).toHaveBeenCalledWith('Urlop na żądanie - ile dni w roku?');
    });

    it('handles numbered list format for suggested questions', () => {
      const content = `**MOŻE ZAPYTAJ:**
1. Zwrot towaru kupionego online
2. Reklamacja wadliwego produktu`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      expect(screen.getByRole('button', { name: /Zwrot towaru kupionego online/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reklamacja wadliwego produktu/i })).toBeInTheDocument();
    });

    it('disables suggested question buttons when onSendMessage is not provided', () => {
      const content = `**SUGEROWANE PYTANIA:**
- Test question`;

      render(
        <ChatMessage
          role="assistant"
          content={content}
        />
      );

      const questionButton = screen.getByRole('button', { name: /Test question/i });
      expect(questionButton).toBeDisabled();
    });

    it('automatically detects and converts questions in quotes to clickable buttons', () => {
      const content = `Sformułuj proszę pytanie bardziej precyzyjnie, np.:

• "Jakie są obowiązki kierowcy na czerwonym świetle na przejściu dla pieszych?"
• "Co oznacza czerwone światło dla pieszego na przejściu?"
• "Jakie są kary za przejechanie na czerwonym na przejściu?"`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      // Should detect and render as suggested questions
      expect(screen.getByText(/Sugerowane pytania/i)).toBeInTheDocument();

      // Check if questions are rendered as buttons
      expect(screen.getByRole('button', { name: /Jakie są obowiązki kierowcy na czerwonym świetle/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Co oznacza czerwone światło dla pieszego/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Jakie są kary za przejechanie na czerwonym/i })).toBeInTheDocument();
    });

    it('calls onSendMessage when auto-detected question button is clicked', () => {
      const content = `Sformułuj pytanie inaczej:

• "Urlop na żądanie - ile dni w roku?"
• "Nadgodziny - jak są płatne?"`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      const questionButton = screen.getByRole('button', { name: /Urlop na żądanie - ile dni w roku?/i });
      fireEvent.click(questionButton);

      expect(mockSendMessage).toHaveBeenCalledWith('Urlop na żądanie - ile dni w roku?');
    });

    it('automatically detects bullet-pointed topics after suggestion phrases', () => {
      const content = `❌ Przepraszam, ale jestem asystentem prawnym i odpowiadam tylko na pytania związane z polskim prawem.

Pytanie o "rower" samo w sobie nie dotyczy prawa. Jednak jeśli chciałbyś wiedzieć o:

• Przepisach ruchu drogowego dotyczących rowerów
• Obowiązkach ubezpieczenia roweru
• Prawach i obowiązkach rowerzysty
• Odpowiedzialności za szkodę wyrządzoną rowerem
• Kradzieży roweru i ochronie prawnej
...to chętnie pomogę! 🚴`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      // Should detect and render as suggested questions
      expect(screen.getByText(/Sugerowane pytania/i)).toBeInTheDocument();

      // Check if topics are rendered as clickable buttons (converted to questions)
      expect(screen.getByRole('button', { name: /przepisach ruchu drogowego/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /obowiązkach ubezpieczenia/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /prawach i obowiązkach rowerzysty/i })).toBeInTheDocument();
    });

    it('calls onSendMessage with converted question when bullet-point topic button is clicked', () => {
      const content = `Możesz zapytać o:

• Przepisach ruchu drogowego dotyczących rowerów
• Obowiązkach ubezpieczenia roweru`;

      const mockSendMessage = vi.fn();

      render(
        <ChatMessage
          role="assistant"
          content={content}
          onSendMessage={mockSendMessage}
        />
      );

      // Click on the first button
      const buttons = screen.getAllByRole('button');
      const firstQuestionButton = buttons[0];
      fireEvent.click(firstQuestionButton);

      // Should call with the converted question
      expect(mockSendMessage).toHaveBeenCalledOnce();
      const calledWith = mockSendMessage.mock.calls[0][0];
      expect(calledWith.toLowerCase()).toContain('przepisach ruchu drogowego');
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
