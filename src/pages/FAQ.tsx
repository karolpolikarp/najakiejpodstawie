import { Scale, HelpCircle, Shield, Globe, Brain, FileText, Lock, Euro, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FAQ = () => {
  const faqs = [
    {
      icon: Brain,
      question: "Czy JakiePrawo.pl to prawnik AI?",
      answer: (
        <>
          <p className="mb-2">
            <strong>Nie.</strong> JakiePrawo.pl to narzędzie informacyjne, które pomaga znaleźć podstawy prawne
            i wyjaśnia je prostym językiem.
          </p>
          <p className="mb-2"><strong>To NIE jest:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Porada prawna</li>
            <li>Analiza konkretnej sprawy</li>
            <li>Zastępstwo prawnika</li>
          </ul>
          <p className="mt-2">
            <strong>Zawsze skonsultuj się z prawnikiem</strong> w sprawach o istotnym znaczeniu prawnym.
          </p>
        </>
      ),
    },
    {
      icon: Lock,
      question: "Czy moje dane są bezpieczne?",
      answer: (
        <>
          <p className="mb-2">
            <strong>Tak.</strong> Stosujemy następujące zabezpieczenia:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✓ Szyfrowanie połączenia (HTTPS)</li>
            <li>✓ Minimalizacja przechowywanych danych</li>
            <li>✓ Automatyczne usuwanie po 30 dniach</li>
            <li>✓ Brak cookies śledzących</li>
          </ul>
          <p className="mt-2">
            <strong>Ale pamiętaj:</strong> NIE przesyłaj danych osobowych (PESEL, NIP, imion, adresów itp.).
          </p>
        </>
      ),
    },
    {
      icon: Globe,
      question: "Gdzie są przetwarzane moje zapytania?",
      answer: (
        <>
          <p className="mb-2">
            Zapytania są przetwarzane przez model AI firmy <strong>Anthropic PBC</strong> z USA.
          </p>
          <p className="mb-2"><strong>Zabezpieczenia:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Anthropic działa jako podmiot przetwarzający (GDPR processor)</li>
            <li>Obowiązuje Data Processing Agreement (DPA)</li>
            <li>Transfer danych zabezpieczony Standard Contractual Clauses (SCC)</li>
            <li><strong>Anthropic NIE trenuje swoich modeli na danych z API</strong></li>
          </ul>
          <p className="mt-2">
            <strong>Przechowywanie:</strong> maksymalnie 30 dni, potem automatyczne usunięcie.
          </p>
        </>
      ),
    },
    {
      icon: Brain,
      question: "Czy AI trenuje się na moich pytaniach?",
      answer: (
        <>
          <p className="mb-2">
            <strong>Nie.</strong> Anthropic API ma wyłączony trening na danych klientów.
          </p>
          <p className="mb-2">Twoje zapytania:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✓ Są używane TYLKO do udzielenia odpowiedzi</li>
            <li>✓ NIE są wykorzystywane do trenowania modeli AI</li>
            <li>✓ Są usuwane po 30 dniach</li>
          </ul>
        </>
      ),
    },
    {
      icon: FileText,
      question: "Czy mogę przesłać umowę/dokument do analizy?",
      answer: (
        <>
          <p className="mb-2">
            <strong>Nie.</strong> Z dwóch powodów:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li><strong>Ochrona prywatności:</strong> Dokumenty zawierają dane osobowe</li>
            <li><strong>Zakres usługi:</strong> Nie analizujemy konkretnych spraw</li>
          </ol>
          <p className="mt-2">
            Jeśli potrzebujesz analizy dokumentu, skonsultuj się z prawnikiem.
          </p>
        </>
      ),
    },
    {
      icon: Shield,
      question: "Co zrobić, jeśli przypadkowo przesłałem dane osobowe?",
      answer: (
        <>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Ważne:</strong> Dane są przetwarzane przez Anthropic (USA). Nie mamy bezpośredniego dostępu
              do tych danych ani możliwości ich natychmiastowego usunięcia.
            </p>
          </div>

          <p className="mb-3"><strong>Nie panikuj.</strong> Oto co się stanie:</p>

          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li><strong>Automatyczne usunięcie:</strong> Dane zostaną usunięte przez Anthropic po maksymalnie 30 dniach zgodnie z ich polityką retencji</li>
            <li><strong>Brak treningu AI:</strong> Anthropic nie używa danych z API do trenowania swoich modeli</li>
            <li><strong>Szyfrowane przesyłanie:</strong> Dane były przesłane przez bezpieczne połączenie HTTPS</li>
          </ul>

          <p className="mb-3"><strong>Co możesz zrobić:</strong></p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>Możesz <Link to="/kontakt" className="text-primary hover:underline">zgłosić incydent</Link> - udokumentujemy to dla celów compliance</li>
            <li>Jeśli dane dotyczą osoby trzeciej, rozważ poinformowanie jej o tym (obowiązek z RODO)</li>
            <li><strong>Pamiętaj na przyszłość:</strong> Formułuj pytania ogólnie</li>
          </ul>

          <div className="mt-3 bg-muted p-3 rounded">
            <p className="text-sm"><strong>Przykład jak pytać:</strong></p>
            <ul className="text-sm space-y-1 mt-1">
              <li>❌ ZŁE: "Czy Jan Kowalski, PESEL 12345678901, może..."</li>
              <li>✅ DOBRE: "Czy pracodawca może..."</li>
              <li>❌ ZŁE: "Moja umowa z firmą XYZ na ul. Warszawskiej..."</li>
              <li>✅ DOBRE: "Czy w umowie najmu może być zapis o..."</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      icon: Euro,
      question: "Czy JakiePrawo.pl jest zgodne z RODO i AI Act?",
      answer: (
        <>
          <p className="mb-2"><strong>Tak.</strong></p>
          <div className="mb-3">
            <p className="font-semibold mb-1">RODO:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>✓ Mamy Data Processing Agreement z Anthropic</li>
              <li>✓ Standard Contractual Clauses dla transferów poza UE</li>
              <li>✓ Przejrzysta polityka prywatności</li>
              <li>✓ Respektujemy prawa użytkowników</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">AI Act:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>✓ Klasyfikacja: system ograniczonego/minimalnego ryzyka (not high-risk)</li>
              <li>✓ Transparentność: jasno informujemy o użyciu AI</li>
              <li>✓ Oznaczanie treści generowanych przez AI</li>
              <li>✓ Bez wymogów dla systemów wysokiego ryzyka</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      icon: Shield,
      question: "Jakie mam prawa wobec moich danych?",
      answer: (
        <>
          <p className="mb-2">Masz prawo do:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Dostępu</strong> – sprawdzić, jakie dane o Tobie mamy</li>
            <li><strong>Sprostowania</strong> – poprawić błędne dane</li>
            <li><strong>Usunięcia</strong> – "prawo do bycia zapomnianym"</li>
            <li><strong>Ograniczenia przetwarzania</strong></li>
            <li><strong>Sprzeciwu</strong> wobec przetwarzania</li>
            <li><strong>Przeniesienia</strong> danych</li>
          </ul>
          <div className="mt-3 bg-muted p-3 rounded text-sm">
            <p><strong>Kontakt:</strong> <Link to="/kontakt" className="text-primary hover:underline">Strona kontaktu</Link></p>
            <p className="mt-1">
              <strong>Skarga:</strong> Urząd Ochrony Danych Osobowych (UODO) –{' '}
              <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                uodo.gov.pl
              </a>
            </p>
          </div>
        </>
      ),
    },
    {
      icon: HelpCircle,
      question: "Czy mogę zaufać odpowiedziom AI?",
      answer: (
        <>
          <p className="mb-2">
            <strong>AI może się mylić.</strong> Dlatego zawsze:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>✓ <strong>Weryfikuj</strong> przepisy w oficjalnych źródłach</li>
            <li>✓ <strong>Klikaj w linki</strong> do ustaw, które podajemy</li>
            <li>✓ <strong>Konsultuj z prawnikiem</strong> w ważnych sprawach</li>
            <li>✓ <strong>Traktuj jako punkt wyjścia</strong>, nie ostateczną odpowiedź</li>
          </ul>
          <p className="mt-2">
            AI to narzędzie pomocnicze, nie wyrocznia.
          </p>
        </>
      ),
    },
    {
      icon: Mail,
      question: "Jak mogę się skontaktować?",
      answer: (
        <>
          <div className="space-y-2">
            <p><strong>Email:</strong> <Link to="/kontakt" className="text-primary hover:underline">Formularz kontaktowy</Link></p>
            <p className="text-sm text-muted-foreground">Odpowiadamy w ciągu 48h roboczych.</p>
          </div>
        </>
      ),
    },
  ];

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Najczęściej zadawane pytania</h1>
          </div>

          <p className="text-muted-foreground mb-8">
            Odpowiedzi na pytania o prywatność, bezpieczeństwo danych i korzystanie z AI
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              return (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="text-xl font-semibold text-foreground">{faq.question}</h2>
                  </div>
                  <div className="ml-9 text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-primary/10 border border-primary/30 rounded-lg p-6">
            <p className="text-sm text-foreground">
              <strong>Nie znalazłeś odpowiedzi?</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Skontaktuj się z nami przez{' '}
              <Link to="/kontakt" className="text-primary hover:underline">stronę kontaktu</Link> lub przeczytaj naszą{' '}
              <Link to="/polityka-prywatnosci" className="text-primary hover:underline">Politykę Prywatności</Link> i{' '}
              <Link to="/regulamin" className="text-primary hover:underline">Regulamin</Link>.
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <Button asChild variant="outline">
              <Link to="/">← Strona główna</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/polityka-prywatnosci">Polityka prywatności</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/regulamin">Regulamin</Link>
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

export default FAQ;
