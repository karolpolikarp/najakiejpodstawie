import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
            <section className="glass-card shadow-soft hover:shadow-soft-lg transition-all rounded-lg p-6 border-2 border-primary/20">
              <div className="inline-block mb-3 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-xs font-bold text-primary">3-IN-1 LEGAL ASSISTANT</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Czym jest JakiePrawo.pl?</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                JakiePrawo.pl to <strong>pierwszy w Polsce asystent prawny 3-w-1</strong> łączący zaawansowane OCR,
                dostęp do oficjalnego API Sejmu RP oraz AI-powered search.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To nie jest kolejny chatbot - to kompletna platforma do pracy z prawem polskim.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3 sposoby na odpowiedź</h2>

              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-l-4 border-green-500 rounded-lg">
                  <div className="text-3xl">📄</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Analiza dokumentów</h3>
                    <p className="text-sm text-muted-foreground">
                      Załącz PDF, skan lub zdjęcie dokumentu. OCR wyciąga tekst (polski + angielski), AI odpowiada na pytania.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-l-4 border-blue-500 rounded-lg">
                  <div className="text-3xl">🔍</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Wyszukiwanie artykułów</h3>
                    <p className="text-sm text-muted-foreground">
                      Dostęp do 15,000+ polskich ustaw z oficjalnego API Sejmu RP. Dosłowne cytaty, zawsze aktualne.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-l-4 border-amber-500 rounded-lg">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Pytania w języku naturalnym <span className="text-xs text-amber-600">[Beta]</span></h3>
                    <p className="text-sm text-muted-foreground">
                      Zadaj pytanie zwykłym językiem, a AI przeszukuje polskie prawo i wskazuje podstawę prawną.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Technologia:</strong> Claude AI (Anthropic), MCP Protocol, Tesseract OCR, PostgreSQL, React + TypeScript.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Dla kogo?</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-semibold mb-1">🏢 Przedsiębiorcy</div>
                  <div className="text-sm text-muted-foreground">Szybka weryfikacja podstaw prawnych</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-semibold mb-1">📚 Studenci prawa</div>
                  <div className="text-sm text-muted-foreground">Nauka i przygotowanie do egzaminów</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-semibold mb-1">👥 Osoby prywatne</div>
                  <div className="text-sm text-muted-foreground">Pytania o swoje prawa i obowiązki</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-semibold mb-1">🏛️ Zespoły HR/Legal</div>
                  <div className="text-sm text-muted-foreground">Wsparcie in-house legal</div>
                </div>
              </div>
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
                Projekt stworzony jako narzędzie pomocnicze dla osób poszukujących
                informacji prawnych. Kod dostępny na GitHub.
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

      <Footer />
    </div>
  );
};

export default About;
