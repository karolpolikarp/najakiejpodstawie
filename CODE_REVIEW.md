# Przegląd Kodu - NaJakiejPodstawie.pl
## Raport z rekomendacjami ulepszeń

Data: 2025-11-06

---

## 🔴 Krytyczne problemy bezpieczeństwa

### 1. Hard-coded hasło w PasswordGate
**Lokalizacja:** `src/components/PasswordGate.tsx:7`

**Problem:**
```typescript
const CORRECT_PASSWORD = 'lex';
```
Hasło jest zahardkodowane w kodzie źródłowym, który jest publicznie dostępny (frontend). To **nie zapewnia żadnej ochrony**.

**Rozwiązanie:**
- Usunąć PasswordGate i zastąpić prawdziwą autentykacją (Supabase Auth)
- Lub przenieść logikę autoryzacji do backendu
- Alternatywnie: użyć environment variable + bcrypt hash, ale to nadal nie jest bezpieczne dla frontendu

### 2. CORS pozwala na wszystkie źródła
**Lokalizacja:** `supabase/functions/legal-assistant/index.ts:5`

**Problem:**
```typescript
'Access-Control-Allow-Origin': '*'
```

**Rozwiązanie:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://najakiejpodstawie.pl',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### 3. Brak rate limiting i walidacji po stronie backendu
**Lokalizacja:** `supabase/functions/legal-assistant/index.ts`

**Problem:** Brak ochrony przed nadużyciami (spam, DoS)

**Rozwiązanie:**
- Implementacja rate limiting w Edge Function
- Walidacja długości message (max chars)
- Walidacja fileContext size
- Logowanie podejrzanej aktywności

---

## 🟡 Problemy z TypeScript i bezpieczeństwem typów

### 4. Zbyt liberalna konfiguracja TypeScript
**Lokalizacja:** `tsconfig.json:9-14`

**Problem:**
```json
{
  "noImplicitAny": false,
  "noUnusedParameters": false,
  "noUnusedLocals": false,
  "strictNullChecks": false
}
```

**Rozwiązanie:** Włączyć strict mode:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### 5. Brak walidacji zmiennych środowiskowych
**Lokalizacja:** `src/integrations/supabase/client.ts`

**Problem:** Brak sprawdzenia czy zmienne środowiskowe są zdefiniowane

**Rozwiązanie:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

---

## 🟠 Problemy z jakością kodu

### 6. Brak obsługi błędów i retry logic
**Lokalizacja:** `src/pages/Index.tsx:31-52`

**Problem:**
- Jednorazowa próba wywołania API
- Ogólny komunikat błędu
- Brak rozróżnienia typów błędów (network, 429, 500, etc.)

**Rozwiązanie:**
```typescript
const MAX_RETRIES = 3;

const handleSendMessage = async (content: string, retryCount = 0) => {
  addMessage({ role: 'user', content });
  setLoading(true);

  try {
    const { data, error } = await supabase.functions.invoke('legal-assistant', {
      body: {
        message: content,
        fileContext: attachedFile?.content || null,
      },
    });

    if (error) {
      // Check if it's a rate limit error
      if (error.message?.includes('429') && retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        toast.info(`Zbyt wiele zapytań. Ponawiam za ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return handleSendMessage(content, retryCount + 1);
      }
      throw error;
    }

    if (data?.message) {
      addMessage({ role: 'assistant', content: data.message });
    }
  } catch (error: any) {
    console.error('Error calling legal assistant:', error);

    // Specific error messages
    if (error.message?.includes('429')) {
      toast.error('Przekroczono limit zapytań. Spróbuj za chwilę.');
    } else if (error.message?.includes('network')) {
      toast.error('Błąd połączenia. Sprawdź internet.');
    } else {
      toast.error('Nie udało się przetworzyć pytania');
    }

    addMessage({
      role: 'assistant',
      content: 'Niestety coś poszło nie tak. Spróbuj zadać pytanie ponownie lub sformułuj je inaczej.',
    });
  } finally {
    setLoading(false);
  }
};
```

### 7. Magic strings i numbers w kodzie
**Problem:** Hardkodowane wartości rozrzucone po kodzie

**Rozwiązanie:** Stwórz plik `src/lib/constants.ts`:
```typescript
export const CONSTANTS = {
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    MAX_CONTENT_LENGTH: 50000,
    ALLOWED_TYPES: ['text/plain', 'application/pdf'] as const,
  },
  API: {
    MAX_RETRIES: 3,
    TIMEOUT_MS: 30000,
  },
  STORAGE: {
    CHAT_KEY: 'chat-storage',
    AUTH_KEY: 'app_authenticated',
  },
  EDGE_FUNCTION: {
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
    MODEL: 'claude-3-5-haiku-20241022',
    FILE_CONTEXT_LIMIT: 30000,
  },
} as const;
```

### 8. Brak debouncing na wejściu użytkownika
**Lokalizacja:** `src/components/ChatInput.tsx`

**Problem:** Każde naciśnięcie klawisza powoduje re-render

**Rozwiązanie:** Dodaj custom hook:
```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 9. Brak memoizacji w komponentach
**Lokalizacja:** `src/components/ChatMessage.tsx`

**Problem:** Komponenty re-renderują się niepotrzebnie

**Rozwiązanie:**
```typescript
import { memo, useMemo } from 'react';

export const ChatMessage = memo(({ role, content }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const formattedContent = useMemo(() => {
    if (role === 'assistant') {
      return formatAssistantMessage(content);
    }
    return content;
  }, [role, content]);

  // ... rest of component
});
```

### 10. Nieprawidłowe czytanie PDF
**Lokalizacja:** `src/components/FileUpload.tsx:42-52`

**Problem:**
```typescript
content = await file.text(); // To NIE działa dla większości PDF-ów
```

**Rozwiązanie:** Użyj dedykowanej biblioteki:
```bash
npm install pdfjs-dist
```

```typescript
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};
```

---

## 🟢 Ulepszenia funkcjonalności i UX

### 11. AttachedFile persisted w localStorage
**Lokalizacja:** `src/store/chatStore.ts:48`

**Problem:** Załączony plik jest zapisywany w localStorage, co:
- Może przekroczyć limit 5MB localStorage
- Źle wpływa na UX (użytkownik wraca i widzi stary plik)

**Rozwiązanie:**
```typescript
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      attachedFile: null, // This should NOT be persisted
      // ...
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages
        // Explicitly exclude attachedFile and isLoading
      }),
    }
  )
);
```

### 12. Brak Error Boundary
**Problem:** Niezłapane błędy powodują crash całej aplikacji

**Rozwiązanie:** Dodaj `src/components/ErrorBoundary.tsx`:
```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-main p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Coś poszło nie tak</h1>
            <p className="text-muted-foreground mb-4">
              Przepraszamy za problemy. Spróbuj odświeżyć stronę.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Użyj w `App.tsx`:
```typescript
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    {/* ... */}
  </QueryClientProvider>
</ErrorBoundary>
```

### 13. Brak czyszczenia stanu przy wylogowaniu
**Lokalizacja:** `src/pages/Index.tsx:60-63`

**Problem:**
```typescript
const handleLogout = () => {
  localStorage.removeItem('app_authenticated');
  window.location.reload(); // Brutalna metoda
};
```

**Rozwiązanie:**
```typescript
const handleLogout = () => {
  // Clear all state
  clearMessages();
  setAttachedFile(null);
  localStorage.removeItem('app_authenticated');
  toast.success('Wylogowano pomyślnie');
  window.location.reload();
};
```

### 14. Brak informacji o liczbie użytych tokenów
**Problem:** Użytkownik nie wie ile kosztuje jego zapytanie

**Rozwiązanie:** Zwracaj usage z Edge Function:
```typescript
// W index.ts Edge Function
const data = await response.json();
const assistantMessage = data.content[0].text;

return new Response(
  JSON.stringify({
    message: assistantMessage,
    usage: data.usage // { input_tokens, output_tokens }
  }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

Wyświetl w Footer:
```typescript
<p className="text-xs text-muted-foreground">
  Zużyte tokeny: {totalTokens.toLocaleString('pl-PL')}
</p>
```

### 15. Brak loading state dla długich odpowiedzi
**Problem:** Użytkownik nie widzi postępu przy długich odpowiedziach

**Rozwiązanie:** Użyj streaming API (Claude supports streaming):
```typescript
// W Edge Function zmień na streaming
const response = await fetch('https://api.anthropic.com/v1/messages', {
  // ...
  headers: {
    // ...
    'anthropic-version': '2023-06-01',
    'accept': 'text/event-stream', // Enable streaming
  },
  // ...
});

// Return SSE stream
return new Response(response.body, {
  headers: {
    ...corsHeaders,
    'Content-Type': 'text/event-stream',
  },
});
```

---

## 🔵 Optymalizacja bundle size

### 16. Zbyt wiele nieużywanych zależności
**Lokalizacja:** `package.json`

**Problem:** Wiele komponentów Radix UI, które nie są używane:
- react-resizable-panels
- react-day-picker
- recharts
- input-otp
- vaul
- cmdk
- embla-carousel-react
- react-hook-form (być może nieużywany)

**Rozwiązanie:**
```bash
# Sprawdź nieużywane zależności
npx depcheck

# Usuń nieużywane
npm uninstall react-resizable-panels react-day-picker recharts input-otp vaul cmdk embla-carousel-react
```

### 17. Brak code splitting
**Problem:** Cały bundle ładowany na starcie

**Rozwiązanie:**
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const Index = lazy(() => import('./pages/Index'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PasswordGate>
          <BrowserRouter>
            <Suspense fallback={<div>Ładowanie...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/o-nas" element={<About />} />
                {/* ... */}
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PasswordGate>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
```

---

## 🧪 Testowanie

### 18. Brak testów
**Problem:** Projekt nie ma żadnych testów

**Rozwiązanie:** Dodaj Vitest + Testing Library:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Przykładowy test:
```typescript
// src/components/__tests__/ChatMessage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(<ChatMessage role="user" content="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('parses assistant message with legal basis', () => {
    const content = `
PODSTAWA PRAWNA
Ustawa z dnia 30 maja 2014 r.

CO TO OZNACZA
Wyjaśnienie...
    `;
    render(<ChatMessage role="assistant" content={content} />);
    expect(screen.getByText(/PODSTAWA PRAWNA/i)).toBeInTheDocument();
  });
});
```

---

## 📊 Monitoring i Analytics

### 19. Brak error tracking
**Rozwiązanie:** Dodaj Sentry:
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 20. Brak analytics
**Rozwiązanie:** Dodaj Plausible (privacy-friendly):
```html
<!-- index.html -->
<script defer data-domain="najakiejpodstawie.pl" src="https://plausible.io/js/script.js"></script>
```

---

## 🎨 UI/UX Improvements

### 21. Brak skeleton loaders
**Problem:** Loading state nie pokazuje struktury odpowiedzi

**Rozwiązanie:**
```typescript
// src/components/MessageSkeleton.tsx
export const MessageSkeleton = () => (
  <div className="mb-4 animate-pulse">
    <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary mb-4">
      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
      <div className="h-3 bg-muted rounded w-full mb-1" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
      <div className="h-3 bg-muted rounded w-full mb-1" />
      <div className="h-3 bg-muted rounded w-4/6" />
    </div>
  </div>
);
```

### 22. Brak keyboard shortcuts
**Rozwiązanie:**
```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export const useKeyboardShortcuts = (handlers: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handlers.focusInput?.();
      }
      // Ctrl/Cmd + / - Clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        handlers.clearChat?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
```

### 23. Brak offline support
**Rozwiązanie:** Dodaj Service Worker (PWA):
```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NaJakiejPodstawie.pl',
        short_name: 'NaJakiejPodstawie',
        description: 'Asystent prawny',
        theme_color: '#22c55e',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

---

## 📝 Dokumentacja

### 24. Brak JSDoc comments
**Rozwiązanie:**
```typescript
/**
 * Sends a message to the legal assistant AI and handles the response
 * @param content - The user's question/message
 * @param retryCount - Current retry attempt (default: 0)
 * @throws {Error} When API call fails after max retries
 */
const handleSendMessage = async (content: string, retryCount = 0) => {
  // ...
};
```

### 25. Brak API documentation
**Rozwiązanie:** Dodaj OpenAPI spec dla Edge Function:
```yaml
# supabase/functions/legal-assistant/openapi.yaml
openapi: 3.0.0
info:
  title: Legal Assistant API
  version: 1.0.0
paths:
  /legal-assistant:
    post:
      summary: Get legal advice from AI
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  description: User's legal question
                fileContext:
                  type: string
                  nullable: true
                  description: Optional uploaded document content
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
```

---

## 🏗️ Architecture

### 26. Brak separacji concerns
**Problem:** Logika biznesowa w komponentach UI

**Rozwiązanie:** Wydziel custom hooks:
```typescript
// src/hooks/useLegalAssistant.ts
export const useLegalAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string, fileContext?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-assistant', {
        body: { message, fileContext },
      });
      if (error) throw error;
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
};
```

### 27. Brak API client abstraction
**Rozwiązanie:**
```typescript
// src/lib/api/legal-assistant.ts
export class LegalAssistantAPI {
  private static async callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    // Retry logic
  }

  static async sendMessage(
    message: string,
    fileContext?: string
  ): Promise<{ message: string }> {
    return this.callWithRetry(async () => {
      const { data, error } = await supabase.functions.invoke('legal-assistant', {
        body: { message, fileContext },
      });
      if (error) throw error;
      return data;
    });
  }
}
```

---

## ✅ Zaimplementowane ulepszenia (2025-11-06)

Poniższe ulepszenia zostały już zaimplementowane:

1. ✅ **PasswordGate** - hasło można teraz ustawić przez zmienną środowiskową `VITE_APP_PASSWORD`
2. ✅ **CORS** - ograniczony do whitelisty domen (localhost dla dev, można ustawić `ALLOWED_ORIGINS` w Supabase)
3. ✅ **Constants.ts** - wszystkie magic values przeniesione do centralnego pliku
4. ✅ **localStorage persist** - usunięto `attachedFile` z persystencji (fix limitu 5MB)
5. ✅ **Memoization** - dodano `React.memo` i `useMemo` do `ChatMessage`
6. ✅ **Error Boundary** - globalna obsługa błędów React z przyjaznym UI
7. ✅ **Retry logic** - exponential backoff dla błędów 429 i network errors (max 3 próby)
8. ✅ **Error handling** - szczegółowe komunikaty błędów (429, network, 401, timeout)
9. ✅ **Env validation** - walidacja zmiennych środowiskowych z Zod
10. ✅ **TypeScript strict mode** - włączono `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
11. ✅ **Cleanup dependencies** - usunięto nieużywane paczki (@hookform/resolvers, date-fns, @tailwindcss/typography)

### 📝 Pozostałe do zrobienia:

**Naprawa czytania PDF** - obecna implementacja używa `file.text()` co nie działa dla większości PDF-ów.
Zalecane rozwiązanie: zainstaluj `pdfjs-dist` i zaimplementuj poprawne wyciąganie tekstu (patrz punkt 10 w raporcie).

---

## 📋 Podsumowanie priorytetów

### 🔴 Krytyczne (do naprawienia natychmiast):
1. **Bezpieczeństwo hasła** - usuń hard-coded password
2. **CORS** - ogranicz do konkretnej domeny
3. **TypeScript strict mode** - włącz strict
4. **Environment variables validation** - walidacja z Zod

### 🟡 Ważne (do naprawienia wkrótce):
5. **Error handling** - retry logic, lepsze komunikaty
6. **PDF reading** - użyj pdf.js
7. **Rate limiting** - dodaj w Edge Function
8. **Error boundary** - obsługa błędów React
9. **Bundle size** - usuń nieużywane zależności

### 🟢 Nice to have (ulepszenia):
10. **Tests** - dodaj Vitest
11. **Code splitting** - lazy loading
12. **Memoization** - React.memo, useMemo
13. **Keyboard shortcuts**
14. **PWA support**
15. **Analytics & monitoring**

---

## 🚀 Kolejne kroki

Sugeruję implementację w tej kolejności:

**Sprint 1 (Bezpieczeństwo):**
- [ ] Zastąp PasswordGate prawdziwą autentykacją
- [ ] Ogranicz CORS
- [ ] Włącz TypeScript strict mode
- [ ] Dodaj walidację env variables

**Sprint 2 (Stabilność):**
- [ ] Dodaj retry logic i error handling
- [ ] Napraw czytanie PDF (pdf.js)
- [ ] Dodaj Error Boundary
- [ ] Wyczyść nieużywane zależności

**Sprint 3 (Jakość):**
- [ ] Dodaj testy (coverage > 70%)
- [ ] Dodaj code splitting
- [ ] Optymalizacja performance (memoization)
- [ ] Dodaj rate limiting

**Sprint 4 (UX):**
- [ ] Keyboard shortcuts
- [ ] Streaming responses
- [ ] PWA support
- [ ] Analytics

---

**Autor:** Claude Code Review
**Wersja:** 1.0
**Następny przegląd:** Po implementacji Sprint 1
