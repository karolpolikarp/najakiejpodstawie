# 🚀 Automatyczny Deployment do Supabase

Ten projekt używa GitHub Actions do automatycznego deploymentu Edge Functions i migracji do Supabase.

## 📋 Wymagane GitHub Secrets

Aby automatyczny deployment działał, musisz skonfigurować następujące sekrety w GitHub:

### Jak dodać sekrety:
1. Idź do swojego repozytorium na GitHub
2. Kliknij **Settings** → **Secrets and variables** → **Actions**
3. Kliknij **New repository secret**
4. Dodaj poniższe sekrety:

### Lista wymaganych sekretów:

#### 1. `SUPABASE_ACCESS_TOKEN`
**Gdzie znaleźć:**
- Zaloguj się na https://app.supabase.com
- Kliknij swoją ikonę w prawym górnym rogu
- Wybierz **Access Tokens**
- Kliknij **Generate New Token**
- Nadaj nazwę (np. "GitHub Actions") i skopiuj token

**Nazwa sekretu:** `SUPABASE_ACCESS_TOKEN`
**Wartość:** Wklej skopiowany token

#### 2. `SUPABASE_PROJECT_ID`
**Gdzie znaleźć:**
- W panelu Supabase, otwórz swój projekt
- Idź do **Settings** → **General**
- Znajdź **Reference ID** (to jest Project ID)

**Nazwa sekretu:** `SUPABASE_PROJECT_ID`
**Wartość:** np. `abcdefghijklmnop`

#### 3. `SUPABASE_DB_PASSWORD` (opcjonalne, tylko dla migracji)
**Gdzie znaleźć:**
- W panelu Supabase: **Settings** → **Database**
- Znajdź sekcję **Database Password**
- Skopiuj hasło (lub zresetuj jeśli zapomniałeś)

**Nazwa sekretu:** `SUPABASE_DB_PASSWORD`
**Wartość:** Twoje hasło do bazy danych

---

## ⚙️ Jak działa automatyczny deployment?

### Wyzwalanie workflow:
Workflow automatycznie uruchamia się gdy:
1. ✅ Zmergeujesz Pull Request do `main` lub `master`
2. ✅ Pushjesz bezpośrednio do `main` lub `master`
3. ✅ Ręcznie uruchomisz workflow z zakładki Actions

### Co się deployuje:
- **Edge Functions** - gdy zmieniasz pliki w `supabase/functions/`
- **Migracje** - gdy dodajesz nowe pliki w `supabase/migrations/`

### Workflow:
1. Sprawdza czy są zmiany w `supabase/functions/` lub `supabase/migrations/`
2. Instaluje Supabase CLI
3. Linkuje projekt używając `SUPABASE_PROJECT_ID`
4. Deployuje Edge Functions (jeśli były zmiany)
5. Uruchamia migracje (jeśli były nowe)

---

## 🔍 Monitorowanie deploymentu

1. Idź do zakładki **Actions** w swoim repozytorium GitHub
2. Zobacz status najnowszych deploymentów
3. Kliknij na konkretny workflow aby zobaczyć logi

---

## 🛠 Ręczny deployment (jeśli potrzebny)

Jeśli chcesz ręcznie wdrożyć zmiany:

### Edge Functions:
```bash
# Wszystkie funkcje
supabase functions deploy --project-ref YOUR_PROJECT_ID

# Konkretna funkcja
supabase functions deploy legal-assistant --project-ref YOUR_PROJECT_ID
supabase functions deploy get-questions --project-ref YOUR_PROJECT_ID
```

### Migracje:
```bash
supabase db push --project-ref YOUR_PROJECT_ID
```

---

## ❓ Troubleshooting

### Problem: "Project not found"
- Sprawdź czy `SUPABASE_PROJECT_ID` jest poprawne
- Sprawdź czy `SUPABASE_ACCESS_TOKEN` nie wygasł

### Problem: "Authentication failed"
- Wygeneruj nowy Access Token w Supabase
- Zaktualizuj sekret `SUPABASE_ACCESS_TOKEN` na GitHub

### Problem: "Migration failed"
- Sprawdź czy `SUPABASE_DB_PASSWORD` jest poprawne
- Sprawdź logi w zakładce Actions

### Problem: Workflow się nie uruchamia
- Sprawdź czy zmieniłeś pliki w katalogach `supabase/functions/` lub `supabase/migrations/`
- Sprawdź czy pushowałeś do brancha `main` lub `master`
- Możesz uruchomić ręcznie: Actions → Deploy to Supabase → Run workflow

---

## 📝 Notatki

- Pierwszy deployment może potrwać kilka minut
- Edge Functions są deployowane bez weryfikacji JWT (`--no-verify-jwt`)
- Workflow automatycznie wykrywa które komponenty się zmieniły i deployuje tylko je
- Możesz ręcznie uruchomić deployment używając przycisku "Run workflow" w zakładce Actions
