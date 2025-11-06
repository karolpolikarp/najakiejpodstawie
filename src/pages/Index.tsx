import { useEffect, useRef, useState } from 'react';
import { Scale, Trash2, LogOut, Database, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ExampleQuestions } from '@/components/ExampleQuestions';
import { Footer } from '@/components/Footer';
import { FileUpload } from '@/components/FileUpload';
import { GDPRWarningModal } from '@/components/GDPRWarningModal';
import { AINoticeBanner } from '@/components/AINoticeBanner';
import { CookieBanner } from '@/components/CookieBanner';
import { Header } from '@/components/Header';
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
  const { messages, isLoading, addMessage, updateMessageContent, removeMessage, clearMessages, setLoading, attachedFile, setAttachedFile, setMessageFeedback } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLastMessage = () => {
    // Sprawdź czy są wiadomości
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // Jeśli ostatnia wiadomość to odpowiedź AI, przewiń do jej początku
    // żeby użytkownik mógł czytać od góry
    if (lastMessage.role === 'assistant') {
      // Użyj querySelector żeby znaleźć ostatni element wiadomości
      const messageElements = document.querySelectorAll('[role="log"] > div');
      const lastElement = messageElements[messageElements.length - 1];

      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Dla wiadomości użytkownika przewiń normalnie na dół
      scrollToBottom();
    }
  };

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button when scrolled down more than 500px
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-clear attached file after 15 minutes of inactivity
  useEffect(() => {
    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Only set timer if file is attached
      if (attachedFile) {
        inactivityTimerRef.current = setTimeout(() => {
          setAttachedFile(null);
          toast.info('Załączony dokument został automatycznie usunięty po 15 minutach bezczynności');
        }, 15 * 60 * 1000); // 15 minutes in milliseconds
      }
    };

    // Reset timer on any activity (messages, loading state change)
    resetInactivityTimer();

    // Cleanup on unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [attachedFile, messages, isLoading, setAttachedFile]);

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
    // Usuń wiadomość AI
    removeMessage(messageId);
  };

  const handleFeedback = async (messageId: string, feedbackType: 'positive' | 'negative' | null) => {
    // Update local state immediately for better UX
    setMessageFeedback(messageId, feedbackType);

    // If feedback is removed, we don't need to send to backend
    if (feedbackType === null) {
      return;
    }

    // Find the message and previous user message for context
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    const message = messages[messageIndex];
    const previousUserMessage = messageIndex > 0 && messages[messageIndex - 1].role === 'user'
      ? messages[messageIndex - 1]
      : null;

    try {
      const { error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          messageId,
          feedbackType,
          userQuestion: previousUserMessage?.content,
          assistantResponse: message?.content,
          sessionId: localStorage.getItem('session_id') || undefined,
        },
      });

      if (error) {
        console.error('Error submitting feedback:', error);
        // Don't show error to user - feedback is saved locally anyway
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Don't show error to user - feedback is saved locally anyway
    }
  };

  const handleSendMessage = async (content: string, retryCount = 0) => {
    // Only add user message on first attempt
    if (retryCount === 0) {
      addMessage({ role: 'user', content });
      setLoading(true);
    }

    // DEBUG LOGS
    console.log('=== SENDING MESSAGE DEBUG ===');
    console.log('Message:', content);
    console.log('AttachedFile exists:', !!attachedFile);
    console.log('AttachedFile name:', attachedFile?.name);
    console.log('AttachedFile content length:', attachedFile?.content?.length || 0);
    if (attachedFile?.content) {
      console.log('AttachedFile content preview (first 200 chars):', attachedFile.content.substring(0, 200));
    }

    // Create a temporary message ID for streaming updates
    const tempMessageId = crypto.randomUUID();
    let streamedContent = '';

    try {
      // Get Supabase URL and auth token
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      // Debug logs
      console.log('=== AUTH DEBUG ===');
      console.log('Supabase URL:', supabaseUrl);
      console.log('Has anonKey:', !!anonKey);
      console.log('Has session:', !!session);
      console.log('Session access token:', session?.access_token ? 'exists' : 'none');

      // Make a direct fetch call to support streaming
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      };

      // If user is authenticated, use their token for Authorization
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        // Otherwise use anon key for Authorization too
        headers['Authorization'] = `Bearer ${anonKey}`;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/legal-assistant`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          fileContext: attachedFile?.content || null,
        }),
      });

      if (!response.ok) {
        let errorData: { error?: string; details?: string } = {};

        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }

        const errorMessage = errorData.error || `HTTP error ${response.status}`;

        // Log detailed error for debugging
        console.error('API Error Details:', {
          status: response.status,
          message: errorMessage,
          details: errorData.details,
        });

        // Rate limit error - retry with exponential backoff
        if (response.status === 429 && retryCount < CONSTANTS.API.MAX_RETRIES) {
          const delay = CONSTANTS.API.RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
          toast.info(`Zbyt wiele zapytań. Ponawiam za ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return handleSendMessage(content, retryCount + 1);
        }

        // Bad request - show specific error message
        if (response.status === 400) {
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        throw new Error(errorMessage);
      }

      // Check if response is streaming (text/event-stream) or regular JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        // Add an empty assistant message that we'll update
        addMessage({ role: 'assistant', content: '' });

        // Get the last message ID (the one we just added)
        const currentMessages = useChatStore.getState().messages;
        const assistantMessageId = currentMessages[currentMessages.length - 1].id;

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('Stream ended. Total content length:', streamedContent.length);
              break;
            }

            // Decode chunk
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Process complete SSE messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.trim()) continue; // Skip empty lines

              if (line.startsWith('data: ')) {
                const data = line.slice(6); // Remove 'data: ' prefix

                // Skip [DONE] marker
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  console.log('Parsed SSE event:', parsed.type);

                  // Anthropic streaming format
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    streamedContent += parsed.delta.text;
                    updateMessageContent(assistantMessageId, streamedContent);
                  } else if (parsed.type === 'content_block_start') {
                    console.log('Content block started');
                  } else if (parsed.type === 'message_start') {
                    console.log('Message started');
                  }
                } catch (e) {
                  // Ignore JSON parse errors for malformed chunks
                  console.warn('Failed to parse SSE data:', data, e);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          throw streamError;
        }

        // If no content was streamed, throw an error
        if (!streamedContent) {
          console.error('No content was streamed!');
          throw new Error('Brak odpowiedzi');
        }

      } else {
        // Handle regular JSON response (fallback)
        console.log('Using fallback JSON response');
        const data = await response.json();

        if (data?.message) {
          addMessage({ role: 'assistant', content: data.message });
        } else {
          throw new Error('Brak odpowiedzi');
        }
      }

    } catch (error: any) {
      console.error('Error calling legal assistant:', error);
      const errorMessage = error.message?.toLowerCase() || '';

      // Specific error messages based on error type
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        toast.error('Przekroczono limit zapytań. Spróbuj za chwilę.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('failed to fetch')) {
        // Retry on network error
        if (retryCount < CONSTANTS.API.MAX_RETRIES) {
          const delay = CONSTANTS.API.RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
          toast.info(`Błąd połączenia. Ponawiam za ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return handleSendMessage(content, retryCount + 1);
        }
        toast.error('Błąd połączenia. Sprawdź połączenie z internetem.');
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        toast.error('Błąd autoryzacji. Skontaktuj się z administratorem.');
      } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
        // Already shown via toast in the error handling above
        toast.error(error.message || 'Nieprawidłowe zapytanie');
      } else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
        toast.error('Błąd serwera. Spróbuj ponownie za chwilę.');
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

        // Redirect to landing page instead of reloading to avoid 404 on /czat
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (error) {
        console.error('Error deleting local data:', error);
        toast.error('Wystąpił błąd podczas usuwania danych');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header
        showActions
        actions={
          <>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                disabled={isLoading}
                aria-label="Wyczyść historię rozmowy i załączniki"
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-8 w-8 sm:w-auto p-0 sm:px-3 hover:bg-primary/10"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Wyczyść</span>
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllData}
              aria-label="Usuń wszystkie dane lokalne"
              title="Usuń wszystkie dane lokalne (historia, ustawienia, sesja)"
              className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-8 w-8 p-0 shadow-soft hover:shadow-soft-lg transition-all"
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
          </>
        }
      />

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10" role="main">
        <div className="max-w-4xl mx-auto glass-card rounded-2xl shadow-soft-xl p-4 sm:p-6 md:p-8">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center mb-8 sm:mb-12 animate-fade-in px-2">
              <div className="mb-4 sm:mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                </div>
                <Scale className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-3 sm:mb-4 animate-scale-in relative z-10" aria-hidden="true" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text mb-3 sm:mb-4">
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
              <ExampleQuestions
                onSelect={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-8">
              <div ref={messagesStartRef} />
              {/* AI Notice Banner */}
              <AINoticeBanner />
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
                      feedback={message.feedback}
                      onRetry={handleRetry}
                      onRemove={handleRemoveMessage}
                      onFeedback={handleFeedback}
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
              <ExampleQuestions
                onSelect={handleSendMessage}
                disabled={isLoading}
                lastUserQuestion={messages.filter(m => m.role === 'user').slice(-1)[0]?.content}
              />
            </div>
          )}

          {/* Chat Input */}
          <div className="sticky bottom-0 pb-2 sm:pb-4">
            <div className="glass-card rounded-lg p-3 sm:p-4 shadow-soft-lg">
              <FileUpload
                onFileLoad={(content, filename) => setAttachedFile({ content, name: filename })}
                onFileRemove={() => setAttachedFile(null)}
                currentFile={attachedFile?.name || null}
              />
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />

              {/* AI Disclaimer - AI Act Art. 13 compliance */}
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  🤖 Odpowiedzi generowane przez AI (Anthropic) •
                  Wymaga weryfikacji prawnika •
                  Nie przesyłaj danych osobowych
                </p>
              </div>
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
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 shadow-soft-xl hover:shadow-glow rounded-full h-11 w-11 sm:h-12 sm:w-12 transition-all duration-300 hover:scale-110"
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

      {/* GDPR Warning Modal - shown on first visit */}
      <GDPRWarningModal />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default Index;
