import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Zapytaj np. 'jakie prawo pozwala mi zwrócić towar?'"
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
    </form>
  );
};
