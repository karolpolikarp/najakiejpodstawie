import { Scale, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Scale className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">JakiePrawo.pl</h1>
              <p className="text-sm text-muted-foreground">Wyszukiwarka podstaw prawnych</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Polityka prywatności</h1>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Twoja prywatność jest dla nas ważna. Ten dokument wyjaśnia, jakie dane zbieramy i jak je wykorzystujemy.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Jakie dane zbieramy?</h2>

              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">✓ Gwarancja prywatności</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>NIE zapisujemy treści Twoich pytań</strong>, <strong>NIE gromadzimy danych osobowych</strong>
                  i <strong>NIE stosujemy śledzących cookies</strong>. Twoje rozmowy z asystentem prawnym pozostają prywatne.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Dane, które NIE zbieramy:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Treść pytań i odpowiedzi</strong> - nie są zapisywane na naszych serwerach</li>
                <li><strong>Dane osobowe</strong> - nie zbieramy imienia, nazwiska, adresu email, numeru telefonu</li>
                <li><strong>Aktywność użytkownika</strong> - nie śledzimy Twoich działań poza aplikacją</li>
                <li><strong>Cookies śledzące</strong> - nie używamy plików cookie do śledzenia lub profilowania</li>
                <li><strong>Dane geolokalizacyjne</strong> - nie zbieramy informacji o Twojej lokalizacji</li>
                <li><strong>Metadane rozmów</strong> - nie zapisujemy historii zapytań na serwerze</li>
                <li>Nie sprzedajemy ani nie udostępniamy żadnych danych osobom trzecim</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Dane techniczne (przechowywane lokalnie):</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Historia czatu</strong> - zapisywana tylko w Twojej przeglądarce (localStorage), nie wysyłamy jej na serwer</li>
                <li><strong>Sesja logowania</strong> - informacja czy jesteś zalogowany (localStorage)</li>
                <li><strong>Preferencje motywu</strong> - wybór jasnego/ciemnego motywu (localStorage)</li>
                <li>Możesz wyczyścić te dane w każdej chwili używając przycisku "Usuń wszystkie dane lokalne" w aplikacji</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Usługi zewnętrzne</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Aplikacja korzysta z następujących usług zewnętrznych:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Anthropic Claude (AI)</h3>
                  <p className="text-sm text-muted-foreground">
                    Twoje pytania są wysyłane do API Anthropic w celu wygenerowania odpowiedzi.
                    Anthropic nie przechowuje treści zapytań dłużej niż 30 dni i nie używa ich do treningu modeli.
                    Zobacz: <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Polityka prywatności Anthropic</a>
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Supabase (infrastruktura)</h3>
                  <p className="text-sm text-muted-foreground">
                    Używamy Supabase do obsługi zapytań. Supabase może zbierać podstawowe logi techniczne (adres IP, czas zapytania).
                    Zobacz: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Polityka prywatności Supabase</a>
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Vercel (hosting)</h3>
                  <p className="text-sm text-muted-foreground">
                    Aplikacja hostowana jest na Vercel, który może zbierać podstawowe dane analityczne (kraj, przeglądarka).
                    Zobacz: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Polityka prywatności Vercel</a>
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Twoje prawa</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Zgodnie z RODO (Ogólne Rozporządzenie o Ochronie Danych) masz prawo do:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Dostępu do swoich danych</li>
                <li>Usunięcia swoich danych</li>
                <li>Sprostowania swoich danych</li>
                <li>Wniesienia sprzeciwu wobec przetwarzania</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Ponieważ nie gromadzimy Twoich danych na naszych serwerach, większość danych możesz usunąć samodzielnie
                czyszcząc historię przeglądarki lub klikając "Wyczyść" w aplikacji.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Retencja danych</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Informujemy o okresach przechowywania danych w kontekście ewentualnych przyszłych funkcji:
              </p>

              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Dane lokalne (localStorage):</h3>
                  <p className="text-sm text-muted-foreground">
                    Historia czatu, sesja logowania i preferencje motywu są przechowywane lokalnie w Twojej przeglądarce
                    <strong> bezterminowo</strong> do momentu ich ręcznego usunięcia przez Ciebie lub wyczyszczenia danych przeglądarki.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">W przypadku wprowadzenia funkcji logowania:</h3>
                  <p className="text-sm text-muted-foreground">
                    Jeśli w przyszłości wprowadzilibyśmy funkcję rejestracji i logowania użytkowników:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2 ml-4">
                    <li>Dane konta (email, hasło) byłyby przechowywane do czasu usunięcia konta</li>
                    <li>Historia rozmów (jeśli byłaby synchronizowana) - do 90 dni lub do usunięcia konta</li>
                    <li>Logi techniczne - maksymalnie 30 dni</li>
                    <li>Nieaktywne konta byłyby usuwane po 24 miesiącach braku aktywności</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Usługi zewnętrzne:</h3>
                  <p className="text-sm text-muted-foreground">
                    Dane przetwarzane przez usługi zewnętrzne (Anthropic, Supabase, Vercel) podlegają ich polityce retencji
                    - szczegóły w sekcji "Usługi zewnętrzne" powyżej.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Zgłaszanie naruszeń danych osobowych</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Twoja prywatność i bezpieczeństwo danych są dla nas priorytetem. W przypadku podejrzenia naruszenia
                ochrony danych osobowych lub incydentu bezpieczeństwa:
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-2">Jak zgłosić naruszenie?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-amber-700 dark:text-amber-300">
                  <li>Skontaktuj się z nami przez <Link to="/kontakt" className="underline font-medium">stronę kontaktu</Link></li>
                  <li>Wyślij email na adres: <a href="mailto:privacy@jakieprawo.pl" className="underline font-medium">privacy@jakieprawo.pl</a></li>
                  <li>W wiadomości opisz charakter podejrzanego naruszenia i podaj datę zdarzenia</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Nasze zobowiązanie:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Odpowiemy na zgłoszenie w ciągu <strong>72 godzin</strong></li>
                    <li>Przeprowadzimy wewnętrzne dochodzenie</li>
                    <li>Poinformujemy Cię o podjętych działaniach</li>
                    <li>W razie potwierdzonego naruszenia powiadomimy Urząd Ochrony Danych Osobowych zgodnie z RODO</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Prawo do skargi:</h3>
                  <p className="text-sm text-muted-foreground">
                    Masz prawo złożyć skargę do organu nadzorczego - Prezesa Urzędu Ochrony Danych Osobowych (UODO):
                    <br />
                    <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.uodo.gov.pl
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Bezpieczeństwo</h2>
              <p className="text-muted-foreground leading-relaxed">
                Aplikacja korzysta z szyfrowania HTTPS. Twoje zapytania są przesyłane bezpiecznie.
                Nie przechowujemy haseł ani danych logowania w niezabezpieczony sposób.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Zmiany w polityce</h2>
              <p className="text-muted-foreground leading-relaxed">
                Możemy aktualizować tę politykę. Zmiany będą publikowane na tej stronie z nową datą aktualizacji.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Kontakt</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pytania dotyczące prywatności? Skontaktuj się przez <Link to="/kontakt" className="text-primary hover:underline">stronę kontaktu</Link>.
              </p>
            </section>

            <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <p className="text-sm text-foreground">
                <strong>Podsumowanie:</strong> Nie zbieramy Twoich danych osobowych. Twoje pytania są przetwarzane przez AI,
                ale nie są przez nas przechowywane. Twoja historia czatu jest tylko w Twojej przeglądarce.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Button asChild variant="outline">
              <Link to="/">← Strona główna</Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/czat">Przejdź do wyszukiwarki</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
