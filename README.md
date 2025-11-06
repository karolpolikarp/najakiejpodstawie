# NaJakiejPodstawie.pl

Inteligentny asystent prawny wykorzystujący AI do znajdowania podstaw prawnych w polskim prawie.

## 🎯 O projekcie

**NaJakiejPodstawie.pl** to aplikacja webowa, która pomaga użytkownikom szybko znaleźć podstawę prawną dla różnych sytuacji życiowych. Wykorzystuje zaawansowane modele językowe AI do analizy pytań i dostarczania odpowiedzi w jasnej, przystępnej formie.

### Funkcje

- 💬 Czat z asystentem prawnym AI
- 📜 Wyszukiwanie konkretnych artykułów i aktów prawnych
- 📝 Wyjaśnienia w prostym języku
- 🔗 Linki do źródeł prawnych
- 🎨 Nowoczesny, responsywny interfejs
- 🔒 Opcjonalna ochrona hasłem

## 🛠️ Stack technologiczny

### Frontend
- **React 18** - biblioteka UI
- **TypeScript** - bezpieczny, typowany kod
- **Vite** - szybki bundler i dev server
- **shadcn/ui** - komponenty UI
- **Tailwind CSS** - stylowanie
- **Zustand** - zarządzanie stanem

### Backend
- **Supabase Edge Functions** - serverless backend
- **Anthropic Claude API** - model AI (claude-3-5-haiku-20241022)
- **Deno** - runtime dla Edge Functions

## 🚀 Deployment

### Wymagania

- Node.js 18+ i npm
- Konto Supabase (darmowe)
- Klucz API Anthropic (darmowy tier: $5 credits)

### Konfiguracja

1. **Klonuj repozytorium**
```bash
git clone https://github.com/karolpolikarp/najakiejpodstawie.git
cd najakiejpodstawie
npm install
```

2. **Utwórz projekt Supabase**
   - Załóż konto na https://supabase.com
   - Utwórz nowy projekt
   - Skopiuj dane z Settings > API

3. **Skonfiguruj zmienne środowiskowe**

Utwórz plik `.env`:
```env
VITE_SUPABASE_PROJECT_ID="twoj-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="twoj-anon-key"
VITE_SUPABASE_URL="https://twoj-project-id.supabase.co"
```

4. **Uzyskaj klucz Anthropic API**
   - Załóż konto na https://console.anthropic.com
   - Utwórz klucz API w Settings > API Keys
   - Dodaj secret w Supabase:
     - Idź do Settings > Edge Functions > Secrets
     - Dodaj: `ANTHROPIC_API_KEY` = twój-klucz

5. **Wdróż Edge Function**
   - Otwórz https://supabase.com/dashboard/project/[twoj-id]/functions
   - Utwórz funkcję o nazwie: `legal-assistant`
   - Skopiuj kod z `supabase/functions/legal-assistant/index.ts`
   - Kliknij "Deploy"

6. **Uruchom lokalnie**
```bash
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:8080`

### Deployment produkcyjny

#### Vercel (polecane)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

#### Cloudflare Pages
Połącz repozytorium GitHub z panelem Cloudflare Pages

## 💰 Koszty

- **Supabase**: Darmowe (Free tier: 50K MAU, 500MB bazy)
- **Anthropic Claude API**: ~$1 za milion tokenów input
- **Hosting**: Darmowy na Vercel/Netlify/Cloudflare

Dla małych projektów wszystko mieści się w darmowych tierach! 🎉

## 🔒 Zabezpieczenie hasłem

Aplikacja zawiera opcjonalne zabezpieczenie hasłem. Aby je zmienić lub wyłączyć:

**Zmiana hasła**: Edytuj `src/components/PasswordGate.tsx`, linia 7:
```typescript
const CORRECT_PASSWORD = 'twoje-haslo';
```

**Wyłączenie**: Usuń komponent `<PasswordGate>` z `src/App.tsx`

## 📄 Licencja

MIT License - projekt open source

## ⚠️ Disclaimer

Aplikacja służy celom informacyjnym i edukacyjnym. **Nie stanowi porady prawnej**. W indywidualnych sprawach skonsultuj się z prawnikiem.

## 🤝 Contributing

Pull requesty są mile widziane! W razie większych zmian, najpierw otwórz issue.

## 📧 Kontakt

Masz pytania? Otwórz issue na GitHubie.

---

Stworzono z wykorzystaniem React, TypeScript, Supabase i Anthropic Claude AI.
