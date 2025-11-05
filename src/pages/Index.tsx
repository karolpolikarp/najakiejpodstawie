import { useEffect, useRef } from 'react';
import { Scale, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ExampleQuestions } from '@/components/ExampleQuestions';
import { Footer } from '@/components/Footer';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const { messages, isLoading, addMessage, clearMessages, setLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    addMessage({ role: 'user', content });
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('legal-assistant', {
        body: { message: content },
      });

      if (error) throw error;

      if (data?.message) {
        addMessage({ role: 'assistant', content: data.message });
      }
    } catch (error: any) {
      console.error('Error calling legal assistant:', error);
      toast.error('Wystąpił błąd podczas przetwarzania zapytania');
      addMessage({
        role: 'assistant',
        content: 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearMessages();
    toast.success('Czat wyczyszczony');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">NaJakiejPodstawie.pl</h1>
                <p className="text-sm text-muted-foreground">Znajdź podstawę prawną w 5 sekund</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Wyczyść
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="mb-6">
                <Scale className="h-16 w-16 text-primary mx-auto mb-4 animate-scale-in" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Witaj w asystencie prawnym
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-2">
                Zadaj pytanie, a znajdę dla Ciebie podstawę prawną
              </p>
              <p className="text-sm text-muted-foreground/70 mb-10">
                ⚡ Odpowiedzi w kilka sekund • 📚 Polskie prawo • 🔒 Bezpieczne
              </p>
              <ExampleQuestions onSelect={handleSendMessage} disabled={isLoading} />
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-8">
              <div className="space-y-4 mb-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} role={message.role} content={message.content} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-assistant text-assistant-foreground border border-border rounded-lg p-5 max-w-[85%]">
                      <div className="flex items-center gap-3 mb-3">
                        <Scale className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-muted-foreground">Szukam podstawy prawnej...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded animate-pulse w-full" />
                        <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                        <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <ExampleQuestions onSelect={handleSendMessage} disabled={isLoading} />
            </div>
          )}

          {/* Chat Input */}
          <div className="sticky bottom-0 pb-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-4 shadow-lg">
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
