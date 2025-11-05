# NaJakiejPodstawie.pl

Asystent prawny pomagający znaleźć podstawę prawną w polskim prawie w kilka sekund.

## Technologie

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn-ui + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: Anthropic Claude API (model: claude-3-5-haiku-20241022)

## Konfiguracja

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja zmiennych środowiskowych

#### Frontend (.env)
Skopiuj plik `.env` i uzupełnij dane z Twojego projektu Supabase:

```env
VITE_SUPABASE_PROJECT_ID="twoj-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="twoj-anon-key"
VITE_SUPABASE_URL="https://twoj-project-id.supabase.co"
```

#### Supabase Edge Function
W panelu Supabase (Settings > Edge Functions > Secrets) dodaj:

```
ANTHROPIC_API_KEY=twoj-klucz-api-anthropic
```

### 3. Jak uzyskać klucz API Anthropic

1. Załóż konto na https://console.anthropic.com/
2. Przejdź do Settings > API Keys
3. Kliknij "Create Key"
4. Skopiuj klucz i dodaj go do Supabase Secrets

**Koszt**: Claude 3.5 Haiku to $1 za milion tokenów input, $5 za milion tokenów output (bardzo tani!)

### 4. Uruchomienie lokalnie

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

## Deployment

### Supabase Edge Function

Aby wdrożyć Edge Function:

```bash
# Zainstaluj Supabase CLI
npm i supabase -g

# Zaloguj się
supabase login

# Link do projektu
supabase link --project-ref twoj-project-id

# Deploy funkcji
supabase functions deploy legal-assistant
```

### Frontend

Frontend możesz wdrożyć na:
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: `netlify deploy`
- **Cloudflare Pages**: połącz repo z panelem Cloudflare

## Struktura projektu

```
├── src/
│   ├── components/       # Komponenty React
│   ├── pages/           # Strony aplikacji
│   ├── store/           # Zustand state management
│   └── integrations/    # Integracja z Supabase
├── supabase/
│   └── functions/       # Edge Functions
│       └── legal-assistant/  # Funkcja AI
└── public/              # Pliki statyczne
```

## Licencja

Projekt stworzony dla celów edukacyjnych. Nie stanowi porady prawnej.
