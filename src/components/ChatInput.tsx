import { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

// Detekcja potencjalnych danych osobowych
const detectPII = (text: string): { detected: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // PESEL (11 cyfr)
  if (/\b\d{11}\b/.test(text)) {
    reasons.push('PESEL (11 cyfr)');
  }

  // NIP (10 cyfr lub format XXX-XXX-XX-XX)
  if (/\b\d{10}\b/.test(text) || /\b\d{3}-\d{3}-\d{2}-\d{2}\b/.test(text) || /\b\d{3}-\d{2}-\d{2}-\d{3}\b/.test(text)) {
    reasons.push('NIP');
  }

  // Email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    reasons.push('Adres email');
  }

  // Telefon (9 cyfr lub format z +48)
  if (/\b\d{9}\b/.test(text) || /\+48\s*\d{9}/.test(text)) {
    reasons.push('Numer telefonu');
  }

  // Kod pocztowy XX-XXX
  if (/\b\d{2}-\d{3}\b/.test(text)) {
    reasons.push('Kod pocztowy');
  }

  // Potencjalne pełne imię i nazwisko (dwa słowa z wielkiej litery obok siebie)
  if (/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b/.test(text)) {
    reasons.push('Potencjalne imię i nazwisko');
  }

  return {
    detected: reasons.length > 0,
    reasons
  };
};

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
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
};
