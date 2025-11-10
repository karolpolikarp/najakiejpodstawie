# 📊 ANALIZA STRUKTURY I LOGIKI APLIKACJI NAJAKIEJPODSTAWIE.PL

**Data analizy:** 2025-11-10
**Wykonał:** Claude Code
**Branch:** claude/analyze-app-logic-structure-011CUyqnoKKQMJ9fEYeUKxbD

---

## 📋 SPIS TREŚCI

1. [Podsumowanie Wykonawcze](#podsumowanie-wykonawcze)
2. [Architektura Systemu](#architektura-systemu)
3. [Zidentyfikowane Problemy](#zidentyfikowane-problemy)
4. [Propozycje Poprawek](#propozycje-poprawek)
5. [Roadmap Rozwoju](#roadmap-rozwoju)
6. [Metryki i KPI](#metryki-i-kpi)

---

## 🎯 PODSUMOWANIE WYKONAWCZE

### Ogólna Ocena
Aplikacja **najakiejpodstawie.pl** jest **dobrze zaprojektowanym** systemem asystenta prawnego opartego na AI. Kod jest **czysty**, **dobrze zorganizowany** i **gotowy do produkcji**. Jednak istnieje kilka obszarów wymagających **optymalizacji** i **rozszerzenia funkcjonalności**.

### Kluczowe Mocne Strony ✅
- ✅ **Nowoczesny stack technologiczny** (React 18, TypeScript, Vite, Supabase)
- ✅ **Serverless architecture** (Edge Functions) - skalowalna i ekonomiczna
- ✅ **Inteligentny system pobierania artykułów** (3-poziomowy cache w ELI MCP)
- ✅ **Real-time streaming** odpowiedzi od Claude API
- ✅ **Rate limiting** i podstawowe security measures
- ✅ **Persystencja stanu** (Zustand + localStorage)
- ✅ **Dobrze przemyślany UX** (auto-scroll, feedback system, file upload)
- ✅ **Comprehensive legal context** (30+ tematów prawnych)

### Główne Wyzwania ⚠️
- ⚠️ **Brak monitorowania i analytics** (koszty API, performance metrics)
- ⚠️ **Limited error handling** w niektórych miejscach
- ⚠️ **Security gaps** (hardcoded passwords, brak input sanitization)
- ⚠️ **Scalability concerns** (localStorage limits, cache persistence)
- ⚠️ **Brak automated testing** dla kluczowych flow'ów
- ⚠️ **Performance bottlenecks** (długi system prompt, Levenshtein dla długich stringów)

---

## 🏗️ ARCHITEKTURA SYSTEMU

### Stack Technologiczny

#### Frontend
```
React 18.3.1 + TypeScript 5.8.3
├── Build Tool: Vite 5.4.19
├── Routing: React Router v6
├── State: Zustand 5.0.8 (localStorage persistence)
├── UI: Tailwind CSS 3.4.17 + shadcn/ui + Radix UI
├── Data Fetching: TanStack Query v5.83.0
├── Animations: Framer Motion 12.23.24
└── Notifications: Sonner 1.7.4
```

#### Backend
```
Supabase (Serverless)
├── Edge Functions: Deno runtime
│   ├── legal-assistant (główny AI handler)
│   ├── get-questions (admin analytics)
│   └── submit-feedback
├── Database: PostgreSQL
│   ├── user_questions (Q&A history)
│   └── rate_limits (rate limiting)
└── Auth: Row Level Security (RLS)
```

#### External Services
```
├── Anthropic Claude API (claude-sonnet-4.5 / claude-haiku-4.5)
├── ISAP API (Sejm.gov.pl) - 15,000+ aktów prawnych
└── ELI MCP Server (Raspberry Pi / self-hosted)
    ├── HTTP API (Deno)
    ├── 3-level cache (hardcoded → LRU → ISAP)
    └── 50+ act codes + 60+ synonyms
```

### Przepływ Danych

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ 1. User Question
       ▼
┌─────────────────────┐
│  ChatStore          │
│  (Zustand)          │
│  - Add message      │
│  - Set loading      │
└──────┬──────────────┘
       │ 2. API Call
       ▼
┌─────────────────────────────┐
│  Supabase Edge Function     │
│  /legal-assistant           │
│  - Rate limit check         │
│  - Detect legal context     │
│  - Enrich with articles     │
└──────┬──────────────────────┘
       │ 3. Fetch Articles
       ▼
┌─────────────────────┐
│  ELI MCP Server     │
│  - Act resolver     │
│  - ISAP API client  │
│  - 3-level cache    │
└──────┬──────────────┘
       │ 4. Article Text
       ▼
┌─────────────────────┐
│  Claude API         │
│  - System prompt    │
│  - Streaming        │
│  - 4096 max tokens  │
└──────┬──────────────┘
       │ 5. Streamed Response
       ▼
┌─────────────────────┐
│  Browser            │
│  - Update UI        │
│  - Save to DB       │
│  - localStorage     │
└─────────────────────┘
```

---

## 🔍 ZIDENTYFIKOWANE PROBLEMY

### 1. BACKEND - Legal Assistant Function

#### 🔴 Krytyczne

**P1.1: Brak walidacji długości wiadomości**
- **Lokalizacja:** `supabase/functions/legal-assistant/index.ts:114-130`
- **Problem:** Sprawdzana jest tylko czy message nie jest pusty, ale brak limitu górnego
- **Ryzyko:** Użytkownik może wysłać bardzo długą wiadomość → przekroczenie limitu tokenów Claude API → błąd 400
- **Fix:**
  ```typescript
  if (message.trim().length === 0) {
    return new Response(JSON.stringify({
      error: 'Wiadomość nie może być pusta'
    }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // DODAJ:
  const MAX_MESSAGE_LENGTH = 5000;
  if (message.length > MAX_MESSAGE_LENGTH) {
    return new Response(JSON.stringify({
      error: `Wiadomość nie może przekraczać ${MAX_MESSAGE_LENGTH} znaków (obecna długość: ${message.length})`
    }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  ```

**P1.2: Hardcoded model names**
- **Lokalizacja:** `supabase/functions/legal-assistant/index.ts:174-176`
- **Problem:** Model names są hardcoded bezpośrednio w logice
  ```typescript
  const selectedModel = usePremiumModel
    ? 'claude-sonnet-4-20250514'  // Hardcoded!
    : 'claude-haiku-4-5-20251001'; // Hardcoded!
  ```
- **Ryzyko:** Przy aktualizacji modeli trzeba zmieniać w wielu miejscach
- **Fix:** Przenieś do constants
  ```typescript
  // W nowym pliku: supabase/functions/_shared/model-config.ts
  export const ANTHROPIC_MODELS = {
    PREMIUM: 'claude-sonnet-4-20250514',
    DEFAULT: 'claude-haiku-4-5-20251001',
  } as const;
  ```

**P1.3: System prompt przekracza limity**
- **Lokalizacja:** `supabase/functions/legal-assistant/index.ts:193-299`
- **Problem:** System prompt ma ~8000 znaków + legal context + article context → może przekroczyć 16K tokens
- **Ryzyko:** Claude API error przy długich kontekstach
- **Fix:** Kompresja i priorytetyzacja
  ```typescript
  // 1. Skróć instrukcje formatowania
  // 2. Dynamicznie dobieraj tylko najbardziej relevantne sekcje legal context
  // 3. Limit długości article context (obecnie unlimited)
  ```

#### 🟡 Średnie

**P1.4: Brak timeout dla ELI MCP calls**
- **Lokalizacja:** `supabase/functions/legal-assistant/index.ts:188`
- **Problem:** `enrichWithArticles()` może wisieć w nieskończoność
- **Ryzyko:** Użytkownik czeka bardzo długo na response
- **Fix:** Dodaj timeout wrapper
  ```typescript
  const enrichmentResult = await Promise.race([
    enrichWithArticles(message, legalContextResult.mcpArticles),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('ELI MCP timeout')), 15000)
    )
  ]);
  ```

**P1.5: Rate limiting tylko per session**
- **Lokalizacja:** `supabase/functions/legal-assistant/index.ts:143-164`
- **Problem:** Brak globalnego limitu na wszystkich użytkowników (może być abuse)
- **Ryzyko:** Jeden user może zablokować całą aplikację wysyłając 1000 requestów z różnych sesji
- **Fix:** Dodaj globalny rate limit
  ```typescript
  // Check global rate limit (max 100 req/min for all users)
  const globalLimit = await checkGlobalRateLimit(supabaseClient);
  if (!globalLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Serwis jest obecnie przeciążony. Spróbuj ponownie za chwilę.'
    }), { status: 503, headers: corsHeaders });
  }
  ```

**P1.6: Brak logowania czasu wykonania**
- **Lokalizacja:** Cała funkcja
- **Problem:** Brak metryk performance (ile trwa enrichment, ile trwa Claude API, etc.)
- **Ryzyko:** Nie wiemy gdzie są bottlenecki
- **Fix:**
  ```typescript
  const startTime = Date.now();

  // ... kod ...

  console.log(`[METRICS] Total time: ${Date.now() - startTime}ms`);
  console.log(`[METRICS] Enrichment: ${enrichmentTime}ms`);
  console.log(`[METRICS] Claude API: ${claudeApiTime}ms`);
  console.log(`[METRICS] DB save: ${dbSaveTime}ms`);
  ```

### 2. BACKEND - ELI Tools

#### 🟡 Średnie

**P2.1: Brak deduplikacji artykułów przed fetchowaniem**
- **Lokalizacja:** `supabase/functions/legal-assistant/eli-tools.ts:419-467`
- **Problem:** Deduplikacja jest dopiero po detection, ale fetch może być wielokrotny dla tego samego artykułu
- **Ryzyko:** Marnowanie API calls do ELI MCP
- **Fix:** Już jest `seen` Set, ale może być optymalizacja:
  ```typescript
  // PRZED fetchowaniem sprawdź czy już mamy w cache
  const cacheKey = `${article.actCode}:${article.articleNumber}`;
  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey);
  }
  ```

**P2.2: MAX_ARTICLES_FROM_TOPICS = 5 może być za mało**
- **Lokalizacja:** `supabase/functions/legal-assistant/eli-tools.ts:13`
- **Problem:** Dla kompleksowych pytań (np. "mobbing w pracy") 5 artykułów może nie wystarczyć
- **Ryzyko:** Niekompletne odpowiedzi
- **Fix:** Zwiększ limit lub zrób dynamiczny
  ```typescript
  const MAX_ARTICLES_FROM_TOPICS = usePremiumModel ? 10 : 5;
  ```

**P2.3: Brak cachowania nieudanych requestów**
- **Lokalizacja:** `supabase/functions/legal-assistant/eli-tools.ts:282-369`
- **Problem:** Jeśli artykuł nie istnieje, będziemy próbować go pobrać za każdym razem
- **Ryzyko:** Marnowanie requestów
- **Fix:**
  ```typescript
  // Cache również failed requests (z TTL 1h)
  const failedCache = new Map<string, number>(); // cacheKey → timestamp

  if (failedCache.has(cacheKey) && Date.now() - failedCache.get(cacheKey)! < 3600000) {
    return { success: false, error: 'Article not found (cached)' };
  }
  ```

#### 🟢 Niskie

**P2.4: Walidacja content zbyt restrykcyjna**
- **Lokalizacja:** `supabase/functions/legal-assistant/eli-tools.ts:259-261`
- **Problem:** Minimum 50 znaków może odrzucić krótkie artykuły (np. "Art. 1. Ustawa wchodzi w życie po 14 dniach.")
- **Ryzyko:** False negatives
- **Fix:** Zmniejsz do 20 znaków lub usuń walidację długości

### 3. FRONTEND - Index.tsx

#### 🔴 Krytyczne

**P3.1: Premium password hardcoded w kodzie**
- **Lokalizacja:** `src/pages/Index.tsx:30`
- **Problem:**
  ```typescript
  const PREMIUM_PASSWORD = 'power'; // Hardcoded!
  ```
- **Ryzyko:** **SECURITY RISK** - każdy może zobaczyć hasło w źródle strony
- **Fix:** Przenieś do backend verification
  ```typescript
  // BACKEND: Dodaj endpoint /verify-premium-password
  const { data, error } = await supabase.functions.invoke('verify-premium-password', {
    body: { password: premiumPassword }
  });
  ```

**P3.2: Brak obsługi offline mode**
- **Lokalizacja:** Całe `Index.tsx`
- **Problem:** Gdy brak internetu, aplikacja się zawiesza bez komunikatu
- **Ryzyko:** Złe UX
- **Fix:**
  ```typescript
  useEffect(() => {
    const handleOffline = () => {
      toast.error('Brak połączenia z internetem. Sprawdź swoje połączenie.');
    };

    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, []);
  ```

#### 🟡 Średnie

**P3.3: Auto-scroll logic może być mylący**
- **Lokalizacja:** `src/pages/Index.tsx:91-125`
- **Problem:** `shouldAutoScrollRef` może nie działać poprawnie gdy użytkownik szybko przewija
- **Ryzyko:** Użytkownik traci kontrolę nad scrollowaniem
- **Fix:** Dodaj przycisk "Pause auto-scroll" lub wizualne wskazanie

**P3.4: Brak debounce dla scroll event handlera**
- **Lokalizacja:** `src/pages/Index.tsx:99-111`
- **Problem:** Scroll event fires bardzo często → performance issue
- **Ryzyko:** Lagowanie na słabszych urządzeniach
- **Fix:**
  ```typescript
  import { debounce } from 'lodash';

  const handleScroll = debounce(() => {
    shouldAutoScrollRef.current = isNearBottom();
    setShowScrollTop(window.scrollY > 500);
  }, 100); // 100ms debounce
  ```

**P3.5: Retry logic dla feedback może prowadzić do nieskończonych pętli**
- **Lokalizacja:** `src/pages/Index.tsx:171-215`
- **Problem:** Jeśli backend zawsze zwraca `pending: true`, będzie retry w nieskończoność (limit 3, ale co jeśli błąd?)
- **Ryzyko:** Memory leak
- **Fix:** Dodaj timeout i max retry count

### 4. FRONTEND - Chat Store

#### 🟡 Średnie

**P4.1: Brak limitów dla localStorage**
- **Lokalizacja:** `src/store/chatStore.ts:67-74`
- **Problem:** `messages` array rośnie w nieskończoność → przepełnienie localStorage (limit 5-10MB)
- **Ryzyko:** Aplikacja przestanie działać gdy localStorage się zapełni
- **Fix:**
  ```typescript
  const MAX_MESSAGES = 100;

  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, {
        ...message,
        id: message.id || crypto.randomUUID(),
        timestamp: new Date(),
      }];

      // Keep only last 100 messages
      if (newMessages.length > MAX_MESSAGES) {
        return { messages: newMessages.slice(-MAX_MESSAGES) };
      }

      return { messages: newMessages };
    }),
  ```

**P4.2: Brak kompresji dla długich konwersacji**
- **Lokalizacja:** `src/store/chatStore.ts`
- **Problem:** Długie odpowiedzi AI mogą zająć dużo miejsca w localStorage
- **Ryzyko:** Wolne ładowanie aplikacji
- **Fix:** Użyj kompresji (np. LZString)
  ```typescript
  import LZString from 'lz-string';

  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      return str ? LZString.decompress(str) : null;
    },
    setItem: (name, value) => {
      localStorage.setItem(name, LZString.compress(value));
    },
  }
  ```

**P4.3: Messages nie mają expiration date**
- **Lokalizacja:** `src/store/chatStore.ts`
- **Problem:** Stare wiadomości (np. sprzed 6 miesięcy) zostaną na zawsze
- **Ryzyko:** Przepełnienie storage + stare dane
- **Fix:**
  ```typescript
  // Przy ładowaniu aplikacji usuń wiadomości starsze niż 30 dni
  useEffect(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const validMessages = messages.filter(msg =>
      new Date(msg.timestamp).getTime() > thirtyDaysAgo
    );
    if (validMessages.length !== messages.length) {
      // Clear old messages
      clearMessages();
      validMessages.forEach(msg => addMessage(msg));
    }
  }, []);
  ```

### 5. ELI MCP SERVER - Act Resolver

#### 🟡 Średnie

**P5.1: ACT_SYNONYMS jako hardcoded object**
- **Lokalizacja:** `eli-mcp-server/src/act-resolver.ts:44-169`
- **Problem:** 60+ wpisów w kodzie → trudno utrzymać, brak automatycznego uczenia się
- **Ryzyko:** Nieaktualne synonimy, brakujące nowe słowa kluczowe
- **Fix:** Przenieś do zewnętrznego pliku JSON lub bazy danych
  ```typescript
  // synonyms.json
  {
    "kodeks drogowy": "prawo o ruchu drogowym",
    "k.c.": "kodeks cywilny",
    // ...
  }

  // act-resolver.ts
  import synonyms from './synonyms.json';
  ```

**P5.2: Brak automatycznego uczenia się nowych synonimów**
- **Lokalizacja:** Cały moduł
- **Problem:** Użytkownicy mogą używać nowych synonimów (np. "ustawa o aborcji") → nie są mapowane
- **Ryzyko:** Gorsza jakość wyszukiwania
- **Fix:** Zbieraj user queries + successful resolutions → automatycznie dodawaj do synonimów
  ```typescript
  // Po każdym successful resolution:
  async function learnSynonym(userQuery: string, resolvedActTitle: string) {
    const normalized = normalizeActName(userQuery);
    if (!ACT_SYNONYMS[normalized]) {
      // Save to learning database
      await saveSynonymSuggestion(normalized, resolvedActTitle);
    }
  }
  ```

**P5.3: Cache zapisywany do /tmp**
- **Lokalizacja:** `eli-mcp-server/src/act-resolver.ts:179`
- **Problem:**
  ```typescript
  private readonly diskCachePath = '/tmp/eli-act-cache.json';
  ```
- **Ryzyko:** `/tmp` może być wyczyszczony przy restarcie systemu → utrata cache
- **Fix:** Użyj persistent storage
  ```typescript
  private readonly diskCachePath = './data/eli-act-cache.json';
  ```

#### 🟢 Niskie

**P5.4: Levenshtein distance jest wolny**
- **Lokalizacja:** `eli-mcp-server/src/act-resolver.ts:245-271`
- **Problem:** Algorytm ma złożoność O(n*m) → wolny dla długich stringów
- **Ryzyko:** Opóźnienia dla długich nazw aktów
- **Fix:** Użyj biblioteki z optymalizacją lub limit długości stringów
  ```typescript
  import { distance } from 'fastest-levenshtein';
  ```

### 6. ARCHITEKTURA OGÓLNA

#### 🔴 Krytyczne

**P6.1: Brak centralized error logging**
- **Lokalizacja:** Cała aplikacja
- **Problem:** Błędy logowane tylko do `console.error()` → brak persistence, trudno debugować
- **Ryzyko:** Nie wiemy o błędach produkcyjnych
- **Fix:** Zintegruj Sentry lub podobny tool
  ```typescript
  import * as Sentry from '@sentry/react';

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
  ```

**P6.2: Brak monitorowania kosztów API**
- **Lokalizacja:** Całe API
- **Problem:** Nie wiemy ile kosztuje nas Claude API, ISAP API, etc.
- **Ryzyko:** Niespodziewane wysokie koszty
- **Fix:** Tracking w bazie danych
  ```sql
  CREATE TABLE api_costs (
    id UUID PRIMARY KEY,
    service TEXT NOT NULL, -- 'claude' | 'isap'
    model TEXT, -- 'haiku' | 'sonnet'
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

#### 🟡 Średnie

**P6.3: Brak metryki performance**
- **Lokalizacja:** Całe API
- **Problem:** Nie wiemy ile czasu zajmują różne operacje
- **Ryzyko:** Nie wiemy gdzie optymalizować
- **Fix:** Dodaj performance tracking
  ```typescript
  // Middleware dla wszystkich edge functions
  const measurePerformance = (handler) => async (req) => {
    const start = performance.now();
    const result = await handler(req);
    const duration = performance.now() - start;

    // Save to DB
    await supabase.from('performance_metrics').insert({
      endpoint: req.url,
      duration_ms: duration,
    });

    return result;
  };
  ```

**P6.4: Brak health check endpoint**
- **Lokalizacja:** Backend
- **Problem:** Nie ma prostego endpointu do sprawdzenia czy wszystko działa
- **Ryzyko:** Trudno monitorować dostępność
- **Fix:**
  ```typescript
  // supabase/functions/health/index.ts
  serve(async (req) => {
    const checks = {
      database: await checkDatabase(),
      eliMcp: await checkEliMcp(),
      claudeApi: await checkClaudeApi(),
    };

    const allHealthy = Object.values(checks).every(c => c.healthy);

    return new Response(JSON.stringify({
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    }), {
      status: allHealthy ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  ```

**P6.5: Brak CI/CD dla ELI MCP Server**
- **Lokalizacja:** Deployment
- **Problem:** ELI MCP Server nie ma automated deployment (tylko Supabase)
- **Ryzyko:** Manual deployment errors
- **Fix:** Dodaj GitHub Actions workflow
  ```yaml
  # .github/workflows/deploy-eli-mcp.yml
  name: Deploy ELI MCP Server
  on:
    push:
      branches: [main]
      paths:
        - 'eli-mcp-server/**'
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Deploy to Raspberry Pi
          run: |
            scp -r eli-mcp-server/* user@raspberry-pi:/opt/eli-mcp/
            ssh user@raspberry-pi 'systemctl restart eli-mcp'
  ```

### 7. BEZPIECZEŃSTWO

#### 🔴 Krytyczne

**P7.1: Brak input sanitization dla file uploads**
- **Lokalizacja:** `src/components/FileUpload.tsx`
- **Problem:** Plik jest czytany i wysyłany do backendu bez sanitization
- **Ryzyko:** XSS attacks, malicious content injection
- **Fix:**
  ```typescript
  import DOMPurify from 'dompurify';

  const sanitizedContent = DOMPurify.sanitize(extractedText, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
  ```

#### 🟡 Średnie

**P7.2: Brak rotacji API keys**
- **Lokalizacja:** Environment variables
- **Problem:** API keys (ANTHROPIC_API_KEY, ELI_API_KEY) nie mają automated rotation
- **Ryzyko:** Jeśli key wycieknie, trudno go zmienić
- **Fix:** Użyj secret management (AWS Secrets Manager, Vault) + rotation policy

**P7.3: Rate limiting tylko per session**
- **Lokalizacja:** `supabase/functions/legal-assistant/rate-limiter.ts`
- **Problem:** User może stworzyć wiele sesji i ominąć limit
- **Ryzyko:** Abuse
- **Fix:** Dodaj IP-based rate limiting

**P7.4: CORS origins hardcoded**
- **Lokalizacja:** `supabase/functions/legal-assistant/index.ts:10-20`
- **Problem:** Lista allowed origins jest hardcoded → trudno dodać nowe domeny
- **Ryzyko:** Trzeba redeploy przy dodawaniu nowej domeny
- **Fix:** Przenieś do env variables
  ```typescript
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [];
  ```

### 8. UX/UI

#### 🟢 Niskie

**P8.1: Brak loading state dla feedback submissions**
- **Lokalizacja:** `src/components/ChatMessage.tsx`
- **Problem:** Gdy użytkownik klika thumbs up/down, nie widzi czy request się wykonuje
- **Ryzyko:** User może kliknąć wielokrotnie
- **Fix:**
  ```typescript
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleFeedback = async () => {
    setFeedbackLoading(true);
    await onFeedback(messageId, 'positive');
    setFeedbackLoading(false);
  };
  ```

**P8.2: Brak konfirmacji przed clear messages**
- **Lokalizacja:** `src/pages/Index.tsx`
- **Problem:** Clear messages usuwa wszystko bez potwierdzenia (jest dialog, ale może być lepszy)
- **Ryzyko:** Przypadkowe usunięcie historii
- **Fix:** Dodaj "Undo" option
  ```typescript
  const handleClear = () => {
    const backup = [...messages];
    clearMessages();
    toast.success('Historia wyczyszczona', {
      action: {
        label: 'Cofnij',
        onClick: () => {
          backup.forEach(msg => addMessage(msg));
        },
      },
    });
  };
  ```

**P8.3: Przykładowe pytania mogą być nieaktualne**
- **Lokalizacja:** `src/components/ExampleQuestions.tsx`
- **Problem:** Pytania są hardcoded → mogą być nieaktualne (np. "jakie urlopy w 2024?")
- **Ryzyko:** Użytkownicy dostają nieaktualne informacje
- **Fix:** Generuj pytania dynamicznie lub fetch z API

---

## 💡 PROPOZYCJE POPRAWEK I ROZWINIĘCIA

### 🚀 QUICK WINS (1-2 dni, wysokie ROI)

#### QW1: Dodaj walidację długości wiadomości
**Priorytet:** 🔴 Wysoki
**Effort:** 1h
**Impact:** Zapobiega błędom API

```typescript
// supabase/functions/legal-assistant/index.ts
const MAX_MESSAGE_LENGTH = 5000;
if (message.length > MAX_MESSAGE_LENGTH) {
  return new Response(JSON.stringify({
    error: `Wiadomość zbyt długa (max ${MAX_MESSAGE_LENGTH} znaków)`
  }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
```

#### QW2: Przenieś model names do constants
**Priorytet:** 🟡 Średni
**Effort:** 30min
**Impact:** Łatwiejsze utrzymanie

```typescript
// supabase/functions/_shared/model-config.ts
export const ANTHROPIC_MODELS = {
  PREMIUM: 'claude-sonnet-4-20250514',
  DEFAULT: 'claude-haiku-4-5-20251001',
} as const;
```

#### QW3: Dodaj debounce dla scroll handler
**Priorytet:** 🟡 Średni
**Effort:** 15min
**Impact:** Lepszy performance na mobile

```typescript
import { debounce } from 'lodash';

const handleScroll = debounce(() => {
  shouldAutoScrollRef.current = isNearBottom();
  setShowScrollTop(window.scrollY > 500);
}, 100);
```

#### QW4: Dodaj limit dla localStorage
**Priorytet:** 🔴 Wysoki
**Effort:** 1h
**Impact:** Zapobiega przepełnieniu storage

```typescript
const MAX_MESSAGES = 100;

addMessage: (message) =>
  set((state) => {
    const newMessages = [...state.messages, { ...message, id: message.id || crypto.randomUUID(), timestamp: new Date() }];
    return { messages: newMessages.slice(-MAX_MESSAGES) };
  }),
```

#### QW5: Dodaj loading state dla feedback
**Priorytet:** 🟢 Niski
**Effort:** 30min
**Impact:** Lepszy UX

```typescript
const [feedbackLoading, setFeedbackLoading] = useState(false);

const handleFeedback = async (type: 'positive' | 'negative') => {
  setFeedbackLoading(true);
  await onFeedback(messageId, type);
  setFeedbackLoading(false);
};
```

#### QW6: Dodaj health check endpoint
**Priorytet:** 🔴 Wysoki
**Effort:** 2h
**Impact:** Łatwiejsze monitorowanie

```typescript
// supabase/functions/health/index.ts
serve(async (req) => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }), { headers: { 'Content-Type': 'application/json' } });
});
```

#### QW7: Dodaj Error Boundary na poziomie całej aplikacji
**Priorytet:** 🔴 Wysoki
**Effort:** 1h
**Impact:** Zapobiega crashom UI

```typescript
// src/components/AppErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h1>Coś poszło nie tak</h1>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Spróbuj ponownie</button>
    </div>
  );
}

// Wrap App.tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### 📊 MEDIUM PRIORITY (1-2 tygodnie)

#### M1: Zaimplementuj Analytics Dashboard
**Priorytet:** 🔴 Wysoki
**Effort:** 3-5 dni
**Impact:** Wgląd w użytkowanie i koszty

**Features:**
- Response times (avg, p50, p95, p99)
- Success rate (% successful queries)
- API costs (Claude API, ISAP API)
- Most asked questions
- User retention
- Error rate

**Tech stack:**
- Dodaj tabele: `analytics_events`, `api_costs`, `performance_metrics`
- Dashboard: Chart.js lub Recharts
- Backend: Nowy edge function `/analytics`

#### M2: Zaimplementuj Premium Password Verification w Backendzie
**Priorytet:** 🔴 Wysoki (SECURITY!)
**Effort:** 2-3h
**Impact:** Eliminuje security risk

```typescript
// supabase/functions/verify-premium/index.ts
serve(async (req) => {
  const { password } = await req.json();
  const correctPassword = Deno.env.get('PREMIUM_PASSWORD');

  return new Response(JSON.stringify({
    valid: password === correctPassword,
  }), { headers: { 'Content-Type': 'application/json' } });
});

// Frontend: src/pages/Index.tsx
const handlePremiumPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  const { data } = await supabase.functions.invoke('verify-premium', {
    body: { password: premiumPassword },
  });

  if (data?.valid) {
    // ... unlock premium
  }
};
```

#### M3: Dodaj Caching Layer dla ELI MCP (Redis)
**Priorytet:** 🟡 Średni
**Effort:** 5-7 dni
**Impact:** Drastycznie szybsze response times

**Plan:**
1. Deploy Redis (Upstash lub Redis Cloud)
2. Cache article content (TTL: 7 dni)
3. Cache act resolutions (TTL: 30 dni)
4. Cache ISAP search results (TTL: 1 dzień)

```typescript
// eli-mcp-server/src/redis-cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: Deno.env.get('REDIS_URL'),
  token: Deno.env.get('REDIS_TOKEN'),
});

export async function cacheArticle(key: string, data: any) {
  await redis.setex(key, 604800, JSON.stringify(data)); // 7 days
}

export async function getCachedArticle(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}
```

#### M4: Implementuj Input Sanitization
**Priorytet:** 🔴 Wysoki (SECURITY!)
**Effort:** 2-3h
**Impact:** Eliminuje XSS risk

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

// Use in FileUpload.tsx
const sanitizedContent = sanitizeInput(extractedText);
```

#### M5: Dodaj Offline Mode
**Priorytet:** 🟢 Niski
**Effort:** 3-4 dni
**Impact:** Lepszy UX na mobile

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// In Index.tsx
const isOnline = useOnlineStatus();

if (!isOnline) {
  return <OfflineBanner />;
}
```

#### M6: Implementuj Export Konwersacji do PDF
**Priorytet:** 🟢 Niski
**Effort:** 2-3 dni
**Impact:** Nice-to-have feature

**Libraries:**
- jsPDF lub react-pdf

```typescript
import jsPDF from 'jspdf';

function exportToPDF(messages: Message[]) {
  const doc = new jsPDF();

  messages.forEach((msg, i) => {
    doc.text(`${msg.role}: ${msg.content}`, 10, 10 + i * 10);
  });

  doc.save('konwersacja.pdf');
}
```

### 🎯 LONG-TERM (3+ miesięcy)

#### L1: User Accounts & Authentication
**Priorytet:** 🔴 Wysoki
**Effort:** 2-3 tygodnie
**Impact:** Personalizacja, lepsze analytics

**Features:**
- Sign up / Sign in (email + password, Google OAuth)
- Saved conversations (cloud sync)
- Premium subscriptions (Stripe)
- User preferences (dark mode, notifications)
- Conversation history search

**Tech:**
- Supabase Auth
- Stripe for payments
- RLS policies per user

#### L2: Multimodal AI - Obrazy i Diagramy
**Priorytet:** 🟡 Średni
**Effort:** 4-6 tygodni
**Impact:** Wow factor, lepsze wyjaśnienia

**Features:**
- Upload obrazów (zdjęcia dokumentów, screenshoty)
- AI analizuje obrazy (Claude Vision API)
- Generowanie diagramów (flowcharty dla procedur prawnych)
- OCR dla dokumentów

#### L3: Integracja z Bazami Orzeczeń Sądowych
**Priorytet:** 🟡 Średni
**Effort:** 6-8 tygodni
**Impact:** Pełniejsze odpowiedzi

**Źródła:**
- Orzeczenia SN (sn.pl)
- Orzeczenia NSA (orzeczenia.nsa.gov.pl)
- Orzeczenia sądów powszechnych

#### L4: Voice Input/Output
**Priorytet:** 🟢 Niski
**Effort:** 3-4 tygodnie
**Impact:** Accessibility, mobile UX

**Tech:**
- Web Speech API (voice input)
- Text-to-Speech API (voice output)

#### L5: Mobile App (React Native)
**Priorytet:** 🟢 Niski
**Effort:** 3-4 miesiące
**Impact:** Większy reach

**Features:**
- Native app dla iOS i Android
- Push notifications
- Offline mode
- Share conversations

#### L6: Public API dla Developerów
**Priorytet:** 🟢 Niski
**Effort:** 4-6 tygodni
**Impact:** Nowe revenue stream

**Features:**
- API endpoints (REST + GraphQL)
- API keys management
- Rate limiting per API key
- Pricing tiers
- Documentation (OpenAPI)

---

## 🗺️ ROADMAP ROZWOJU

### Q1 2025 (Styczeń - Marzec)

**Cel:** Stabilizacja i optymalizacja

✅ **Tydzień 1-2:**
- [ ] Fix wszystkie 🔴 Krytyczne problemy security (P3.1, P7.1)
- [ ] Implementuj Quick Wins (QW1-QW7)
- [ ] Dodaj monitoring (Sentry)
- [ ] Dodaj health check endpoint

✅ **Tydzień 3-4:**
- [ ] Analytics Dashboard (M1)
- [ ] Premium password w backendzie (M2)
- [ ] Input sanitization (M4)

✅ **Tydzień 5-8:**
- [ ] Redis caching (M3)
- [ ] Offline mode (M5)
- [ ] Export do PDF (M6)

✅ **Tydzień 9-12:**
- [ ] Performance optimization (system prompt compression)
- [ ] Testing coverage (unit + integration)
- [ ] Documentation update

### Q2 2025 (Kwiecień - Czerwiec)

**Cel:** Nowe funkcjonalności

✅ **Miesiąc 1:**
- [ ] User Accounts (L1) - podstawowa implementacja
- [ ] Email notifications
- [ ] Conversation search

✅ **Miesiąc 2:**
- [ ] Premium subscriptions (Stripe)
- [ ] Advanced analytics
- [ ] A/B testing framework

✅ **Miesiąc 3:**
- [ ] Multimodal AI (L2) - prototyp
- [ ] Image upload + OCR
- [ ] Diagram generation

### Q3 2025 (Lipiec - Wrzesień)

**Cel:** Rozszerzenie źródeł danych

✅ **Miesiąc 1-2:**
- [ ] Integracja z bazami orzeczeń (L3)
- [ ] Advanced search
- [ ] Citation system

✅ **Miesiąc 3:**
- [ ] Voice input/output (L4)
- [ ] Accessibility improvements
- [ ] Mobile-first redesign

### Q4 2025 (Październik - Grudzień)

**Cel:** Mobile i API

✅ **Miesiąc 1-2:**
- [ ] Mobile app (L5) - React Native
- [ ] Push notifications
- [ ] App Store + Google Play

✅ **Miesiąc 3:**
- [ ] Public API (L6)
- [ ] API documentation
- [ ] Developer portal

---

## 📈 METRYKI I KPI

### Obecnie Brakujące Metryki

| Kategoria | Metrika | Status | Priorytet |
|-----------|---------|--------|-----------|
| **Performance** | Avg response time | ❌ Brak | 🔴 Wysoki |
| | P95 response time | ❌ Brak | 🔴 Wysoki |
| | Success rate | ❌ Brak | 🔴 Wysoki |
| **Costs** | Claude API cost/day | ❌ Brak | 🔴 Wysoki |
| | ELI MCP calls/day | ❌ Brak | 🟡 Średni |
| **Usage** | Daily active users | ❌ Brak | 🔴 Wysoki |
| | Questions/day | ❌ Brak | 🔴 Wysoki |
| | Avg questions/user | ❌ Brak | 🟡 Średni |
| **Quality** | Positive feedback % | ✅ Częściowe | 🔴 Wysoki |
| | Avg conversation length | ❌ Brak | 🟢 Niski |
| **Errors** | Error rate | ❌ Brak | 🔴 Wysoki |
| | Most common errors | ❌ Brak | 🔴 Wysoki |

### Proponowane KPI dla 2025

**Q1 Targets:**
- ✅ Response time < 5s (p95)
- ✅ Success rate > 95%
- ✅ Error rate < 2%
- ✅ Positive feedback > 80%

**Q2 Targets:**
- ✅ DAU > 1000
- ✅ Questions/day > 5000
- ✅ Premium conversion > 5%
- ✅ Claude API cost < $500/month

**Q3 Targets:**
- ✅ DAU > 5000
- ✅ Mobile users > 30%
- ✅ Avg conversation length > 5 messages
- ✅ User retention (7-day) > 40%

**Q4 Targets:**
- ✅ DAU > 10000
- ✅ API revenue > $2000/month
- ✅ Mobile app downloads > 50000
- ✅ NPS > 50

---

## 🎬 PODSUMOWANIE I NEXT STEPS

### Co Działa Dobrze ✅

1. **Solid Architecture** - Serverless, skalowalna, cost-effective
2. **Intelligent Legal Context** - 30+ tematów, auto-enrichment
3. **3-Level Caching** - Hardcoded → LRU → ISAP API
4. **Real-time Streaming** - Smooth UX
5. **Good Developer Experience** - TypeScript, Vite, modern tooling

### Co Wymaga Natychmiastowej Uwagi 🚨

1. **Security Issues** - Hardcoded passwords, XSS risk
2. **Monitoring & Analytics** - Brak wglądu w performance i koszty
3. **Error Handling** - Brak centralized logging
4. **Performance** - Długi system prompt, brak timeoutów
5. **Scalability** - localStorage limits, no cache persistence

### Polecane Pierwsze Kroki (Kolejne 2 Tygodnie)

**Tydzień 1:**
1. ✅ Fix premium password (P3.1) - przenieś do backend
2. ✅ Dodaj input sanitization (P7.1) - DOMPurify
3. ✅ Implementuj wszystkie Quick Wins (QW1-QW7)
4. ✅ Setup Sentry dla error logging

**Tydzień 2:**
1. ✅ Analytics Dashboard (M1) - podstawowa wersja
2. ✅ Health check endpoint (QW6)
3. ✅ Performance metrics tracking
4. ✅ Code cleanup + documentation update

### Rekomendacje Długoterminowe

1. **Invest in Monitoring** - Bez analytics jesteś ślepy
2. **Prioritize Security** - Audyt security co kwartał
3. **Build for Scale** - Redis cache, CDN, load balancing
4. **Focus on UX** - A/B testing, user feedback sessions
5. **Monetization** - Premium tiers, API access, B2B licensing

---

## 📞 KONTAKT I FEEDBACK

Jeśli masz pytania lub sugestie dotyczące tej analizy:

- **Email:** [kontakt@najakiejpodstawie.pl]
- **GitHub Issues:** [https://github.com/karolpolikarp/najakiejpodstawie/issues]
- **Slack:** [#development channel]

**Autorzy:**
- Claude Code (analiza automatyczna)
- Karol Polikarp (review i zatwierdzenie)

**Wersja dokumentu:** 1.0
**Ostatnia aktualizacja:** 2025-11-10

---

**Koniec raportu**
