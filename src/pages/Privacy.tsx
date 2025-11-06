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
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cookies i localStorage</h2>

              <h3 className="text-lg font-semibold text-foreground mb-2">Czym jest localStorage?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                LocalStorage to technologia podobna do cookies, która pozwala przechowywać dane w Twojej przeglądarce.
                Dane te <strong>nie są wysyłane na serwer</strong> i pozostają tylko na Twoim urządzeniu.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Co zapisujemy w localStorage?</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Akceptacja regulaminu i cookies</strong> - informacja, że zaakceptowałeś regulamin i komunikat o cookies</li>
                <li><strong>Historia czatu</strong> - Twoje pytania i odpowiedzi AI (tylko lokalnie, nigdy nie wysyłane na serwer)</li>
                <li><strong>Preferencje motywu</strong> - wybór jasnego lub ciemnego motywu strony</li>
                <li><strong>Sesja</strong> - informacja czy jesteś zalogowany (jeśli funkcja logowania jest aktywna)</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Czy używamy cookies śledzących?</h3>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>NIE.</strong> Nie używamy cookies marketingowych, analitycznych ani śledzących.
                  Nie profilujemy użytkowników i nie przekazujemy danych do Google Analytics, Facebook Pixel ani podobnych narzędzi.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Cookies techniczne niezbędne</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Używamy wyłącznie <strong>cookies technicznych niezbędnych</strong> do działania serwisu:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
                <li>Zapamiętanie preferencji użytkownika (motyw)</li>
                <li>Zapisanie historii czatu lokalnie</li>
                <li>Informacja o akceptacji regulaminu</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Zgodnie z dyrektywą ePrivacy (2002/58/WE) i RODO, cookies niezbędne do świadczenia usługi
                <strong> nie wymagają zgody użytkownika</strong>. Mimo to informujemy o nich transparentnie.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Jak usunąć localStorage?</h3>
              <p className="text-sm text-muted-foreground mb-2">Możesz usunąć dane localStorage na kilka sposobów:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Kliknij przycisk <strong>"Usuń wszystkie dane lokalne"</strong> w aplikacji (ikona bazy danych w górnym menu)</li>
                <li>Wyczyść historię przeglądarki i dane stron</li>
                <li>Użyj narzędzi deweloperskich przeglądarki (F12 → Application → Local Storage)</li>
              </ol>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Przetwarzanie przez sztuczną inteligencję (AI)</h2>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ WAŻNE OSTRZEŻENIE</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  <strong>NIE PRZESYŁAJ DANYCH OSOBOWYCH</strong> do serwisu. Twoje pytania są przetwarzane przez
                  system sztucznej inteligencji Anthropic Claude. Mimo że Anthropic zapewnia zgodność z RODO i nie wykorzystuje
                  danych do treningu modeli, przesyłanie danych osobowych osób trzecich bez ich zgody narusza RODO.
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Ponosisz pełną odpowiedzialność</strong> za treści, które przesyłasz do serwisu.
                  Zanim wgrasz dokument lub zadasz pytanie, upewnij się, że nie zawiera danych osobowych
                  (imiona, nazwiska, PESEL, NIP, adresy, itp.) lub uzyskaj zgodę osób, których dotyczą.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Administrator i Procesor danych:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Administrator danych:</strong> JakiePrawo.pl - odpowiada za przetwarzanie danych w serwisie</li>
                <li><strong>Procesor danych (Podprocesor):</strong> Anthropic PBC (USA) - przetwarza dane w celu generowania odpowiedzi AI</li>
                <li><strong>Model AI:</strong> Claude (system AI ogólnego przeznaczenia w rozumieniu AI Act)</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Podstawa prawna przetwarzania:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Art. 6 ust. 1 lit. a RODO</strong> - zgoda użytkownika (akceptacja przy pierwszym użyciu serwisu)</li>
                <li><strong>Art. 6 ust. 1 lit. f RODO</strong> - prawnie uzasadniony interes administratora (świadczenie usługi AI)</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Jak są przetwarzane Twoje dane:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Wpisujesz pytanie lub załączasz plik w serwisie JakiePrawo.pl</li>
                <li>Treść jest wysyłana przez nasze serwery (Supabase) do API Anthropic</li>
                <li>Anthropic Claude analizuje pytanie i generuje odpowiedź</li>
                <li>Odpowiedź jest wyświetlana w Twojej przeglądarce</li>
                <li>Historia rozmowy jest zapisywana <strong>tylko lokalnie w Twojej przeglądarce</strong></li>
                <li>Anthropic przechowuje dane przez max. 30 dni w celach bezpieczeństwa, potem są trwale usuwane</li>
              </ol>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Gwarancje Anthropic:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>✅ <strong>Zero Retention</strong> - dane użytkowników API nie są wykorzystywane do treningu modeli AI</li>
                <li>✅ <strong>GDPR Compliant</strong> - zgodność z europejskim RODO</li>
                <li>✅ <strong>Data Processing Addendum (DPA)</strong> - umowa powierzenia przetwarzania danych</li>
                <li>✅ <strong>30-dniowa retencja</strong> - dane usuwane po 30 dniach</li>
                <li>Zobacz: <a href="https://www.anthropic.com/legal/commercial-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Commercial Terms Anthropic</a></li>
                <li>Zobacz: <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Polityka prywatności Anthropic</a></li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Zgodność z AI Act (Rozporządzenie UE 2024/1689)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nasz system AI spełnia wymogi transparentności określone w AI Act:
              </p>

              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Art. 13 AI Act</strong> - Informujemy, że korzystasz z systemu AI (Anthropic Claude)</li>
                <li><strong>Transparentność</strong> - Wszystkie odpowiedzi są oznaczone jako generowane przez AI</li>
                <li><strong>Nadzór człowieka</strong> - Odpowiedzi AI wymagają weryfikacji przez prawnika</li>
                <li><strong>Nie jest systemem wysokiego ryzyka</strong> - nasz system nie podejmuje automatycznych decyzji prawnych</li>
                <li><strong>GPAI (General Purpose AI)</strong> - Anthropic Claude jest modelem AI ogólnego przeznaczenia</li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Ważne:</strong> Serwis JakiePrawo.pl nie zastępuje profesjonalnej porady prawnej.
                  Odpowiedzi AI służą wyłącznie celom informacyjnym i edukacyjnym. Przed podjęciem jakichkolwiek
                  decyzji prawnych skonsultuj się z wykwalifikowanym prawnikiem.
                </p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Inne usługi zewnętrzne</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Oprócz Anthropic Claude, aplikacja korzysta z następujących usług zewnętrznych:
              </p>

              <div className="space-y-4">
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Twoje prawa</h2>
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Retencja danych</h2>
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Zgłaszanie naruszeń danych osobowych</h2>
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Bezpieczeństwo</h2>
              <p className="text-muted-foreground leading-relaxed">
                Aplikacja korzysta z szyfrowania HTTPS. Twoje zapytania są przesyłane bezpiecznie.
                Nie przechowujemy haseł ani danych logowania w niezabezpieczony sposób.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Zmiany w polityce</h2>
              <p className="text-muted-foreground leading-relaxed">
                Możemy aktualizować tę politykę. Zmiany będą publikowane na tej stronie z nową datą aktualizacji.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Kontakt</h2>
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
