# Deploy poprawek KSH i duplikacji tekstu

## Co naprawiłem:

### 1. ✅ Backend (eli-mcp-server) - JUŻ DZIAŁA
- Art. 10 KC ✅
- Art. 103 KC ✅
- Parsowanie PDF naprawione ✅

### 2. ⏳ Frontend (Supabase Edge Functions) - DO DEPLOY
- **KSH i inne kody** - dodane ksh, kks, kro, kpa, kkw
- **Duplikacja tekstu** - naprawione powtarzanie się tekstu

## Jak zdeployować:

### Opcja A: Przez GitHub (jeśli masz auto-deploy)

1. **Stwórz Pull Request:**
   ```bash
   # Branch jest już na GitHubie: claude/fix-article-search-parsing-011CUz2evNYUCUXbfAue6APJ
   # Otwórz PR na GitHub i zmerguj do main
   ```

2. **Auto-deploy powinien zdeployować automatycznie** (jeśli masz skonfigurowane)

### Opcja B: Ręczny deploy przez CLI

```bash
cd ~/najakiejpodstawie

# 1. Upewnij się że masz najnowszy kod
git checkout main
git pull origin main

# 2. Deploy Supabase functions
npx supabase functions deploy legal-assistant

# Lub jeśli masz zainstalowane globalnie:
supabase functions deploy legal-assistant
```

### Opcja C: Deploy przez Supabase Dashboard

1. Otwórz https://supabase.com/dashboard
2. Wybierz swój projekt
3. Idź do **Edge Functions** → **legal-assistant**
4. Kliknij **Deploy** i wybierz branch `main`

## Po deploy - test:

Przetestuj w czacie:

```
art 153 ksh
```

**Oczekiwany wynik:**
- ✅ Bez powtórzeń tekstu ("Nie znam kNie znam k...")
- ✅ Prawidłowa treść Art. 153 Kodeksu spółek handlowych

```
art 10 kc
```

**Oczekiwany wynik:**
- ✅ Pełna treść o pełnoletności (już działa)
- ✅ Bez powtórzeń

## Zmiany w kodzie:

1. **tool-calling.ts** - dodane kody:
   - ksh = Kodeks spółek handlowych
   - kks = Kodeks karny skarbowy
   - kro = Kodeks rodzinny i opiekuńczy
   - kpa = Kodeks postępowania administracyjnego
   - kkw = Kodeks karny wykonawczy

2. **index.ts** - naprawiona duplikacja:
   - Flaga `hasSeenToolUse`
   - Blokuje streamowanie przed tool calls
   - Zapobiega duplikacji tekstu

## Problemy?

Jeśli po deploy nadal nie działa:
1. Sprawdź czy deploy się udał (Supabase Dashboard → Logs)
2. Wyczyść cache przeglądarki
3. Sprawdź czy Edge Function działa: `curl https://[project-id].supabase.co/functions/v1/legal-assistant/health`
