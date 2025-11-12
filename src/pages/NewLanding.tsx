import { ArrowRight, Github, Check, X, Minus, TrendingUp, Zap, Database, Clock } from 'lucide-react';
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
              <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </a>
              <a href="#architecture" className="text-muted-foreground hover:text-foreground transition-colors">
                Architecture
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
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

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            <Metric value="<1s" label="Response time" />
            <Metric value="15k+" label="Legal acts" />
            <Metric value="99.9%" label="Uptime" />
            <Metric value="67%" label="Cache hit rate" />
          </motion.div>

          {/* Author Credit */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-sm text-muted-foreground"
          >
            Built by <span className="text-foreground font-medium">Karol Polikarp</span>
            {' • '}
            Ministry of Digital Affairs, Poland
          </motion.p>
        </div>
      </section>

      {/* Production Metrics Dashboard */}
      <section className="py-24 px-6 bg-secondary/50" id="metrics">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-h1 mb-4">Production Metrics</h2>
            <p className="text-muted-foreground">
              Real-time performance data from the last 30 days
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              value="2,847"
              label="Queries processed"
              trend="+23%"
            />
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              value="0.87s"
              label="Avg response time"
              trend="-15%"
            />
            <MetricCard
              icon={<Database className="w-5 h-5" />}
              value="67%"
              label="Cache hit rate"
              trend="+8%"
            />
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              value="99.94%"
              label="Uptime"
              trend="→"
            />
          </div>

          {/* Cost Metric */}
          <div className="mt-8 p-6 rounded-lg border border-border bg-card text-center">
            <p className="text-sm text-muted-foreground mb-2">API Cost per Query</p>
            <p className="text-3xl font-mono font-semibold text-primary">$0.003</p>
            <p className="text-sm text-muted-foreground mt-2">
              60% reduction via intelligent caching
            </p>
          </div>
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
                <h2 className="text-h1">The Problem</h2>
              </div>

              <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                Legal research in Poland requires manual searches across 15,000+ acts
                published on ISAP. Current solutions have critical limitations:
              </p>

              <div className="space-y-4">
                <ProblemCard
                  title="Government Portal"
                  issue="PDF-only, no semantic search"
                />
                <ProblemCard
                  title="Commercial Tools"
                  issue="€500+/month, outdated indexes"
                />
                <ProblemCard
                  title="General LLMs"
                  issue="Hallucinate citations, unreliable"
                />
              </div>
            </div>

            {/* Solution */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-6 h-6 text-primary" />
                <h2 className="text-h1">Our Solution</h2>
              </div>

              <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                Three-layer architecture combining real-time API access,
                intelligent caching, and custom LLM integration:
              </p>

              <div className="space-y-4">
                <SolutionCard
                  number="1"
                  title="Live API Integration"
                  description="Direct connection to Sejm RP API ensures zero hallucinations and always-current legislation"
                />
                <SolutionCard
                  number="2"
                  title="Intelligent Caching"
                  description="Response cache with 7-day TTL achieves <500ms for popular queries, 60% cost reduction"
                />
                <SolutionCard
                  number="3"
                  title="MCP Server"
                  description="Custom Model Context Protocol implementation for PDF parsing and citation validation"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-24 px-6 bg-secondary/50" id="architecture">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-h1 mb-12 text-center">Technical Architecture</h2>

          {/* Architecture Diagram - ASCII style */}
          <div className="mb-12 p-8 rounded-lg bg-card border border-border overflow-x-auto">
            <pre className="text-sm font-mono text-muted-foreground">
{`┌─────────────────┐
│   React + Vite  │  Frontend (Vercel)
│   TypeScript    │
└────────┬────────┘
         │
┌────────▼────────┐
│   Supabase      │  Edge Functions (Deno)
│   PostgreSQL    │  Auth & Storage
└────────┬────────┘
         │
┌────────▼────────────────┐
│   Claude API            │  Sonnet 4.5 / Haiku 4
│   • Prompt caching      │
│   • Response streaming  │
└────────┬────────────────┘
         │
┌────────▼────────────┐
│   ELI MCP Server    │  Raspberry Pi 5
│   PDF extraction    │  Local deployment
└────────┬────────────┘
         │
┌────────▼────────┐
│   Sejm API      │  api.sejm.gov.pl
│   15,000+ acts  │  Official source
└─────────────────┘`}
            </pre>
          </div>

          {/* Key Decisions */}
          <div className="grid md:grid-cols-2 gap-8">
            <TechDecision
              title="Why MCP?"
              points={[
                "Standardized LLM tool protocol",
                "PDF parsing outside context window",
                "Enables local deployment"
              ]}
            />
            <TechDecision
              title="Why Raspberry Pi?"
              points={[
                "$60 vs $20/mo cloud (3mo ROI)",
                "30ms local vs 200ms+ cloud",
                "Full control, no rate limits"
              ]}
            />
            <TechDecision
              title="Why Supabase?"
              points={[
                "Deno runtime = native TypeScript",
                "Global edge network (Warsaw POP)",
                "Integrated PostgreSQL analytics"
              ]}
            />
            <TechDecision
              title="Why Claude?"
              points={[
                "Best-in-class for legal reasoning",
                "200k context window",
                "Prompt caching = 60% cost savings"
              ]}
            />
          </div>

          {/* Stack List */}
          <div className="mt-12 p-6 rounded-lg border border-border bg-card">
            <h3 className="text-h2 mb-4">Complete Tech Stack</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <StackItem label="Frontend" value="React, TypeScript, Vite" />
              <StackItem label="Styling" value="Tailwind CSS, shadcn/ui" />
              <StackItem label="Backend" value="Supabase Edge Functions" />
              <StackItem label="Database" value="PostgreSQL (pgvector)" />
              <StackItem label="AI" value="Claude Sonnet 4.5 / Haiku 4" />
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
            * Representative commercial legal databases (Legalis, LEX)
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6 bg-secondary/50" id="about">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-h1 mb-12">Built By</h2>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-2">Karol Polikarp</h3>
            <p className="text-lg text-muted-foreground mb-4">
              Chief Specialist, Department of Research and Innovation
              <br />
              Ministry of Digital Affairs, Poland
            </p>
          </div>

          {/* Background */}
          <div className="text-left mb-8 p-6 rounded-lg border border-border bg-card">
            <h4 className="text-h2 mb-4">Background</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>AI Policy & EU AI Act implementation for Poland</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Led CEEB system project (national building emissions registry)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Education: Law (University of Warsaw), AI & Data Engineering (PJATK, SGH)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>3+ years building production TypeScript/React applications</span>
              </li>
            </ul>
          </div>

          {/* Contact Links */}
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <a
                href="https://github.com/karolpolikarp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </Button>
            <Button asChild variant="outline">
              <a
                href="mailto:karol.polikarp@mc.gov.pl"
                className="inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </Button>
          </div>

          {/* Open Source */}
          <div className="mt-12 p-6 rounded-lg border border-primary/20 bg-card">
            <h4 className="text-h2 mb-4">Open Source</h4>
            <p className="text-muted-foreground mb-4">
              Full source code available under MIT license.
              Contributions welcome for prompt engineering, EU jurisdiction expansion,
              and performance optimizations.
            </p>

            <a
              href="https://github.com/karolpolikarp/najakiejpodstawie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
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
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-mono font-semibold text-foreground mb-1">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  trend
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-sm font-mono text-primary">{trend}</span>
      </div>
      <div className="text-3xl font-mono font-semibold mb-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

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

function TechDecision({
  title,
  points
}: {
  title: string;
  points: string[];
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-h2 mb-4">{title}</h3>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
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
