import { motion } from 'framer-motion';
import { Copy, CheckCheck, Scale, FileText, Link as LinkIcon, AlertTriangle, Info, ListChecks, BookOpen, RotateCcw, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, memo } from 'react';
import { toast } from 'sonner';
import { CONSTANTS } from '@/lib/constants';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  userContent?: string;
  feedback?: 'positive' | 'negative' | null;
  onRetry?: (content: string) => void;
  onRemove?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative' | null) => void;
  onSendMessage?: (content: string) => void;
}

interface Section {
  type: string;
  title: string;
  content: string;
}

const parseMessage = (content: string): Section[] => {
  const sections: Section[] = [];
  const lines = content.split('\n');
  let currentSection: Section | null = null;

  // Regex patterns for section headers (after markdown removal)
  const sectionPatterns = [
    { pattern: /^PODSTAWA PRAWNA:?$/i, type: 'legal-basis' },
    { pattern: /^CO TO OZNACZA:?$/i, type: 'explanation' },
    { pattern: /^POWIĄZANE PRZEPISY:?$/i, type: 'related-provisions' },
    { pattern: /^ŹRÓDŁO:?$/i, type: 'source' },
    { pattern: /^UWAGA:?$/i, type: 'warning' },
    { pattern: /^(KLUCZOWE INFORMACJE|SZCZEGÓŁY|SZCZEGÓŁOWY TRYB ZWROTU|WARUNKI SKORZYSTANIA|WARUNKI):?$/i, type: 'details' },
    { pattern: /^(DODATKOWE INFORMACJE|PRZYKŁADY|ZASADY):?$/i, type: 'additional' },
    { pattern: /^(SUGEROWANE PYTANIA|PYTANIA POMOCNICZE|MOŻE ZAPYTAJ|SPRÓBUJ ZAPYTAĆ):?$/i, type: 'suggested-questions' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Remove markdown bold markers for pattern matching
    // Handles: **TEXT:** or **TEXT** or TEXT
    const cleanLine = line.replace(/\*\*/g, '').trim();

    // Check if this line is a section header
    const matchedPattern = sectionPatterns.find(p => p.pattern.test(cleanLine));

    if (matchedPattern) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section - remove markdown and emojis
      currentSection = {
        type: matchedPattern.type,
        title: cleanLine.replace(/^(📜|📝|📚|🔗|⚠️)\s*/, '').replace(/:$/, ''),
        content: ''
      };
    } else if (currentSection) {
      // Add content to current section
      if (currentSection.content && line) {
        currentSection.content += '\n' + line;
      } else if (line) {
        currentSection.content += line;
      }
    } else if (line) {
      // Content before any section header
      sections.push({
        type: 'text',
        title: '',
        content: line
      });
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

// Helper function to parse inline markdown formatting
const parseInlineMarkdown = (text: string) => {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Regex to match **bold** text
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }

    // Add bold text
    parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : text;
};

const formatContent = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const number = trimmed.match(/^\d+\./)?.[0];
      const text = trimmed.replace(/^\d+\.\s/, '');
      return (
        <div key={idx} className="flex gap-2 mb-1">
          <span className="font-medium text-primary">{number}</span>
          <span>{parseInlineMarkdown(text)}</span>
        </div>
      );
    }

    // Bullet list
    if (/^[-•]\s/.test(trimmed)) {
      const text = trimmed.replace(/^[-•]\s/, '');
      return (
        <div key={idx} className="flex gap-2 mb-1 ml-2">
          <span className="text-primary">•</span>
          <span>{parseInlineMarkdown(text)}</span>
        </div>
      );
    }

    // Regular paragraph
    return <p key={idx} className="mb-2 last:mb-0">{parseInlineMarkdown(trimmed)}</p>;
  });
};

const formatAssistantMessage = (content: string, onSendMessage?: (content: string) => void) => {
  const sections = parseMessage(content);

  return sections.map((section, idx) => {
    switch (section.type) {
      case 'legal-basis':
        return (
          <div key={idx} className="mb-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">{section.title}</h3>
            </div>
            <div className="text-foreground font-medium">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'explanation':
        return (
          <div key={idx} className="mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-foreground" />
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            <div className="text-muted-foreground leading-relaxed">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'related-provisions':
        return (
          <div key={idx} className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">{section.title}</h3>
            </div>
            <div className="text-sm text-emerald-900/80 dark:text-emerald-100/80">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'source':
        return (
          <div key={idx} className="mb-4 p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">{section.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'warning':
        return (
          <div key={idx} className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">{section.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'details':
        return (
          <div key={idx} className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">{section.title}</h3>
            </div>
            <div className="text-sm text-blue-900/80 dark:text-blue-100/80">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'additional':
        return (
          <div key={idx} className="mb-4 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-900">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold text-violet-900 dark:text-violet-100">{section.title}</h3>
            </div>
            <div className="text-sm text-violet-900/80 dark:text-violet-100/80">
              {formatContent(section.content)}
            </div>
          </div>
        );

      case 'suggested-questions': {
        // Parse questions from content - each line is a question
        const questions = section.content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Remove leading markers like "- ", "• ", "1. ", etc.
            return line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
          })
          .filter(q => q.length > 0);

        if (questions.length === 0) return null;

        return (
          <div key={idx} className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">{section.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((question, qIdx) => (
                <Button
                  key={`suggested-${qIdx}`}
                  variant="outline"
                  onClick={() => onSendMessage?.(question)}
                  disabled={!onSendMessage}
                  className="text-xs sm:text-sm hover:scale-105 transition-transform duration-200 border-amber-600/50 dark:border-amber-400/50 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/70 dark:hover:bg-amber-800/50 hover:border-amber-700 dark:hover:border-amber-300 text-amber-900 dark:text-amber-100 hover:text-amber-950 dark:hover:text-amber-50"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        );
      }

      case 'text':
      default:
        if (!section.content.trim()) return null;
        return (
          <div key={idx} className="mb-2 text-muted-foreground">
            {formatContent(section.content)}
          </div>
        );
    }
  });
};

// Funkcja sprawdzająca, czy wiadomość jest błędem/niezrozumiałym zapytaniem
const isErrorMessage = (content: string): boolean => {
  // Bardziej precyzyjne wykrywanie błędów - tylko konkretne błędy systemowe
  const errorPatterns = [
    /^❌.*nie odpowiadam tylko na pytania związane z polskim prawem/i,
    /^niestety coś poszło nie tak/i,
    /^nie udało się przetworzyć pytania/i,
    /^błąd połączenia/i,
    /^przekroczono limit/i,
  ];

  return errorPatterns.some(pattern => pattern.test(content.trim()));
};

export const ChatMessage = memo(({ role, content, messageId, userContent, feedback, onRetry, onRemove, onFeedback, onSendMessage }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isError = role === 'assistant' && isErrorMessage(content);

  // Memoize formatted content to avoid re-parsing on every render
  const formattedContent = useMemo(() => {
    if (role === 'assistant') {
      return formatAssistantMessage(content, onSendMessage);
    }
    return content;
  }, [role, content, onSendMessage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Skopiowano do schowka');
    setTimeout(() => setCopied(false), CONSTANTS.UI.COPY_FEEDBACK_DURATION_MS);
  };

  const handleRetry = () => {
    if (onRetry && userContent) {
      onRetry(userContent);
    }
  };

  const handleRemove = () => {
    if (onRemove && messageId) {
      onRemove(messageId);
      toast.success('Wiadomość usunięta');
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    if (onFeedback && messageId) {
      // Toggle feedback - if same type clicked, remove it
      const newFeedback = feedback === type ? null : type;
      onFeedback(messageId, newFeedback);

      if (newFeedback === 'positive') {
        toast.success('Dziękujemy za pozytywną opinię!');
      } else if (newFeedback === 'negative') {
        toast.info('Dziękujemy za feedback. Postaramy się poprawić!');
      } else {
        toast.info('Feedback usunięty');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}
    >
      <div
        className={`max-w-[95%] sm:max-w-[85%] rounded-lg ${
          role === 'user'
            ? 'bg-user text-user-foreground p-3 sm:p-4'
            : 'bg-assistant text-assistant-foreground border border-border p-4 sm:p-5'
        }`}
      >
        {role === 'user' ? (
          <div className="whitespace-pre-wrap break-words">{formattedContent}</div>
        ) : (
          <div className="space-y-2">
            {formattedContent}
          </div>
        )}
        {role === 'assistant' && (
          <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-2">
            {/* Error actions - only for errors */}
            {isError && (
              <div className="flex gap-2 mb-2">
                {onRetry && userContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="h-8 text-xs hover:bg-primary/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Ponów pytanie
                  </Button>
                )}
                {onRemove && messageId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Usuń
                  </Button>
                )}
              </div>
            )}

            {/* Feedback and copy buttons in one line */}
            <div className="flex items-center justify-between gap-2">
              {!isError && messageId ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-1">Czy ta odpowiedź była pomocna?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('positive')}
                    className={`h-7 px-2 ${
                      feedback === 'positive'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                    title="Pomocna odpowiedź"
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${feedback === 'positive' ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('negative')}
                    className={`h-7 px-2 ${
                      feedback === 'negative'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title="Niepomocna odpowiedź"
                  >
                    <ThumbsDown className={`h-3.5 w-3.5 ${feedback === 'negative' ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              ) : (
                <div />
              )}

              {/* Copy button - always visible */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-accent" />
                    Skopiowano
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Kopiuj
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';
