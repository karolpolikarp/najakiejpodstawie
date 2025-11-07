import { useState, useEffect } from 'react';
import { Database, Search, FileText, Calendar, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserQuestion {
  id: string;
  question: string;
  answer: string;
  has_file_context: boolean;
  file_name: string | null;
  session_id: string | null;
  user_agent: string;
  response_time_ms: number | null;
  created_at: string;
  feedback: 'positive' | 'negative' | null;
  message_id: string | null;
}

interface Statistics {
  total_questions: number;
  questions_with_files: number;
  positive_feedback: number;
  negative_feedback: number;
}

const Admin = () => {
  const [questions, setQuestions] = useState<UserQuestion[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const pageSize = 20;

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-questions', {
        body: {
          limit: pageSize,
          offset: currentPage * pageSize,
          search: searchQuery,
        },
      });

      if (error) {
        console.error('Error fetching questions:', error);
        toast.error('Nie udało się pobrać pytań');
        return;
      }

      setQuestions(data.data || []);
      setTotalQuestions(data.pagination?.total || 0);
      setStatistics(data.statistics || null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Wystąpił błąd podczas pobierania danych');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const totalPages = Math.ceil(totalQuestions / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Panel Administracyjny</h1>
            </div>
            <p className="text-muted-foreground">
              Przeglądaj wszystkie pytania użytkowników i odpowiedzi AI
            </p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Wszystkie pytania
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{statistics.total_questions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Z załącznikami
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{statistics.questions_with_files}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bez załączników
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statistics.total_questions - statistics.questions_with_files}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Pozytywne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{statistics.positive_feedback}</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Negatywne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700">{statistics.negative_feedback}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj w pytaniach i odpowiedziach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Questions List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Ładowanie pytań...</p>
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Brak pytań do wyświetlenia</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <Card key={q.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">Pytanie</CardTitle>
                        <CardDescription className="text-base text-foreground whitespace-pre-wrap">
                          {q.question}
                        </CardDescription>
                      </div>
                      {q.has_file_context && (
                        <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Z załącznikiem</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Odpowiedź:</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                        {q.answer}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(q.created_at)}</span>
                      </div>
                      {q.response_time_ms && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{(q.response_time_ms / 1000).toFixed(2)}s</span>
                        </div>
                      )}
                      {q.feedback && (
                        <div className={`flex items-center gap-1 ${
                          q.feedback === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {q.feedback === 'positive' ? (
                            <ThumbsUp className="h-3 w-3" />
                          ) : (
                            <ThumbsDown className="h-3 w-3" />
                          )}
                          <span>{q.feedback === 'positive' ? 'Pozytywny' : 'Negatywny'}</span>
                        </div>
                      )}
                      {q.session_id && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">
                            Sesja: {q.session_id.substring(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || isLoading}
              >
                Poprzednia
              </Button>
              <span className="text-sm text-muted-foreground">
                Strona {currentPage + 1} z {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || isLoading}
              >
                Następna
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
