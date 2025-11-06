import { Scale, MessageSquare, Zap, Shield, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
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

  const features = [
    {
      icon: Zap,
      title: 'Błyskawiczne odpowiedzi',
      description: 'Znajdź konkretny artykuł ustawy w kilka sekund, zamiast przeszukiwać akty prawne godzinami.',
    },
    {
      icon: MessageSquare,
      title: 'Zwykły język',
      description: 'Zadawaj pytania tak, jakbyś rozmawiał z prawnikiem - bez skomplikowanego języka prawniczego.',
    },
    {
      icon: BookOpen,
      title: 'Polskie prawo',
      description: 'Wyszukujemy w polskim systemie prawnym - Kodeks Cywilny, Kodeks Pracy i wiele innych ustaw.',
    },
    {
      icon: Shield,
      title: 'Prywatne i bezpieczne',
      description: 'Twoje pytania są prywatne. Nie przechowujemy Twoich danych osobowych.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-main">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">JakiePrawo.pl</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Wyszukiwarka podstaw prawnych</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm">
                <Link to="/o-nas">O projekcie</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/czat">Rozpocznij</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-card/30">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">Dlaczego JakiePrawo.pl?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="border-border hover:border-primary transition-colors">
                <CardHeader>
                  <Icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Example Questions Section */}
      <section className="container mx-auto px-4 py-16">
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
                className="h-auto py-4 text-left justify-start hover:border-primary hover:text-primary transition-all hover:scale-105"
              >
                <Link to="/czat">
                  <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{question}</span>
                </Link>
              </Button>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link to="/czat">
                Zadaj własne pytanie
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="container mx-auto px-4 py-16 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-6">Historie użycia</h3>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Zobacz, jak inni korzystają z JakiePrawo.pl
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((study, idx) => {
              const Icon = study.icon;
              return (
                <Card key={idx} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-8 w-8 text-primary" />
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
                JakiePrawo.pl to narzędzie wspierające, nie zastępuje profesjonalnej porady prawnej.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Informacje mają charakter edukacyjny i pomocniczy</li>
                <li>• W poważnych sprawach prawnych zawsze skonsultuj się z prawnikiem lub radcą prawnym</li>
                <li>• Nie bierzemy odpowiedzialności za decyzje podjęte na podstawie informacji z naszego serwisu</li>
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
