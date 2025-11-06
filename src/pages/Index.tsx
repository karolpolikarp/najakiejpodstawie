import { useEffect, useRef, useState } from 'react';
import { Scale, Trash2, LogOut, Database, ArrowUp } from 'lucide-react';
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
import { CONSTANTS } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { messages, isLoading, addMessage, removeMessage, clearMessages, setLoading, attachedFile, setAttachedFile } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button when scrolled down more than 500px
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSendMessage = async (content: string, retryCount = 0) => {
    // Only add user message on first attempt
    if (retryCount === 0) {
      addMessage({ role: 'user', content });
      setLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke('legal-assistant', {
        body: {
          message: content,
          fileContext: attachedFile?.content || null,
        },
      });

      if (error) {
        // Check for specific error types
        const errorMessage = error.message?.toLowerCase() || '';

        // Rate limit error - retry with exponential backoff
        if ((errorMessage.includes('429') || errorMessage.includes('rate limit')) &&
            retryCount < CONSTANTS.API.MAX_RETRIES) {
          const delay = CONSTANTS.API.RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
          toast.info(`Zbyt wiele zapytań. Ponawiam za ${delay / 1000}s...`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return handleSendMessage(content, retryCount + 1);
        }

        // Network error - retry
        if ((errorMessage.includes('network') || errorMessage.includes('fetch')) &&
            retryCount < CONSTANTS.API.MAX_RETRIES) {
          const delay = CONSTANTS.API.RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
          toast.info(`Błąd połączenia. Ponawiam za ${delay / 1000}s...`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return handleSendMessage(content, retryCount + 1);
        }

        throw error;
      }

      if (data?.message) {
        addMessage({ role: 'assistant', content: data.message });
      } else {
        throw new Error('Brak odpowiedzi od asystenta');
      }
    } catch (error: any) {
      console.error('Error calling legal assistant:', error);
      const errorMessage = error.message?.toLowerCase() || '';

      // Specific error messages based on error type
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        toast.error('Przekroczono limit zapytań. Spróbuj za chwilę.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Błąd połączenia. Sprawdź połączenie z internetem.');
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        toast.error('Błąd autoryzacji. Skontaktuj się z administratorem.');
      } else if (errorMessage.includes('timeout')) {
        toast.error('Przekroczono limit czasu. Spróbuj ponownie.');
      } else {
        toast.error('Nie udało się przetworzyć pytania');
      }

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
    setAttachedFile(null);
    setShowClearDialog(false);
    toast.success('Historia rozmowy i załączniki wyczyszczone');
  };

  const handleLogout = () => {
    localStorage.removeItem('app_authenticated');
    window.location.reload();
  };

  const handleDeleteAllData = () => {
    const confirmed = window.confirm(
      'Czy na pewno chcesz usunąć wszystkie dane lokalne?\n\n' +
      'To działanie usunie:\n' +
      '• Historię czatu\n' +
      '• Sesję logowania\n' +
      '• Preferencje motywu\n' +
      '• Wszystkie inne dane przechowywane lokalnie\n\n' +
      'Ta operacja jest nieodwracalna.'
    );

    if (confirmed) {
      try {
        // Clear all localStorage data
        localStorage.clear();

        // Clear sessionStorage as well (in case any data is stored there)
        sessionStorage.clear();

        // Clear any Supabase-specific storage
        supabase.auth.signOut();

        toast.success('Wszystkie dane lokalne zostały usunięte');

        // Reload the page to reset the application state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error deleting local data:', error);
        toast.error('Wystąpił błąd podczas usuwania danych');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10" role="banner">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">NaJakiejPodstawie.pl</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Wyszukiwarka podstaw prawnych</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                  disabled={isLoading}
                  aria-label="Wyczyść historię rozmowy i załączniki"
                  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-8 w-8 sm:w-auto p-0 sm:px-3"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Wyczyść</span>
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAllData}
                aria-label="Usuń wszystkie dane lokalne"
                title="Usuń wszystkie dane lokalne (historia, ustawienia, sesja)"
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-8 w-8 p-0"
              >
                <Database className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Wyloguj się z aplikacji"
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8" role="main">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center mb-8 sm:mb-12 animate-fade-in px-2">
              <div className="mb-4 sm:mb-6">
                <Scale className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-3 sm:mb-4 animate-scale-in" aria-hidden="true" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Znajdź podstawę prawną
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2 px-2">
                Wpisz pytanie zwykłym językiem, a wskażemy Ci konkretny artykuł ustawy
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mb-2">
                ⚡ Szybkie odpowiedzi • 📚 Polskie prawo • 🔒 Prywatne
              </p>
              <p className="text-xs text-muted-foreground/60 mb-6 sm:mb-10 max-w-2xl mx-auto px-4">
                To narzędzie wspomagające, nie zastępuje porady prawnika
              </p>
              <ExampleQuestions onSelect={handleSendMessage} disabled={isLoading} />
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-8">
              <div ref={messagesStartRef} />
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
          <div className="sticky bottom-0 pb-2 sm:pb-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-3 sm:p-4 shadow-lg">
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="default"
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 shadow-lg rounded-full h-11 w-11 sm:h-12 sm:w-12"
          aria-label="Przewiń do góry"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wyczyścić historię rozmowy?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja usunie całą historię rozmowy oraz załączone pliki. Operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat}>
              Wyczyść
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
