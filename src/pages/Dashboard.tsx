import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, MessageSquare, Clock, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useAnalytics();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Ładowanie statystyk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Błąd podczas ładowania danych: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} className="mt-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Brak danych do wyświetlenia. Zadaj kilka pytań, aby zobaczyć statystyki.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format daily statistics for chart
  const dailyChartData = [...data.dailyStatistics].reverse().map(stat => ({
    date: new Date(stat.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }),
    pytania: stat.total_questions,
    'z kontekstem': stat.questions_with_context,
  }));

  // Format most asked questions for chart
  const topQuestionsChartData = data.mostAskedQuestions.slice(0, 5).map(q => ({
    pytanie: q.question_text.length > 40 ? q.question_text.substring(0, 40) + '...' : q.question_text,
    liczba: q.ask_count,
  }));

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Statystyk</h1>
          <p className="text-muted-foreground">
            Przegląd użycia asystenta prawnego
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          Odśwież dane
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie pytania</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Łącznie zadanych pytań
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dzisiaj</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.questionsToday}</div>
            <p className="text-xs text-muted-foreground">
              Pytań zadanych dzisiaj
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Śr. czas odpowiedzi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.avgResponseTime / 1000).toFixed(2)}s</div>
            <p className="text-xs text-muted-foreground">
              Średni czas przetwarzania
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Z dokumentem</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.dailyStatistics.reduce((sum, stat) => sum + stat.questions_with_context, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pytań z załączonym dokumentem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Statistics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pytania w ostatnich 30 dniach</CardTitle>
            <CardDescription>
              Dzienna aktywność użytkowników
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pytania" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="z kontekstem" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Questions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 najczęściej zadawanych pytań</CardTitle>
            <CardDescription>
              Najpopularniejsze zapytania
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topQuestionsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="pytanie" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="liczba" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Asked Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Najczęściej zadawane pytania</CardTitle>
          <CardDescription>
            Lista wszystkich popularnych pytań
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.mostAskedQuestions.length > 0 ? (
              data.mostAskedQuestions.map((question, index) => (
                <div
                  key={question.question_hash}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-primary">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        zadane {question.ask_count} {question.ask_count === 1 ? 'raz' : 'razy'}
                      </span>
                    </div>
                    <p className="text-sm">{question.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ostatnio: {new Date(question.last_asked).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full w-12 h-12">
                    {question.ask_count}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Brak danych. Zadaj kilka pytań, aby zobaczyć statystyki.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
