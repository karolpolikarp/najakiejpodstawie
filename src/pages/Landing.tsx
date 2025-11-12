import { Scale, MessageSquare, Zap, Shield, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { CookieBanner } from '@/components/CookieBanner';

const Landing = () => {
  const exampleQuestions = [
    'Zwrot towaru kupionego online',
    'Urlop na żądanie - ile dni w roku?',
    'Wypowiedzenie umowy najmu przez najemcę',
    'Odliczenie VAT od zakupów firmowych',
    'Punkty karne - ile można mieć?',
    'Alimenty na dziecko - jak ustalić wysokość?',
  ];

  const caseStudies = [
    {
      title: 'Przedsiębiorca - Zwrot towaru',
      problem: 'Właściciel sklepu internetowego otrzymał zwrot po 20 dniach i nie wiedział, czy musi go przyjąć.',
      solution: 'W ciągu 30 sekund znalazł Art. 27 ustawy o prawach konsumenta - termin to 14 dni od otrzymania towaru.',
      result: 'Szybka decyzja biznesowa bez kosztownej konsultacji prawnej.',
      icon: MessageSquare,
    },
    {
      title: 'Student prawa - Przygotowanie do egzaminu',
      problem: 'Student uczył się przepisów o urlopach pracowniczych przed egzaminem.',
      solution: 'Zadawał pytania w prostym języku i otrzymywał konkretne artykuły Kodeksu Pracy z wyjaśnieniem.',
      result: 'Skuteczniejsza nauka dzięki natychmiastowemu dostępowi do przepisów.',
      icon: BookOpen,
    },
    {
      title: 'Osoba prywatna - Spór z wynajmującym',
      problem: 'Najemca chciał wypowiedzieć umowę najmu, ale nie znał okresu wypowiedzenia.',
      solution: 'Znalazł Art. 673 Kodeksu Cywilnego o okresach wypowiedzenia w zależności od typu umowy.',
      result: 'Poprawnie wypowiedział umowę i uniknął konfliktu prawnego.',
      icon: Shield,
    },
  ];

  // 3 główne sposoby użycia - value proposition dla inwestorów
  const usageModes = [
    {
      icon: '📄',
      badge: 'CORE FEATURE',
      badgeColor: 'bg-green-500/10 text-green-600 border-green-500/30',
      title: 'Analiza dokumentów',
      subtitle: 'Ze skanami i zdjęciami',
      description: 'Załącz PDF, skan lub zdjęcie dokumentu. Zaawansowane OCR w języku polskim i angielskim wyciąga tekst, a AI odpowiada na pytania o treść.',
      features: [
        '✓ Obsługa PDF, DOC, DOCX',
        '✓ OCR dla skanów i zdjęć',
        '✓ Polski + angielski',
        '✓ Pytania o dokument',
      ],
      gradient: 'from-green-500/10 to-emerald-500/10',
      borderGradient: 'from-green-500/50 to-emerald-500/50',
    },
    {
      icon: '🔍',
      badge: 'CORE FEATURE',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      title: 'Wyszukiwanie artykułów',
      subtitle: 'MCP + API Sejmu',
      description: 'Dosłowne cytowanie z 15,000+ polskich ustaw pobieranych na żywo z oficjalnego API Sejmu RP. System MCP zapewnia aktualność i dokładność.',
      features: [
        '✓ 15,000+ ustaw (ISAP)',
        '✓ Oficjalne źródła (api.sejm.gov.pl)',
        '✓ Aktualna treść prawna',
        '✓ Inteligentny cache',
      ],
      gradient: 'from-blue-500/10 to-cyan-500/10',
      borderGradient: 'from-blue-500/50 to-cyan-500/50',
    },
    {
      icon: '💬',
      badge: 'EXPERIMENTAL BETA',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      title: 'Pytania w języku naturalnym',
      subtitle: 'Powered by Claude AI',
      description: 'Zadaj pytanie zwykłym językiem (np. "Czy pracodawca może odmówić urlopu?"), a AI przeszukuje polskie prawo i wskazuje podstawę prawną.',
      features: [
        '⚠️ Wymaga weryfikacji',
        '⚡ AI-powered search',
        '📚 Kontekst prawny',
        '🔬 W fazie testów',
      ],
      gradient: 'from-amber-500/10 to-orange-500/10',
      borderGradient: 'from-amber-500/50 to-orange-500/50',
    },
  ];

  const whyChooseUs = [
    {
      icon: Zap,
      title: 'Błyskawiczne odpowiedzi',
      description: '5-10 sekund zamiast godzin researchu. Odpowiedzi cache\'owane dla jeszcze szybszego dostępu.',
    },
    {
      icon: Shield,
      title: 'Wiarygodne źródła',
      description: 'Wszystkie artykuły z oficjalnego API Sejmu RP. Zero halucynacji, tylko faktyczne przepisy.',
    },
    {
      icon: BookOpen,
      title: 'Wszystkie ustawy',
      description: '15,000+ aktów prawnych z ISAP. Od popularnych kodeksów po specjalistyczne ustawy.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 animate-scale-in">
            <Scale className="h-20 w-20 text-primary mx-auto mb-6" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Znajdź podstawę prawną w kilka sekund
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Wpisz pytanie zwykłym językiem, a wskażemy Ci konkretny artykuł ustawy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/czat">
                Rozpocznij teraz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/o-nas">Dowiedz się więcej</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground/70 animate-fade-in" style={{ animationDelay: '300ms' }}>
            ⚡ Szybkie odpowiedzi • 📚 Polskie prawo • 🔒 Prywatne
          </p>
        </div>
      </section>

      {/* 3 Ways to Use - Main Value Proposition */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full">
            <span className="text-sm font-semibold text-primary">3-IN-1 LEGAL ASSISTANT</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Trzy sposoby na odpowiedź
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            To nie jest kolejny chatbot. To kompleksowy asystent prawny z trzema trybami pracy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {usageModes.map((mode, idx) => (
            <Card
              key={idx}
              className={`relative overflow-hidden glass-card hover-lift shadow-soft-lg hover:shadow-glow border-2 transition-all duration-500 group bg-gradient-to-br ${mode.gradient}`}
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.borderGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                    {mode.icon}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${mode.badgeColor}`}>
                    {mode.badge}
                  </div>
                </div>
                <CardTitle className="text-2xl mb-1 group-hover:text-primary transition-colors">
                  {mode.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">{mode.subtitle}</p>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mode.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  {mode.features.map((feature, featureIdx) => (
                    <div
                      key={featureIdx}
                      className="text-xs text-muted-foreground font-medium flex items-center"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="text-lg px-12 shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <Link to="/czat">
              Wypróbuj wszystkie 3 tryby
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Why Choose Us - Quick Benefits */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Dlaczego JakiePrawo.pl?
        </h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="text-center p-6 glass-card rounded-lg hover:shadow-soft transition-all duration-300"
              >
                <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Example Questions Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-6">Przykładowe pytania</h3>
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Zobacz, jakie pytania możesz zadać
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {exampleQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                asChild
                className="h-auto py-4 text-left justify-start hover:border-primary hover:text-primary transition-all hover:scale-105 hover:shadow-soft glass-card whitespace-normal break-words"
              >
                <Link to="/czat" className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{question}</span>
                </Link>
              </Button>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="shadow-soft-lg hover:shadow-soft-xl transition-all duration-300">
              <Link to="/czat">
                Zadaj własne pytanie
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-6">Historie użycia</h3>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Zobacz, jak inni korzystają z JakiePrawo.pl
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((study, idx) => {
              const Icon = study.icon;
              return (
                <Card
                  key={idx}
                  className="glass-card hover-lift shadow-soft hover:shadow-soft-lg border-border/50 transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Icon className="h-8 w-8 text-primary relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <CardTitle className="text-xl">{study.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Problem:</h4>
                      <p className="text-sm">{study.problem}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Rozwiązanie:</h4>
                      <p className="text-sm">{study.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Rezultat:</h4>
                      <p className="text-sm font-medium text-primary">{study.result}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Ważne zastrzeżenie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">
                JakiePrawo.pl dostarcza wyjaśnienia przepisów prawnych, NIE udziela porad prawnych w konkretnych sprawach.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Informacje mają charakter edukacyjny - pokazujemy podstawy prawne i ich ogólne wyjaśnienie</li>
                <li>• NIE interpretujemy konkretnych sytuacji użytkowników ani nie doradzamy w indywidualnych przypadkach</li>
                <li>• W sprawach wymagających porady prawnej zawsze skonsultuj się z prawnikiem lub radcą prawnym</li>
                <li>• Nie bierzemy odpowiedzialności za decyzje podjęte na podstawie informacji z serwisu</li>
                <li>• Prawo zmienia się - zawsze weryfikuj aktualność przepisów</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Gotowy, żeby znaleźć odpowiedź?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Dołącz do setek użytkowników, którzy codziennie znajdują podstawy prawne w kilka sekund
          </p>
          <Button asChild size="lg" className="text-lg px-12">
            <Link to="/czat">
              Zacznij teraz za darmo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-6 w-6 text-primary" />
                <h4 className="font-bold text-primary">JakiePrawo.pl</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Wyszukiwarka podstaw prawnych wspierana przez AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Nawigacja</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/czat" className="hover:text-primary transition-colors">
                    Wyszukiwarka
                  </Link>
                </li>
                <li>
                  <Link to="/o-nas" className="hover:text-primary transition-colors">
                    O projekcie
                  </Link>
                </li>
                <li>
                  <Link to="/kontakt" className="hover:text-primary transition-colors">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link to="/polityka-prywatnosci" className="hover:text-primary transition-colors">
                    Polityka prywatności
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Open Source</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Projekt dostępny na GitHub pod licencją open source
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/karolpolikarp/najakiejpodstawie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zobacz kod
                </a>
              </Button>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
            <p>© 2025 JakiePrawo.pl - Projekt open source</p>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default Landing;
