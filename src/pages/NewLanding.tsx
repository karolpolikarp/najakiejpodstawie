import { ArrowRight, Github, Check, X, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const NewLanding = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Simple Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold">JakiePrawo.pl</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#architecture" className="text-muted-foreground hover:text-foreground transition-colors">
                Technologie
              </a>
              <a
                href="https://github.com/karolpolikarp/najakiejpodstawie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            <Button asChild className="hidden md:block">
              <Link to="/czat">Try Demo</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24 mt-16">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-sm text-muted-foreground mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Production Ready • Open Source
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-display mb-6"
            style={{ textWrap: 'balance' } as any}
          >
            AI-Powered Polish Legal Search
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto"
            style={{ textWrap: 'balance' } as any}
          >
            Real-time access to 15,000+ legislative acts via Sejm API.
            Natural language queries with Claude Sonnet 4.5.
          </motion.p>

          {/* Tech Stack */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-muted-foreground mb-12 font-mono"
          >
            React • Supabase • Claude API • MCP
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg">
              <Link to="/czat" className="inline-flex items-center gap-2">
                Try Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <a
                href="https://github.com/karolpolikarp/najakiejpodstawie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="grid md:grid-cols-2 gap-16">
            {/* Problem */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-destructive text-2xl">⚠</span>
                <h2 className="text-h1">Problem</h2>
              </div>

              <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                Poszukiwanie przepisów w polskim prawie wymaga ręcznego przeszukiwania 15 000+
                aktów prawnych publikowanych w ISAP. Obecne rozwiązania mają istotne ograniczenia:
              </p>

              <div className="space-y-4">
                <ProblemCard
                  title="Portale rządowe"
                  issue="Tylko PDF, brak semantycznego wyszukiwania"
                />
                <ProblemCard
                  title="Komercyjne bazy danych"
                  issue="2000+ PLN/miesiąc, przestarzałe indeksy"
                />
                <ProblemCard
                  title="Ogólne modele AI"
                  issue="Halucynują cytowania, niewiarygodne"
                />
              </div>
            </div>

            {/* Solution */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-6 h-6 text-primary" />
                <h2 className="text-h1">Rozwiązanie</h2>
              </div>

              <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                Trójwarstwowa architektura łącząca dostęp do API w czasie rzeczywistym,
                inteligentne cache'owanie i dedykowaną integrację z LLM:
              </p>

              <div className="space-y-4">
                <SolutionCard
                  number="1"
                  title="Integracja z API Sejmu"
                  description="Bezpośrednie połączenie z API Sejmu RP eliminuje halucynacje i zapewnia aktualność przepisów"
                />
                <SolutionCard
                  number="2"
                  title="Inteligentne cache'owanie"
                  description="Cache odpowiedzi z 7-dniowym TTL osiąga <500ms dla popularnych zapytań, 60% redukcji kosztów"
                />
                <SolutionCard
                  number="3"
                  title="Serwer MCP"
                  description="Autorska implementacja Model Context Protocol do parsowania PDF i walidacji cytatów"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-24 px-6 bg-secondary/50" id="architecture">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-h1 mb-12 text-center">Stos Technologiczny</h2>

          {/* Stack List */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <StackItem label="Frontend" value="React, TypeScript, Vite" />
              <StackItem label="Styling" value="Tailwind CSS, shadcn/ui" />
              <StackItem label="Backend" value="Supabase Edge Functions" />
              <StackItem label="Database" value="PostgreSQL (pgvector)" />
              <StackItem label="AI" value="Claude Sonnet 4.5 / Haiku 4" />
              <StackItem label="MCP Server" value="ELI (Raspberry Pi 5)" />
              <StackItem label="OCR" value="Tesseract.js (PL/EN)" />
              <StackItem label="Hosting" value="Vercel, Raspberry Pi 5" />
              <StackItem label="API" value="api.sejm.gov.pl (REST)" />
              <StackItem label="CI/CD" value="GitHub Actions" />
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Matrix */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-h1 mb-12 text-center">Competitive Landscape</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="text-center p-4 font-medium text-primary">JakiePrawo.pl</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Legacy Tools*</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">ChatGPT</th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  feature="Real-time Sejm API"
                  us={true}
                  competitor1={false}
                  competitor2={false}
                />
                <CompareRow
                  feature="Natural language queries"
                  us={true}
                  competitor1="limited"
                  competitor2={true}
                />
                <CompareRow
                  feature="Accurate source citations"
                  us={true}
                  competitor1={true}
                  competitor2={false}
                />
                <CompareRow
                  feature="OCR support (Polish)"
                  us={true}
                  competitor1={false}
                  competitor2={false}
                />
                <CompareRow
                  feature="Data freshness"
                  us="Live"
                  competitor1="Weekly"
                  competitor2="Static (Jan 2025)"
                />
                <CompareRow
                  feature="Pricing"
                  us="Free / €9/mo"
                  competitor1="€500+/mo"
                  competitor2="€20/mo"
                />
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            * Komercyjne bazy danych prawnych
          </p>
        </div>
      </section>

      {/* Built By */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h1 mb-8 text-center">Built By Karol Polikarp</h2>

          <div className="p-8 rounded-lg border border-border bg-card">
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Chief Specialist, Department of Research and Innovation
                </p>
                <p className="text-base text-muted-foreground">
                  Ministry of Digital Affairs, Poland
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground font-medium mb-3">Background:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI Policy & EU AI Act implementation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>CEEB system (national building registry)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Law (University of Warsaw)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>3+ years TypeScript/React</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 JakiePrawo.pl • Open Source Project • MIT License</p>
          <p className="mt-2">
            Legal information tool, not legal advice. Consult a qualified lawyer for specific cases.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
function ProblemCard({ title, issue }: { title: string; issue: string }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-h2 mb-2">{title}</h3>
      <p className="text-muted-foreground">{issue}</p>
    </div>
  );
}

function SolutionCard({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-mono font-semibold">
          {number}
        </div>
        <h3 className="text-h2">{title}</h3>
      </div>
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}

function StackItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground mb-1">{label}</dt>
      <dd className="font-mono text-foreground">{value}</dd>
    </div>
  );
}

function CompareRow({
  feature,
  us,
  competitor1,
  competitor2
}: {
  feature: string;
  us: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
}) {
  return (
    <tr className="border-b border-border hover:bg-secondary/30 transition-colors">
      <td className="p-4 text-muted-foreground">{feature}</td>
      <td className="p-4 text-center">{renderValue(us, true)}</td>
      <td className="p-4 text-center">{renderValue(competitor1, false)}</td>
      <td className="p-4 text-center">{renderValue(competitor2, false)}</td>
    </tr>
  );
}

function renderValue(value: boolean | string, isUs: boolean) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`w-5 h-5 mx-auto ${isUs ? 'text-primary' : 'text-muted-foreground'}`} />
    ) : (
      <X className="w-5 h-5 mx-auto text-muted-foreground/50" />
    );
  }

  if (value === 'limited') {
    return <Minus className="w-5 h-5 mx-auto text-muted-foreground" />;
  }

  return (
    <span className={`text-sm ${isUs ? 'text-primary font-mono' : 'text-muted-foreground'}`}>
      {value}
    </span>
  );
}

export default NewLanding;
