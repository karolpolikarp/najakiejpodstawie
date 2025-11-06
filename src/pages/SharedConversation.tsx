import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Message } from '@/store/chatStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SharedConversationData {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  view_count: number;
}

const SharedConversation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<SharedConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!id) {
        setError('Nieprawidłowy ID konwersacji');
        setIsLoading(false);
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

        if (!supabaseUrl) {
          throw new Error('Supabase URL is not configured');
        }

        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-shared-conversation?id=${id}`
        );

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 404) {
            setError('Konwersacja nie została znaleziona');
          } else if (response.status === 410) {
            setError('Ta konwersacja wygasła');
          } else {
            setError(errorData.error || 'Nie udało się pobrać konwersacji');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setConversation(data);
      } catch (error) {
        console.error('Error fetching shared conversation:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Wystąpił błąd podczas pobierania konwersacji'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  const handleGoBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-main">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold text-primary">NaJakiejPodstawie.pl</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Ładowanie konwersacji...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-main">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold text-primary">NaJakiejPodstawie.pl</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-3 sm:px-4 py-8 max-w-4xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleGoBack} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Wróć do strony głównej
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">
                  NaJakiejPodstawie.pl
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Udostępniona konwersacja</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Wróć</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Conversation Info */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {conversation.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Utworzono: {new Date(conversation.created_at).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' • '}
              Wyświetlenia: {conversation.view_count}
            </p>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 mb-6">
            {conversation.messages.map((message, index) => {
              // Find previous user question for assistant messages
              let userContent: string | undefined;
              if (message.role === 'assistant' && index > 0) {
                const previousMessage = conversation.messages[index - 1];
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
                  // Disable retry and remove actions on shared conversations
                  onRetry={undefined}
                  onRemove={undefined}
                />
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-8 p-6 bg-card border border-border rounded-lg text-center">
            <p className="text-muted-foreground mb-4">
              Chcesz zadać własne pytanie prawne?
            </p>
            <Button onClick={handleGoBack} size="lg" className="gap-2">
              <Scale className="h-5 w-5" />
              Przejdź do strony głównej
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SharedConversation;
