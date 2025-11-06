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

  // Regex patterns for section headers
  const sectionPatterns = [
    { pattern: /^(📜\s*)?PODSTAWA PRAWNA:?$/i, type: 'legal-basis' },
    { pattern: /^(📝\s*)?CO TO OZNACZA:?$/i, type: 'explanation' },
    { pattern: /^(📚\s*)?POWIĄZANE PRZEPISY:?$/i, type: 'related-provisions' },
    { pattern: /^(🔗\s*)?ŹRÓDŁO:?$/i, type: 'source' },
    { pattern: /^(⚠️\s*)?UWAGA:?$/i, type: 'warning' },
    { pattern: /^(KLUCZOWE INFORMACJE|SZCZEGÓŁY|SZCZEGÓŁOWY TRYB ZWROTU|WARUNKI SKORZYSTANIA|WARUNKI):?$/i, type: 'details' },
    { pattern: /^(DODATKOWE INFORMACJE|PRZYKŁADY|ZASADY):?$/i, type: 'additional' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this line is a section header
    const matchedPattern = sectionPatterns.find(p => p.pattern.test(line));

    if (matchedPattern) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        type: matchedPattern.type,
        title: line.replace(/^(📜|📝|📚|🔗|⚠️)\s*/, '').replace(/:$/, ''),
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

const formatContent = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <div key={idx} className="flex gap-2 mb-1">
          <span className="font-medium text-primary">{trimmed.match(/^\d+\./)?.[0]}</span>
          <span>{trimmed.replace(/^\d+\.\s/, '')}</span>
        </div>
      );
    }

    // Bullet list
    if (/^[-•]\s/.test(trimmed)) {
      return (
        <div key={idx} className="flex gap-2 mb-1 ml-2">
          <span className="text-primary">•</span>
          <span>{trimmed.replace(/^[-•]\s/, '')}</span>
        </div>
      );
    }

    // Regular paragraph
    return <p key={idx} className="mb-2 last:mb-0">{trimmed}</p>;
  });
};

const formatAssistantMessage = (content: string) => {
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
          <div key={idx} className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-destructive mb-1">{section.title}</h3>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {formatContent(section.content)}
                </div>
              </div>
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
  return (
    content.includes('❌') ||
    content.toLowerCase().includes('przepraszam') ||
    content.toLowerCase().includes('nie udało się') ||
    content.toLowerCase().includes('coś poszło nie tak') ||
    content.toLowerCase().includes('nie dotyczy prawa') ||
    content.toLowerCase().includes('zadaj proszę pytanie prawne')
  );
};

export const ChatMessage = memo(({ role, content, messageId, userContent, feedback, onRetry, onRemove, onFeedback }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isError = role === 'assistant' && isErrorMessage(content);

  // Memoize formatted content to avoid re-parsing on every render
  const formattedContent = useMemo(() => {
    if (role === 'assistant') {
      return formatAssistantMessage(content);
    }
    return content;
  }, [role, content]);

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
            <div className="flex justify-between items-center">
              {isError && (
                <div className="flex gap-2">
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
              <div className={isError ? 'ml-auto' : ''}>
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

            {/* Feedback buttons */}
            {!isError && messageId && (
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
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
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';
