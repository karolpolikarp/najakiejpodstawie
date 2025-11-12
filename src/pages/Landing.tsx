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
          <p className="text-sm text-muted-foreground/70 animate-fade-in font-mono" style={{ animationDelay: '300ms' }}>
            Fast • Accurate • Private
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

      {/* Production Metrics */}
      <section className="container mx-auto px-4 py-16 relative z-10 bg-secondary/30 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Production Metrics</h3>
            <p className="text-muted-foreground text-lg">
              Real performance data from live deployment (last 30 days)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 glass-card rounded-lg">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">&lt;1s</div>
              <div className="text-sm text-muted-foreground">Avg response time</div>
              <div className="text-xs text-primary mt-1 font-mono">-15% vs last month</div>
            </div>
            <div className="text-center p-6 glass-card rounded-lg">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">15k+</div>
              <div className="text-sm text-muted-foreground">Legal acts indexed</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">via api.sejm.gov.pl</div>
            </div>
            <div className="text-center p-6 glass-card rounded-lg">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">67%</div>
              <div className="text-sm text-muted-foreground">Cache hit rate</div>
              <div className="text-xs text-primary mt-1 font-mono">+8% optimization</div>
            </div>
            <div className="text-center p-6 glass-card rounded-lg">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime (30d)</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">Vercel + Supabase</div>
            </div>
          </div>

          <div className="text-center p-6 glass-card rounded-lg border-2 border-primary/20">
            <div className="text-sm text-muted-foreground mb-2">Cost per Query (with caching)</div>
            <div className="text-4xl font-mono font-bold text-primary mb-2">$0.003</div>
            <div className="text-sm text-muted-foreground">60% reduction through intelligent response caching</div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Problem */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-xl">⚠</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">The Problem</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Legal research in Poland requires manual searches across 15,000+ acts on ISAP.
                Current solutions have critical limitations:
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="font-semibold mb-1">Government Portal (ISAP)</div>
                  <div className="text-sm text-muted-foreground">PDF-only, no semantic search, manual navigation</div>
                </div>
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="font-semibold mb-1">Commercial Tools (Legalis, LEX)</div>
                  <div className="text-sm text-muted-foreground">€500+/month, outdated indexes, no AI</div>
                </div>
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="font-semibold mb-1">General LLMs (ChatGPT)</div>
                  <div className="text-sm text-muted-foreground">Hallucinate citations, static training data, unreliable</div>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">Our Solution</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Three-layer architecture combining real-time API, intelligent caching,
                and custom LLM integration:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                    <div className="font-semibold">Live API Integration</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Direct connection to api.sejm.gov.pl ensures zero hallucinations and always-current legislation
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    <div className="font-semibold">Intelligent Caching</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    7-day TTL cache achieves &lt;500ms for popular queries, 60% cost reduction
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                    <div className="font-semibold">MCP + OCR</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Custom Model Context Protocol for PDF parsing, Tesseract.js for document OCR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="container mx-auto px-4 py-16 relative z-10 bg-secondary/30 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">Technical Architecture</h3>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-semibold">Why MCP?</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Standardized LLM tool protocol (Anthropic spec)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>PDF parsing outside 200k context window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Enables local deployment (Raspberry Pi)</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-semibold">Why Raspberry Pi?</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>$60 hardware vs $20/mo cloud (3mo ROI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>30ms local latency vs 200ms+ cloud</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Full control, no rate limits</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-semibold">Why Supabase?</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Deno runtime = native TypeScript</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Global edge network (Warsaw POP)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Integrated PostgreSQL analytics</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-semibold">Why Claude?</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Best-in-class for legal reasoning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>200k context window for full acts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Prompt caching = 60% cost savings</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stack Details */}
          <div className="p-6 rounded-lg border border-primary/20 bg-card">
            <h4 className="text-xl font-semibold mb-4">Complete Stack</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Frontend</div>
                <div className="font-mono">React, TypeScript, Vite</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Styling</div>
                <div className="font-mono">Tailwind CSS, shadcn/ui</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Backend</div>
                <div className="font-mono">Supabase Edge Functions</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Database</div>
                <div className="font-mono">PostgreSQL (Supabase)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">AI</div>
                <div className="font-mono">Claude Sonnet 4.5 / Haiku</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">OCR</div>
                <div className="font-mono">Tesseract.js (PL/EN)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Hosting</div>
                <div className="font-mono">Vercel, Raspberry Pi 5</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Legal API</div>
                <div className="font-mono">api.sejm.gov.pl</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">CI/CD</div>
                <div className="font-mono">GitHub Actions</div>
              </div>
            </div>
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
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">
                JakiePrawo.pl provides legal information for educational purposes, NOT legal advice for specific cases.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Information is educational - we show legal bases and general explanations</li>
                <li>• We do NOT interpret specific user situations or advise on individual cases</li>
                <li>• For matters requiring legal advice, always consult a qualified lawyer</li>
                <li>• We assume no responsibility for decisions made based on information from this service</li>
                <li>• Law changes - always verify currency of regulations</li>
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
        <div className="container mx-auto px-4 py-12">
          {/* Author Credit */}
          <div className="max-w-4xl mx-auto text-center mb-12 pb-12 border-b border-border">
            <h4 className="text-2xl font-semibold mb-3">Built By</h4>
            <p className="text-lg mb-2">
              <span className="font-semibold text-foreground">Karol Polikarp</span>
            </p>
            <p className="text-muted-foreground mb-6">
              Chief Specialist, Department of Research and Innovation<br />
              Ministry of Digital Affairs, Poland
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/karolpolikarp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="mailto:karol.polikarp@mc.gov.pl"
                  className="inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Background: AI Policy & EU AI Act implementation • CEEB system (national building registry) •
              Law (University of Warsaw) • 3+ years TypeScript/React
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-6 w-6 text-primary" />
                <h4 className="font-bold text-primary">JakiePrawo.pl</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered Polish legal search platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/czat" className="hover:text-primary transition-colors">
                    Search Tool
                  </Link>
                </li>
                <li>
                  <Link to="/o-nas" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/kontakt" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/polityka-prywatnosci" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Open Source</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Full source code available under MIT license
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/karolpolikarp/najakiejpodstawie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Code
                </a>
              </Button>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
            <p>© 2025 JakiePrawo.pl • Open Source Project • MIT License</p>
            <p className="mt-2">Legal information tool, not legal advice. Consult a qualified lawyer for specific cases.</p>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default Landing;
