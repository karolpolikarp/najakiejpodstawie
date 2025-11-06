import { useEffect, useRef } from 'react';
import { Scale, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ExampleQuestions } from '@/components/ExampleQuestions';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileUpload } from '@/components/FileUpload';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const { messages, isLoading, addMessage, removeMessage, clearMessages, setLoading, attachedFile, setAttachedFile } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRetry = (content: string) => {
    // Ponów wysłanie pytania
    handleSendMessage(content);
  };

  const handleRemoveMessage = (messageId: string) => {
    // Usuń wiadomość błędu oraz poprzedzające ją pytanie użytkownika
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex > 0 && messages[messageIndex - 1].role === 'user') {
      // Usuń poprzednie pytanie użytkownika
      removeMessage(messages[messageIndex - 1].id);
    }
    // Usuń wiadomość asystenta
    removeMessage(messageId);
  };

  const handleSendMessage = async (content: string) => {
    addMessage({ role: 'user', content });
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('legal-assistant', {
        body: {
          message: content,
          fileContext: attachedFile?.content || null,
        },
      });

      if (error) throw error;

      if (data?.message) {
        addMessage({ role: 'assistant', content: data.message });
      }
    } catch (error: any) {
      console.error('Error calling legal assistant:', error);
      toast.error('Nie udało się przetworzyć pytania');
      addMessage({
        role: 'assistant',
        content: 'Niestety coś poszło nie tak. Spróbuj zadać pytanie ponownie lub sformułuj je inaczej.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearMessages();
    toast.success('Historia rozmowy wyczyszczona');
  };

  const handleLogout = () => {
    localStorage.removeItem('app_authenticated');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-bold text-primary">NaJakiejPodstawie.pl</h1>
                <p className="text-sm text-muted-foreground">Wyszukiwarka podstaw prawnych</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  disabled={isLoading}
                  aria-label="Wyczyść historię rozmowy"
                  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Wyczyść
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Wyloguj się z aplikacji"
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-8" role="main">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="mb-6">
                <Scale className="h-16 w-16 text-primary mx-auto mb-4 animate-scale-in" aria-hidden="true" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Znajdź podstawę prawną
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-2">
                Wpisz pytanie zwykłym językiem, a wskażemy Ci konkretny artykuł ustawy
              </p>
              <p className="text-sm text-muted-foreground/70 mb-2">
                ⚡ Szybkie odpowiedzi • 📚 Polskie prawo • 🔒 Prywatne
              </p>
              <p className="text-xs text-muted-foreground/60 mb-10 max-w-2xl mx-auto">
                To narzędzie wspomagające, nie zastępuje porady prawnika
              </p>
              <ExampleQuestions onSelect={handleSendMessage} disabled={isLoading} />
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-8">
              <div className="space-y-4 mb-6" role="log" aria-live="polite" aria-label="Historia rozmowy">
                {messages.map((message, index) => {
                  // Znajdź poprzednie pytanie użytkownika dla wiadomości asystenta
                  let userContent: string | undefined;
                  if (message.role === 'assistant' && index > 0) {
                    const previousMessage = messages[index - 1];
                    if (previousMessage.role === 'user') {
                      userContent = previousMessage.content;
                    }
                  }

                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      messageId={message.id}
                      userContent={userContent}
                      onRetry={handleRetry}
                      onRemove={handleRemoveMessage}
                    />
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-assistant text-assistant-foreground border border-border rounded-lg p-5 max-w-[85%]" role="status" aria-live="polite">
                      <div className="flex items-center gap-3 mb-3">
                        <Scale className="h-5 w-5 text-primary animate-pulse" aria-hidden="true" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {attachedFile ? 'Analizuję załączony dokument...' : 'Przeszukuję polskie prawo...'}
                        </span>
                      </div>
                      <div className="space-y-2" aria-hidden="true">
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
              <FileUpload
                onFileLoad={(content, filename) => setAttachedFile({ content, name: filename })}
                onFileRemove={() => setAttachedFile(null)}
                currentFile={attachedFile?.name || null}
              />
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
