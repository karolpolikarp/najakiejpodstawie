import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text mb-6">O projekcie</h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <section className="glass-card shadow-soft hover:shadow-soft-lg transition-all rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Czym jest JakiePrawo.pl?</h2>
              <p className="text-muted-foreground leading-relaxed">
                JakiePrawo.pl to narzędzie wspierające wyszukiwanie informacji prawnych w polskim systemie prawnym.
                Używamy sztucznej inteligencji (AI), żeby pomóc Ci szybciej znaleźć konkretny artykuł lub ustawę.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Jak to działa?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Wpisujesz pytanie zwykłym językiem (np. "Czy pracodawca może odmówić urlopu?"), a AI przeszukuje polskie prawo
                i podaje Ci konkretny artykuł wraz z wyjaśnieniem.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Technologia:</strong> Używamy modeli AI firmy Anthropic - jednego z najbardziej zaawansowanych systemów AI na świecie.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Dla kogo?</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Przedsiębiorców szukających szybkiej odpowiedzi prawnej</li>
                <li>Studentów prawa do nauki i sprawdzania wiedzy</li>
                <li>Osób prywatnych z pytaniami o swoje prawa</li>
                <li>Każdego, kto potrzebuje szybko zweryfikować podstawę prawną</li>
              </ul>
            </section>

            <section className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-destructive mb-4">⚠️ Ważne zastrzeżenie</h2>
              <p className="text-foreground leading-relaxed font-medium">
                To NIE jest porada prawna ani zastępstwo profesjonalnego prawnika. Informacje mają charakter
                edukacyjny i pomocniczy. W poważnych sprawach zawsze skonsultuj się z prawnikiem lub radcą prawnym.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Kto to stworzył?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Projekt otwartoźródłowy (open source) stworzony jako narzędzie pomocnicze dla osób poszukujących
                informacji prawnych. Kod dostępny publicznie na GitHub.
              </p>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href="https://github.com/karolpolikarp/najakiejpodstawie" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Zobacz kod na GitHub
                  </a>
                </Button>
              </div>
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

export default About;
