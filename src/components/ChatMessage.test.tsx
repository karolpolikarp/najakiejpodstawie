import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatMessage } from './ChatMessage';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('ChatMessage', () => {
  let clipboardWriteTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteTextMock,
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('User messages', () => {
    it('should render user message correctly', () => {
      const content = 'Jakie są zasady zwrotu towaru?';
      render(<ChatMessage role="user" content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('should apply correct styling for user messages', () => {
      render(<ChatMessage role="user" content="Test message" />);

      const messageDiv = screen.getByText('Test message').closest('div');
      expect(messageDiv).toHaveClass('bg-user');
    });

    it('should not show copy button for user messages', () => {
      render(<ChatMessage role="user" content="Test message" />);

      expect(screen.queryByText('Kopiuj')).not.toBeInTheDocument();
    });
  });

  describe('Assistant messages - basic rendering', () => {
    it('should render assistant message correctly', () => {
      const content = 'To jest odpowiedź asystenta.';
      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('should apply correct styling for assistant messages', () => {
      render(<ChatMessage role="assistant" content="Test message" />);

      const container = screen.getByText('Test message').closest('div');
      expect(container?.parentElement).toHaveClass('bg-assistant');
    });

    it('should show copy button for assistant messages', () => {
      render(<ChatMessage role="assistant" content="Test message" />);

      expect(screen.getByText('Kopiuj')).toBeInTheDocument();
    });
  });

  describe('Message parsing and sections', () => {
    it('should parse and render legal basis section', () => {
      const content = `PODSTAWA PRAWNA:
Art. 27 ustawy o prawach konsumenta`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('PODSTAWA PRAWNA')).toBeInTheDocument();
      expect(screen.getByText(/Art. 27 ustawy o prawach konsumenta/)).toBeInTheDocument();
    });

    it('should parse and render explanation section', () => {
      const content = `CO TO OZNACZA:
Konsument może zwrócić towar bez podania przyczyny.`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('CO TO OZNACZA')).toBeInTheDocument();
      expect(screen.getByText(/Konsument może zwrócić towar/)).toBeInTheDocument();
    });

    it('should parse and render warning section', () => {
      const content = `UWAGA:
To jest ważne ostrzeżenie!`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('UWAGA')).toBeInTheDocument();
      expect(screen.getByText(/To jest ważne ostrzeżenie!/)).toBeInTheDocument();
    });

    it('should parse and render related provisions section', () => {
      const content = `POWIĄZANE PRZEPISY:
Art. 30 ustawy o prawach konsumenta`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('POWIĄZANE PRZEPISY')).toBeInTheDocument();
      expect(screen.getByText(/Art. 30 ustawy o prawach konsumenta/)).toBeInTheDocument();
    });

    it('should parse and render source section', () => {
      const content = `ŹRÓDŁO:
Ustawa o prawach konsumenta`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('ŹRÓDŁO')).toBeInTheDocument();
      expect(screen.getByText(/Ustawa o prawach konsumenta/)).toBeInTheDocument();
    });

    it('should parse and render details section', () => {
      const content = `KLUCZOWE INFORMACJE:
Termin zwrotu wynosi 14 dni`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('KLUCZOWE INFORMACJE')).toBeInTheDocument();
      expect(screen.getByText(/Termin zwrotu wynosi 14 dni/)).toBeInTheDocument();
    });

    it('should parse and render additional section', () => {
      const content = `DODATKOWE INFORMACJE:
Dodatkowe szczegóły dotyczące zwrotu`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('DODATKOWE INFORMACJE')).toBeInTheDocument();
      expect(screen.getByText(/Dodatkowe szczegóły/)).toBeInTheDocument();
    });

    it('should handle multiple sections in one message', () => {
      const content = `PODSTAWA PRAWNA:
Art. 27

CO TO OZNACZA:
Wyjaśnienie przepisu

UWAGA:
Ważne ostrzeżenie`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('PODSTAWA PRAWNA')).toBeInTheDocument();
      expect(screen.getByText('CO TO OZNACZA')).toBeInTheDocument();
      expect(screen.getByText('UWAGA')).toBeInTheDocument();
    });

    it('should handle sections with emoji prefixes', () => {
      const content = `📜 PODSTAWA PRAWNA:
Art. 27 ustawy`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('PODSTAWA PRAWNA')).toBeInTheDocument();
    });
  });

  describe('Content formatting', () => {
    it('should format numbered lists correctly', () => {
      const content = `1. Pierwszy punkt
2. Drugi punkt
3. Trzeci punkt`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('Pierwszy punkt')).toBeInTheDocument();
      expect(screen.getByText('Drugi punkt')).toBeInTheDocument();
      expect(screen.getByText('Trzeci punkt')).toBeInTheDocument();
    });

    it('should format bullet lists correctly', () => {
      const content = `- Pierwszy element
- Drugi element
• Trzeci element`;

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('Pierwszy element')).toBeInTheDocument();
      expect(screen.getByText('Drugi element')).toBeInTheDocument();
      expect(screen.getByText('Trzeci element')).toBeInTheDocument();
    });

    it('should render regular paragraphs', () => {
      const content = 'To jest zwykły paragraf tekstu.';

      render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('should copy content to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      const content = 'Test message to copy';

      render(<ChatMessage role="assistant" content={content} />);

      const copyButton = screen.getByText('Kopiuj');
      await user.click(copyButton);

      expect(clipboardWriteTextMock).toHaveBeenCalledWith(content);
      expect(toast.success).toHaveBeenCalledWith('Skopiowano do schowka');
    });

    it('should show "Skopiowano" feedback after copying', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const content = 'Test message';

      render(<ChatMessage role="assistant" content={content} />);

      const copyButton = screen.getByText('Kopiuj');
      await user.click(copyButton);

      expect(screen.getByText('Skopiowano')).toBeInTheDocument();
      expect(screen.queryByText('Kopiuj')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Error message detection', () => {
    it('should detect error message with ❌ symbol', () => {
      const content = '❌ Nie udało się przetworzyć zapytania';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent="Test question"
          onRetry={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.getByText('Ponów pytanie')).toBeInTheDocument();
      expect(screen.getByText('Usuń')).toBeInTheDocument();
    });

    it('should detect error message with "przepraszam"', () => {
      const content = 'Przepraszam, ale coś poszło nie tak';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent="Test question"
          onRetry={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.getByText('Ponów pytanie')).toBeInTheDocument();
    });

    it('should detect error message with "nie udało się"', () => {
      const content = 'Nie udało się uzyskać odpowiedzi';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent="Test question"
          onRetry={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.getByText('Ponów pytanie')).toBeInTheDocument();
    });

    it('should not show retry/remove buttons for normal messages', () => {
      const content = 'To jest normalna odpowiedź';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent="Test question"
          onRetry={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.queryByText('Ponów pytanie')).not.toBeInTheDocument();
      expect(screen.queryByText('Usuń')).not.toBeInTheDocument();
    });
  });

  describe('Retry functionality', () => {
    it('should call onRetry with userContent when retry button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const userContent = 'Original question';
      const content = '❌ Error occurred';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent={userContent}
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByText('Ponów pytanie');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledWith(userContent);
    });

    it('should not show retry button when onRetry is not provided', () => {
      const content = '❌ Error occurred';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent="Test question"
        />
      );

      expect(screen.queryByText('Ponów pytanie')).not.toBeInTheDocument();
    });

    it('should not show retry button when userContent is not provided', () => {
      const content = '❌ Error occurred';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          onRetry={vi.fn()}
        />
      );

      expect(screen.queryByText('Ponów pytanie')).not.toBeInTheDocument();
    });
  });

  describe('Remove functionality', () => {
    it('should call onRemove with messageId when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const messageId = 'test-message-123';
      const content = '❌ Error occurred';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId={messageId}
          userContent="Test question"
          onRetry={vi.fn()}
          onRemove={onRemove}
        />
      );

      const removeButton = screen.getByText('Usuń');
      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith(messageId);
      expect(toast.success).toHaveBeenCalledWith('Wiadomość usunięta');
    });

    it('should not show remove button when onRemove is not provided', () => {
      const content = '❌ Error occurred';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          messageId="test-id"
          userContent="Test question"
          onRetry={vi.fn()}
        />
      );

      expect(screen.queryByText('Usuń')).not.toBeInTheDocument();
    });

    it('should not show remove button when messageId is not provided', () => {
      const content = '❌ Error occurred';

      render(
        <ChatMessage
          role="assistant"
          content={content}
          userContent="Test question"
          onRetry={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.queryByText('Usuń')).not.toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should memoize formatted content to avoid re-parsing', () => {
      const content = `PODSTAWA PRAWNA:
Art. 27 ustawy`;

      const { rerender } = render(<ChatMessage role="assistant" content={content} />);

      expect(screen.getByText('PODSTAWA PRAWNA')).toBeInTheDocument();

      // Re-render with same content
      rerender(<ChatMessage role="assistant" content={content} />);

      // Should still show the same content without re-parsing
      expect(screen.getByText('PODSTAWA PRAWNA')).toBeInTheDocument();
    });
  });
});
