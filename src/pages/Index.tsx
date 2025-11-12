import { useEffect, useRef, useState } from 'react';
import { Scale, Trash2, LogOut, Database, ArrowUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import { logger } from '@/lib/logger';
import { StorageKeys, removeStorageItem, clearAllStorage } from '@/lib/storage';
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
import { useChatAPI } from '@/hooks/useChatAPI';
import { usePremium } from '@/hooks/usePremium';
import { useFeedback } from '@/hooks/useFeedback';

const Index = () => {
  // Store hooks
  const { messages, isLoading, removeMessage, clearMessages, attachedFile, setAttachedFile } = useChatStore();

  // Custom hooks
  const { sendMessage } = useChatAPI();
  const {
    usePremiumModel,
    isPremiumUnlocked,
    showPremiumDialog,
    premiumPassword,
    setPremiumPassword,
    handlePremiumToggle,
    handlePremiumPassword,
    closePremiumDialog,
  } = usePremium();
  const { submitFeedback } = useFeedback();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoScrollRef = useRef(true);

  // Local state
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sprawdź czy użytkownik jest blisko dołu strony
  const isNearBottom = () => {
    const threshold = 150; // piksele od dołu
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    return pageHeight - scrollPosition < threshold;
  };

  // Śledź czy użytkownik przewinął w górę
  useEffect(() => {
    const handleScroll = () => {
      // Jeśli użytkownik jest blisko dołu, włącz auto-scroll
      // Jeśli przewinął w górę, wyłącz
      shouldAutoScrollRef.current = isNearBottom();

      // Pokaż przycisk scroll-to-top
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll podczas streamowania - jak w Claude
  useEffect(() => {
    // Przewijaj tylko gdy:
    // 1. Trwa streaming (isLoading) ALBO dodano nową wiadomość
    // 2. Użytkownik nie przewinął w górę (shouldAutoScrollRef = true)
    if (shouldAutoScrollRef.current) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50); // Krótkie opóźnienie dla płynności

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading]);

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
    // Retry sending question
    sendMessage(content, usePremiumModel);
  };

  const handleRemoveMessage = (messageId: string) => {
    // Remove error message and preceding user question
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex > 0 && messages[messageIndex - 1].role === 'user') {
      // Remove previous user question
      removeMessage(messages[messageIndex - 1].id);
    }
    // Remove AI message
    removeMessage(messageId);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content, usePremiumModel);
  };

  const handleClearChat = () => {
    clearMessages();
    setAttachedFile(null);
    setShowClearDialog(false);
    toast.success('Historia rozmowy i załączniki wyczyszczone');
  };

  const handleLogout = () => {
    removeStorageItem(StorageKeys.APP_AUTHENTICATED);
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
        clearAllStorage();

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
        logger.error('Error deleting local data:', error);
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
                      onFeedback={submitFeedback}
                      onSendMessage={handleSendMessage}
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
              {/* File Upload and Clear Button Row */}
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex-1">
                  <FileUpload
                    onFileLoad={(content, filename) => setAttachedFile({ content, name: filename })}
                    onFileRemove={() => setAttachedFile(null)}
                    currentFile={attachedFile?.name || null}
                  />
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearDialog(true)}
                    disabled={isLoading}
                    aria-label="Wyczyść historię rozmowy i załączniki"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-8 hover:bg-primary/10 whitespace-nowrap"
                  >
                    <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Wyczyść konwersację</span>
                    <span className="sm:hidden">Wyczyść</span>
                  </Button>
                )}
              </div>

              {/* Premium Model Toggle */}
              <div className="flex items-center gap-2 mb-2 sm:mb-3 px-1">
                <Checkbox
                  id="premium-model"
                  checked={usePremiumModel}
                  onCheckedChange={handlePremiumToggle}
                  disabled={isLoading}
                />
                <label
                  htmlFor="premium-model"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Tryb Premium (Sonnet 4.5 - wolniejszy, dokładniejszy) {isPremiumUnlocked && '🔓'}</span>
                </label>
              </div>

              <ChatInput onSend={handleSendMessage} disabled={isLoading} />

              {/* AI Disclaimer - AI Act Art. 13 compliance */}
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  🤖 Wyjaśnienia przepisów, NIE porady prawne •
                  Odpowiedzi AI (Anthropic) wymagają weryfikacji •
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

      {/* Premium Password Dialog */}
      <AlertDialog open={showPremiumDialog} onOpenChange={closePremiumDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Tryb Premium
            </AlertDialogTitle>
            <AlertDialogDescription>
              Wprowadź hasło aby odblokować tryb Premium z modelem Sonnet 4.5.
              <br />
              Sonnet 4.5 jest wolniejszy ale bardziej dokładny i szczegółowy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handlePremiumPassword(premiumPassword);
          }}>
            <div className="py-4">
              <Input
                type="password"
                placeholder="Wprowadź hasło..."
                value={premiumPassword}
                onChange={(e) => setPremiumPassword(e.target.value)}
                className="text-center"
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closePremiumDialog}>
                Anuluj
              </AlertDialogCancel>
              <Button type="submit">
                Odblokuj Premium
              </Button>
            </AlertDialogFooter>
          </form>
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
