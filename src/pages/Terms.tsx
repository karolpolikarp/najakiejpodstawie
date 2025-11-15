import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Regulamin Usługi</h1>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Niniejszy Regulamin określa zasady korzystania z serwisu JakiePrawo.pl.
                Korzystając z serwisu, akceptujesz postanowienia niniejszego Regulaminu.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Definicje</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Serwis</strong> - serwis internetowy JakiePrawo.pl dostępny pod adresem jakieprawo.pl</li>
                <li><strong>Usługodawca</strong> - właściciel i operator serwisu JakiePrawo.pl</li>
                <li><strong>Użytkownik</strong> - każda osoba korzystająca z serwisu</li>
                <li><strong>System AI</strong> - system sztucznej inteligencji Anthropic wykorzystywany do generowania odpowiedzi</li>
                <li><strong>Treści</strong> - pytania, załączone pliki i inne dane przesyłane przez Użytkownika</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Charakter usługi</h2>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Ważne:</strong> Serwis JakiePrawo.pl jest narzędziem informacyjnym i edukacyjnym.
                  <strong> NIE świadczymy usług prawnych</strong> i <strong>NIE zastępujemy porady prawnika</strong>.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Serwis służy do:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Wyszukiwania podstaw prawnych w polskim prawie (artykuły, ustawy, rozporządzenia)</li>
                <li>Dostarczania ogólnych wyjaśnień przepisów prawnych</li>
                <li>Edukacji prawnej i zwiększania świadomości prawnej</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Serwis NIE służy do:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Udzielania porad prawnych w konkretnych sprawach</li>
                <li>Interpretowania indywidualnych sytuacji użytkowników</li>
                <li>Doradzania konkretnych działań prawnych ("w Twoim przypadku powinieneś...")</li>
                <li>Zastępowania profesjonalnej obsługi prawnej</li>
                <li>Podejmowania wiążących decyzji prawnych bez konsultacji z prawnikiem</li>
                <li>Reprezentowania w postępowaniach sądowych lub administracyjnych</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Wykorzystanie AI i ograniczenia</h2>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Odpowiedzi generowane przez AI</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Wszystkie odpowiedzi są generowane przez system sztucznej inteligencji (Anthropic).
                  AI może popełniać błędy, generować nieprecyzyjne lub nieaktualne informacje.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Użytkownik zobowiązuje się do:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Weryfikacji wszystkich informacji uzyskanych z serwisu</li>
                <li>Konsultacji z wykwalifikowanym prawnikiem przed podjęciem decyzji prawnych</li>
                <li>Traktowania odpowiedzi AI jako materiału pomocniczego, nie jako porady prawnej</li>
                <li>Sprawdzenia aktualności przepisów prawnych we właściwych źródłach</li>
              </ul>

              <p className="text-sm text-muted-foreground mt-4">
                <strong>Usługodawca nie ponosi odpowiedzialności</strong> za decyzje podjęte na podstawie informacji
                uzyskanych z serwisu. Odpowiedzi AI mogą być niekompletne, nieaktualne lub błędne.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Zakaz przesyłania danych osobowych</h2>

              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">🚫 WAŻNE - Zakaz przesyłania danych osobowych</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <strong>Zabrania się</strong> przesyłania do serwisu danych osobowych osób trzecich bez ich wyraźnej zgody.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Użytkownik NIE MOŻE przesyłać:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Imion, nazwisk, adresów zamieszkania</li>
                <li>Numerów PESEL, NIP, dowodu osobistego, paszportu</li>
                <li>Numerów telefonów, adresów email osób trzecich</li>
                <li>Danych medycznych, finansowych, wrażliwych</li>
                <li>Skanów, zdjęć dokumentów zawierających dane osobowe</li>
                <li>Umów, faktur, pism procesowych z danymi identyfikującymi osoby</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Jeśli musisz odnieść się do konkretnej sytuacji:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Zanonimizuj wszystkie dane osobowe (użyj "Osoba A", "Pracownik", "[DANE USUNIĘTE]")</li>
                <li>Usuń nazwiska, adresy, numery identyfikacyjne przed przesłaniem dokumentu</li>
                <li>Zadawaj pytania w sposób ogólny, bez odniesień do konkretnych osób</li>
              </ul>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Odpowiedzialność Użytkownika:</strong> Przesyłając Treści do serwisu, Użytkownik oświadcza i gwarantuje, że:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-700 dark:text-amber-300 mt-2 ml-4">
                  <li>Nie zawierają one danych osobowych osób trzecich LUB</li>
                  <li>Posiada wyraźną zgodę na przetwarzanie tych danych zgodnie z RODO</li>
                  <li>Ponosi pełną odpowiedzialność prawną i finansową za naruszenie RODO</li>
                </ul>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Dozwolone użycie serwisu</h2>

              <h3 className="text-lg font-semibold text-foreground mb-2">Użytkownik ma prawo do:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Zadawania pytań prawnych sformułowanych w sposób ogólny</li>
                <li>Przesyłania zanonimizowanych dokumentów do analizy</li>
                <li>Korzystania z odpowiedzi AI jako materiału pomocniczego</li>
                <li>Zapisywania odpowiedzi w przeglądarce (localStorage)</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Zabrania się:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Przesyłania danych osobowych bez zgody (patrz punkt 4)</li>
                <li>Wykorzystywania serwisu do celów niezgodnych z prawem</li>
                <li>Prób ingerencji w system, hakowania, przeprowadzania ataków</li>
                <li>Nadmiernego obciążania serwisu (spam, automated requests)</li>
                <li>Wykorzystywania odpowiedzi jako oficjalnych porad prawnych</li>
                <li>Kopiowania, rozpowszechniania treści z naruszeniem praw autorskich</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Odpowiedzialność</h2>

              <h3 className="text-lg font-semibold text-foreground mb-2">Usługodawca NIE PONOSI odpowiedzialności za:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Błędy, nieścisłości lub nieaktualności w odpowiedziach AI</li>
                <li>Decyzje podjęte na podstawie informacji z serwisu</li>
                <li>Szkody wynikłe z korzystania lub niemożności korzystania z serwisu</li>
                <li>Naruszenie RODO przez Użytkownika (przesłanie danych osobowych)</li>
                <li>Utratę danych zapisanych lokalnie w przeglądarce Użytkownika</li>
                <li>Przerwy w działaniu serwisu, awarie techniczne</li>
                <li>Działania systemów zewnętrznych (Anthropic, Supabase, Vercel)</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Użytkownik ponosi odpowiedzialność za:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Zgodność przesyłanych Treści z prawem, w tym RODO</li>
                <li>Szkody wyrządzone Usługodawcy lub osobom trzecim w wyniku naruszenia Regulaminu</li>
                <li>Decyzje podjęte na podstawie odpowiedzi AI bez weryfikacji prawnika</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Przetwarzanie danych</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Szczegółowe informacje o przetwarzaniu danych osobowych, w tym roli Anthropic jako procesora danych,
                znajdują się w <Link to="/polityka-prywatnosci" className="text-primary hover:underline">Polityce Prywatności</Link>.
              </p>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Kluczowe informacje:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2 ml-4">
                  <li>Administrator danych: JakiePrawo.pl</li>
                  <li>Procesor danych: Anthropic PBC (USA)</li>
                  <li>Podstawa prawna: zgoda użytkownika (art. 6 ust. 1 lit. a RODO)</li>
                  <li>Retencja danych przez Anthropic: max. 30 dni</li>
                  <li>Dane nie są wykorzystywane do treningu AI</li>
                </ul>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Prawo odstąpienia i wycofania zgody</h2>

              <h3 className="text-lg font-semibold text-foreground mb-2">Użytkownik ma prawo do:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Zaprzestania korzystania z serwisu w każdej chwili</li>
                <li>Usunięcia historii czatu (przycisk "Wyczyść" w aplikacji)</li>
                <li>Usunięcia wszystkich danych lokalnych (przycisk "Usuń wszystkie dane lokalne")</li>
                <li>Wycofania zgody na przetwarzanie danych (skutkuje niemożnością korzystania z serwisu)</li>
              </ul>

              <p className="text-sm text-muted-foreground">
                <strong>Uwaga:</strong> Dane już przesłane do Anthropic mogą być przechowywane przez max. 30 dni
                zgodnie z polityką Anthropic, nawet po wycofaniu zgody.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Zmiany regulaminu</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Usługodawca zastrzega sobie prawo do zmiany Regulaminu w każdym czasie.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Zmiany są publikowane na tej stronie z nową datą aktualizacji</li>
                <li>Korzystanie z serwisu po zmianie Regulaminu oznacza akceptację nowych postanowień</li>
                <li>W przypadku istotnych zmian Użytkownik zostanie poproszony o ponowną akceptację</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Postanowienia końcowe</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Regulamin obowiązuje od dnia publikacji</li>
                <li>W sprawach nieuregulowanych stosuje się przepisy prawa polskiego</li>
                <li>Spory rozstrzygane są przez sądy polskie właściwe dla siedziby Usługodawcy</li>
                <li>Jeśli którekolwiek postanowienie Regulaminu jest nieważne, pozostałe pozostają w mocy</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Kontakt</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pytania dotyczące Regulaminu? Skontaktuj się przez <Link to="/kontakt" className="text-primary hover:underline">stronę kontaktu</Link>.
              </p>
            </section>

            <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <p className="text-sm text-foreground">
                <strong>Podsumowanie:</strong> Korzystając z JakiePrawo.pl akceptujesz, że:
                • Odpowiedzi AI nie zastępują porady prawnika
                • Nie będziesz przesyłać danych osobowych bez zgody
                • Ponosisz odpowiedzialność za przesyłane treści
                • Weryfikujesz wszystkie informacje z prawnikiem przed podjęciem decyzji
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Button asChild variant="outline">
              <Link to="/">← Strona główna</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/polityka-prywatnosci">Polityka prywatności</Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/czat">Przejdź do wyszukiwarki</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
