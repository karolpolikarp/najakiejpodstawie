# JakiePrawo.pl

**Znajdź podstawę prawną w polskim prawie w kilka sekund.**

---

## 🎯 Czym jest JakiePrawo.pl?

**JakiePrawo.pl** to nowoczesna aplikacja webowa wykorzystująca sztuczną inteligencję, która pomaga znaleźć konkretną podstawę prawną dla różnych sytuacji życiowych i biznesowych.

Zamiast godzinami przeszukiwać akty prawne, wystarczy zadać pytanie - a aplikacja w kilka sekund dostarczy:
- 📜 Konkretny artykuł i nazwę aktu prawnego
- 📝 Wyjaśnienie w zrozumiałym języku
- 🔗 Link do pełnego tekstu ustawy
- 📸 Rozpoznawanie tekstu ze skanów i zdjęć (OCR)
- ⚡ Szybkie odpowiedzi dzięki inteligentnej pamięci podręcznej

---

## 💼 Dla kogo?

- **Przedsiębiorcy** - szybka weryfikacja podstaw prawnych w codziennej działalności
- **Studenci prawa** - pomocnik w nauce i przygotowaniu do egzaminów
- **Osoby fizyczne** - odpowiedzi na pytania prawne w życiu codziennym
- **Zespoły HR** - wsparcie w kwestiach pracowniczych
- **Wszyscy zainteresowani prawem** - łatwy dostęp do wiedzy prawnej

---

## ✨ Kluczowe funkcje

### Szybkie odpowiedzi
Zamiast godzin researchu - odpowiedź w 5-10 sekund.

### Zrozumiały język
Skomplikowane przepisy tłumaczone na prosty, przystępny język.

### Wiarygodne źródła
Każda odpowiedź zawiera odniesienie do konkretnego aktu prawnego z **oficjalnych źródeł rządowych** (api.sejm.gov.pl).

### Dostęp do WSZYSTKICH ustaw polskich
System obsługuje **WSZYSTKIE ~15 000 aktów prawnych z ISAP**:
- ⚡ 16 najpopularniejszych ustaw - błyskawiczny dostęp (hardcoded)
- 🔍 Dynamiczne wyszukiwanie - dowolna ustawa z ISAP
- 💾 Inteligentny cache - przyspiesza kolejne zapytania
- 🎯 Fuzzy matching - działa nawet z literówkami

**Przykłady obsługiwanych zapytań:**
- Popularne: "art 30 prawa o ruchu drogowym" ⚡
- Rzadsze: "art 5 ustawy o energetyce odnawialnej" 🔍
- Z synonimami: "art 30 kodeksu drogowego" 🎯
- Z literówkami: "art 30 ruchu drogowm" (autokorekta)

### Dosłowne cytowanie przepisów
Gdy system wykryje pytanie o konkretny artykuł (np. "art 10 kp"), automatycznie pobiera i cytuje **dokładną treść przepisu** z oficjalnych źródeł.

### Dostępność 24/7
Aplikacja dostępna zawsze, z dowolnego urządzenia z przeglądarką.

### Panel Administracyjny
Dostęp do wszystkich pytań użytkowników i odpowiedzi AI dla celów analitycznych i poprawy jakości.

### Analityka
Zbieranie pytań i odpowiedzi do analizy i usprawniania systemu.

---

## 🚀 Jak to działa?

1. **Zadaj pytanie** - np. "Na jakiej podstawie pracodawca może odmówić urlopu?"
2. **Otrzymaj odpowiedź** - z konkretnym artykułem, wyjaśnieniem i linkiem do ustawy
3. **Czytaj i zrozum** - wszystko przedstawione w prosty, zrozumiały sposób

---

## 🛡️ Bezpieczeństwo i prywatność

- Aplikacja zabezpieczona hasłem
- Minimalizacja gromadzenia danych osobowych
- Brak śledzenia użytkowników
- Pytania i odpowiedzi zapisywane anonimowo dla celów analitycznych

---

## 🔄 Automatyczny Deployment

Projekt wykorzystuje **GitHub Actions** do automatycznego wdrażania zmian:

- **Frontend (Vercel)**: Automatyczny deployment po merge do `main`
- **Backend (Supabase)**: Automatyczny deployment Edge Functions i migracji po merge do `main`

### Konfiguracja auto-deploymentu:

Szczegółowe instrukcje: [`.github/SUPABASE_DEPLOYMENT.md`](.github/SUPABASE_DEPLOYMENT.md)

**Wymagane GitHub Secrets:**
- `SUPABASE_ACCESS_TOKEN` - token API z Supabase
- `SUPABASE_PROJECT_ID` - ID projektu Supabase
- `SUPABASE_DB_PASSWORD` - hasło do bazy danych (dla migracji)

Po skonfigurowaniu sekretów, każdy merge do `main` automatycznie:
1. ✅ Deployuje zmiany w Edge Functions
2. ✅ Uruchamia nowe migracje bazy danych
3. ✅ Aktualizuje frontend na Vercel

---

## 💰 Technologia

Aplikacja wykorzystuje najnowocześniejsze modele sztucznej inteligencji Anthropic Claude, specjalizujące się w analizie języka naturalnego i wyszukiwaniu informacji prawnych.

**Stack technologiczny:**
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase Edge Functions (serverless)
- **AI**: Anthropic Claude (Sonnet 4.5 / Haiku 4)
- **Hosting**: Vercel (frontend) + Raspberry Pi (ELI MCP Server)
- **Źródła prawne**:
  - API Sejmu RP (api.sejm.gov.pl) - oficjalne teksty ustaw
  - ELI MCP Server - ekstrakcja i czyszczenie treści artykułów z PDF
  - Automatyczna walidacja i weryfikacja treści

**Przepływ danych:**
1. Użytkownik zadaje pytanie
2. System wykrywa odniesienia do artykułów (regex + NLP)
3. ELI MCP Server pobiera aktualną treść z api.sejm.gov.pl
4. Claude otrzymuje dokładną treść artykułu w kontekście
5. Odpowiedź zawiera dosłowne cytaty z oficjalnych źródeł

Wszystko oparte na nowoczesnych, sprawdzonych technologiach używanych przez największe firmy tech na świecie.

---

## ⚠️ Ważne zastrzeżenia

**JakiePrawo.pl służy celom informacyjnym i edukacyjnym.**

Aplikacja **nie zastępuje profesjonalnej porady prawnej**. W indywidualnych sprawach, szczególnie tych o dużym znaczeniu prawnym lub finansowym, zawsze skonsultuj się z wykwalifikowanym prawnikiem lub radcą prawnym.

Twórcy aplikacji nie ponoszą odpowiedzialności za decyzje podjęte wyłącznie na podstawie informacji uzyskanych z aplikacji.

---

## 📧 Kontakt

Masz pytania lub sugestie? Skontaktuj się poprzez:
- GitHub Issues: https://github.com/karolpolikarp/najakiejpodstawie/issues
- Email: [dostępny na prośbę]

---

## 📄 Licencja

Projekt open source na licencji MIT.

---

**JakiePrawo.pl** - bo prawo powinno być dostępne dla każdego.

*Wersja 1.0 | 2025*
