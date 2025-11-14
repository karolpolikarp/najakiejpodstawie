import { useState, forwardRef } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { detectPII } from '@/lib/pii-detector';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ onSend, disabled }, ref) => {
  const [message, setMessage] = useState('');
  const [showPIIWarning, setShowPIIWarning] = useState(false);
  const [piiReasons, setPIIReasons] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      // Sprawdź czy są dane osobowe
      const piiCheck = detectPII(message.trim());
      if (piiCheck.detected) {
        setShowPIIWarning(true);
        setPIIReasons(piiCheck.reasons);
        return;
      }

      onSend(message.trim());
      setMessage('');
      setShowPIIWarning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleIgnoreWarning = () => {
    setShowPIIWarning(false);
    // Pozwól użytkownikowi edytować
  };

  const handleSendAnyway = () => {
    onSend(message.trim());
    setMessage('');
    setShowPIIWarning(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      {/* Ostrzeżenie PII */}
      {showPIIWarning && (
        <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-3 rounded">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                ⚠️ Wykryto potencjalne dane osobowe!
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                Znaleźliśmy: {piiReasons.join(', ')}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                NIE przesyłaj PESEL, NIP, adresów, numerów telefonu ani innych danych identyfikujących osoby.
                Sformułuj pytanie ogólnie.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleIgnoreWarning}
                  className="text-xs"
                >
                  Zmodyfikuję pytanie
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleSendAnyway}
                  className="text-xs"
                >
                  Wyślij mimo to (nie zalecane)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <Textarea
          ref={ref}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Zadaj pytanie o podstawę prawną... (NIE podawaj danych osobowych)"
          disabled={disabled}
          className="min-h-[50px] sm:min-h-[60px] max-h-[200px] resize-none text-sm sm:text-base"
        />
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] shrink-0"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Wskazówka */}
      <p className="text-xs text-muted-foreground italic px-1">
        💡 Pytaj ogólnie, np. "Czy pracodawca może odmówić urlopu?" zamiast "Czy Jan Kowalski może mi odmówić urlopu?"
      </p>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';
