# Integracja ELI MCP z najakiejpodstawie.pl

## Co zostało zrobione? ✅

Zintegrowano **ELI MCP Server** z głównym backendem aplikacji (Supabase Edge Function `legal-assistant`).

### Nowe pliki:
1. **`supabase/functions/legal-assistant/eli-tools.ts`** - Helper functions do komunikacji z ELI MCP
   - `detectArticleReferences()` - Wykrywa odniesienia do artykułów w pytaniach użytkownika
   - `fetchArticle()` - Pobiera treść artykułu z ELI MCP API
   - `enrichWithArticles()` - Główna funkcja wzbogacająca kontekst o artykuły

2. **`eli-mcp-server/`** - Standalone MCP server (już istniejący, ulepszony)
   - Ulepszona ekstrakcja tekstu z PDF
   - Czyszczenie błędów w polskich słowach (60+ poprawek)
   - API endpoints: `/tools/get_article`, `/tools/search_acts`

### Zmodyfikowane pliki:
1. **`supabase/functions/legal-assistant/index.ts`**
   - Dodano import `enrichWithArticles`
   - Dodano automatyczne wykrywanie i pobieranie artykułów
   - Artykuły są dodawane do kontekstu systemowego dla Claude

## Jak to działa? 🔄

### Flow działania:

```
Użytkownik: "Co mówi art 10 kodeksu pracy?"
                    ↓
Frontend (najakiejpodstawie.pl)
                    ↓
Supabase Edge Function: legal-assistant
                    ↓
eli-tools.detectArticleReferences("art 10 kodeksu pracy")
    → Wykrywa: {actCode: "kp", articleNumber: "10"}
                    ↓
eli-tools.fetchArticle("kp", "10")
    → HTTP POST → ELI MCP Server (localhost:8080 lub Raspberry Pi)
                    ↓
ELI MCP Server:
    - Pobiera PDF z api.sejm.gov.pl
    - Ekstrahuje i czyści tekst art. 10
    - Zwraca: {success: true, article: {text: "Art. 10. § 1. Każdy ma prawo..."}}
                    ↓
eli-tools.formatArticleContext()
    → Formatuje do kontekstu systemowego
                    ↓
Claude API (z kontekstem artykułu)
    → Generuje odpowiedź używając DOKŁADNEJ treści artykułu
                    ↓
Użytkownik otrzymuje poprawną odpowiedź
```

## Konfiguracja 🛠️

### 1. Zmienne środowiskowe (Supabase)

Dodaj do **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

```bash
ELI_MCP_URL=http://localhost:8080
# Lub jeśli ELI MCP działa na Raspberry Pi:
# ELI_MCP_URL=http://192.168.x.x:8080

ELI_API_KEY=dev-secret-key
# Zmień na bezpieczny klucz w produkcji!
```

**Jak dodać:**
1. Wejdź na https://supabase.com/dashboard/project/YOUR_PROJECT/settings/functions
2. Kliknij "Add Secret"
3. Nazwa: `ELI_MCP_URL`, Wartość: `http://YOUR_RASPBERRY_PI_IP:8080`
4. Nazwa: `ELI_API_KEY`, Wartość: `dev-secret-key`
5. Kliknij "Save"

### 2. Uruchomienie ELI MCP Server na Raspberry Pi

```bash
# Na Raspberry Pi
cd ~/najakiejpodstawie/eli-mcp-server

# Pull najnowszych zmian
git pull origin claude/eli-mcp-server-testing-011CUxejBzRqu1PuQBKhwjum

# Uruchom serwer
deno task start

# Powinno wyświetlić:
# 🚀 ELI MCP Server starting on port 8080...
# Listening on http://0.0.0.0:8080/
```

### 3. Opcjonalnie: Systemd Service (automatyczne uruchamianie)

Utwórz `/etc/systemd/system/eli-mcp.service`:

```ini
[Unit]
Description=ELI MCP Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/najakiejpodstawie/eli-mcp-server
ExecStart=/usr/bin/deno task start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Włącz:
```bash
sudo systemctl daemon-reload
sudo systemctl enable eli-mcp
sudo systemctl start eli-mcp
sudo systemctl status eli-mcp
```

### 4. Deploy do Supabase

```bash
# Z katalogu głównego projektu
cd ~/najakiejpodstawie

# Deploy zmienionej funkcji
npx supabase functions deploy legal-assistant

# Lub jeśli używasz supabase CLI:
supabase functions deploy legal-assistant
```

## Testowanie 🧪

### Test 1: Sprawdź czy ELI MCP działa

```bash
curl -X POST http://localhost:8080/tools/get_article \
  -H "Authorization: Bearer dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"actCode":"kp","articleNumber":"10"}'
```

Oczekiwany wynik: JSON z treścią Art. 10 Kodeksu pracy (bez błędów w słowach).

### Test 2: Sprawdź integrację przez frontend

1. Otwórz https://najakiejpodstawie.pl/czat
2. Zadaj pytanie: **"Co mówi art 10 kodeksu pracy?"**
3. Sprawdź logi Supabase:
   ```
   [ELI] Checking for article references in message...
   [ELI] Detected 1 article references: [{actCode: "kp", articleNumber: "10"}]
   [ELI] Fetching article: kp 10
   [ELI] Successfully fetched article kp 10
   [ELI] Successfully enriched with article context
   ```
4. Odpowiedź powinna zawierać DOKŁADNĄ treść z API:
   > Art. 10. § 1. Każdy ma prawo do swobodnie wybranej pracy. Nikomu, z wyjątkiem przypadków określonych w ustawie, nie można zabronić wykonywania zawodu.

### Test 3: Różne formaty pytań

Przetestuj różne warianty:
- ✅ "art 10 kp"
- ✅ "artykuł 10 kodeksu pracy"
- ✅ "art. 533 k.c."
- ✅ "art 148 kodeks karny"
- ✅ "co mówi artykuł 10 konstytucji"

## Wspierane kody aktów 📚

| Kod | Nazwa aktu | Przykład |
|-----|-----------|----------|
| `kc` | Kodeks cywilny | "art 533 kc" |
| `kp` | Kodeks pracy | "art 10 kp" |
| `kk` | Kodeks karny | "art 148 kk" |
| `kpk` | Kodeks postępowania karnego | "art 5 kpk" |
| `kpc` | Kodeks postępowania cywilnego | "art 187 kpc" |
| `konstytucja` | Konstytucja RP | "art 30 konstytucji" |

## Debugging 🔍

### Problem: Artykuły nie są pobierane

**Sprawdź logi Supabase:**
```bash
npx supabase functions logs legal-assistant
```

Szukaj:
- `[ELI] Checking for article references...` - Czy wykrywa artykuły?
- `[ELI] Fetching article: ...` - Czy próbuje pobrać?
- `[ELI] Successfully fetched...` - Czy udało się pobrać?

**Typowe problemy:**
1. **ELI MCP nie działa** → Uruchom `deno task start` na Raspberry Pi
2. **Błędny URL** → Sprawdź `ELI_MCP_URL` w Supabase Secrets
3. **Błędny klucz API** → Sprawdź `ELI_API_KEY` w Supabase Secrets
4. **Firewall blokuje** → Sprawdź czy port 8080 jest otwarty

### Problem: Odpowiedzi nadal błędne (jak przed integracją)

**Przyczyny:**
1. Funkcja nie została wdrożona → `supabase functions deploy legal-assistant`
2. Zmienne środowiskowe nie ustawione → Sprawdź Supabase Dashboard
3. Cache CDN (Vercel) → Poczekaj 1-2 minuty na odświeżenie

### Logi w czasie rzeczywistym

```bash
# Terminal 1: ELI MCP Server
cd ~/najakiejpodstawie/eli-mcp-server
deno task start

# Terminal 2: Supabase Functions
npx supabase functions serve --no-verify-jwt

# Terminal 3: Test
curl -X POST http://localhost:54321/functions/v1/legal-assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"art 10 kp"}'
```

## Monitoring 📊

### Metryki do śledzenia:
- Liczba wywołań ELI MCP API
- Czas odpowiedzi ELI MCP (powinien być < 2s)
- Rate limity (10 req/min obecnie)
- Sukces rate (% udanych zapytań do ELI)

### Logs w produkcji:
```bash
# Sprawdź logi funkcji legal-assistant
npx supabase functions logs legal-assistant --tail
```

## Bezpieczeństwo 🔒

### Obecne zabezpieczenia:
1. ✅ Authorization header z API key
2. ✅ Rate limiting (10 req/min)
3. ✅ CORS ograniczony do dozwolonych domen
4. ✅ Maksymalnie 5 artykułów na zapytanie

### TODO (produkcja):
- [ ] Zmień `ELI_API_KEY` na silny, losowy klucz
- [ ] Ogranicz dostęp do ELI MCP tylko z IP Supabase
- [ ] Dodaj monitoring i alerty
- [ ] Cache wyników (Redis) aby zmniejszyć obciążenie

## Następne kroki 🚀

1. **Deploy na produkcję:**
   ```bash
   supabase functions deploy legal-assistant
   git add -A
   git commit -m "Integracja ELI MCP z legal-assistant"
   git push
   ```

2. **Monitoruj użycie:**
   - Sprawdzaj logi przez pierwsze 24h
   - Zbieraj feedback użytkowników
   - Optymalizuj zapytania jeśli potrzeba

3. **Rozszerzenia (przyszłość):**
   - [ ] Cache popularnych artykułów w Supabase
   - [ ] Semantyczne wyszukiwanie artykułów (nie tylko numer)
   - [ ] Porównywanie wersji artykułów (historyczne vs aktualne)
   - [ ] Export odpowiedzi do PDF z pełnymi cytowaniami

## Podsumowanie ✨

**Przed integracją:**
- ❌ Claude odpowiadał z własnej wiedzy (często błędnie)
- ❌ Brak dostępu do aktualnych tekstów jednolitych
- ❌ Niepoprawne treści artykułów

**Po integracji:**
- ✅ Claude otrzymuje DOKŁADNE treści artykułów
- ✅ Dane z oficjalnych źródeł (api.sejm.gov.pl)
- ✅ Oczyszczone z błędów PDF
- ✅ Automatyczne wykrywanie pytań o artykuły
- ✅ Linki do ISAP w odpowiedziach

---

**Pytania? Problemy?** Sprawdź logi lub utwórz issue w repo.
