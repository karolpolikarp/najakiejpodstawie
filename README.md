# JakiePrawo.pl

## 🚀 3-in-1 Legal Assistant Platform

**Znajdź podstawę prawną w 3 różnych trybach pracy - od analizy dokumentów po wyszukiwanie w 15,000+ polskich ustaw.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://jakieprawo.pl)
[![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20Claude%20AI%20%7C%20Supabase-blue)]()
[![Status](https://img.shields.io/badge/status-MVP%20Ready-success)]()

---

## 🎯 Value Proposition

**Problem:** Znalezienie konkretnego artykułu w polskim prawie zajmuje godziny. Ludzie płacą prawnikom za proste odpowiedzi lub ryzykują błędną interpretacją przepisów.

**Rozwiązanie:** JakiePrawo.pl to pierwszy w Polsce **3-w-1 asystent prawny** łączący:
1. **Zaawansowane OCR** - analiza skanów i zdjęć dokumentów
2. **Real-time Legal API** - dostęp do 15,000+ aktualnych ustaw
3. **AI-powered Search** - naturalne pytania w języku polskim

**Rezultat:** Odpowiedź w 5-10 sekund zamiast godzin researchu.

---

## 🎨 3 Główne Funkcjonalności (MVP)

### 📄 1. Analiza Dokumentów z OCR
**Status:** ✅ CORE FEATURE | **Unique Selling Point:** Pierwszy w Polsce legal assistant z OCR

**Możliwości:**
- Upload PDF, DOC, DOCX, JPG, PNG
- Zaawansowane OCR (Tesseract.js) dla języka polskiego i angielskiego
- Automatyczna detekcja skanów (jeśli PDF < 50 znaków → trigger OCR)
- Pytania kontekstowe o załączony dokument

**Use case:** Przedsiębiorca dostaje skan umowy (zdjęcie telefonem) → upload → "Czy ta klauzula jest zgodna z prawem konsumenckim?" → AI analizuje treść i wskazuje art. 385¹ KC

**Tech:**
- Frontend: Tesseract.js (pol+eng)
- Backend: Supabase Edge Functions
- Storage: Temporary (15min inactivity auto-clear)

---

### 🔍 2. Wyszukiwanie Artykułów (MCP + API Sejmu)
**Status:** ✅ CORE FEATURE | **Competitive Advantage:** Real-time oficjalne źródła

**Możliwości:**
- Dostęp do **15,000+ polskich ustaw z ISAP**
- Integracja z **oficjalnym API Sejmu RP** (api.sejm.gov.pl)
- Model Context Protocol (MCP) dla dokładnej ekstrakcji z PDF
- Dosłowne cytowanie aktualnej treści prawnej
- Inteligentny cache (7 dni) dla popularnych pytań
- Fuzzy matching - działa z literówkami i synonimami

**Przykłady:**
- `"art 30 prawa o ruchu drogowym"` → instant treść ⚡
- `"art 5 ustawy o energetyce odnawialnej"` → dynamiczne wyszukanie 🔍
- `"art 30 kodeksu drogowego"` → synonim mapping 🎯

**Tech:**
- ELI MCP Server (Raspberry Pi)
- PostgreSQL + SHA-256 hashing
- Response caching (7-day TTL)

---

### 💬 3. Pytania w Języku Naturalnym (AI-powered)
**Status:** ⚠️ EXPERIMENTAL BETA | **Innovation:** Claude AI dla polskiego prawa

**Możliwości:**
- Naturalne pytania w języku polskim
- AI przeszukuje polskie prawo (Kodeks Pracy, Kodeks Cywilny, itp.)
- Wskazanie konkretnego artykułu jako podstawy prawnej
- Wyjaśnienie w zrozumiałym języku

**Ograniczenia:**
- ⚠️ Wymaga weryfikacji odpowiedzi
- 🔬 W fazie testów na top 500 pytaniach
- 📊 Success rate: ~70-85% (w fazie poprawy)

**Use case:** "Czy pracodawca może odmówić urlopu na żądanie?" → AI wskazuje art. 167² KP i wyjaśnia zasady

**Tech:**
- Anthropic Claude (Sonnet 4.5 Premium / Haiku 4 Standard)
- Tool calling dla get_article() i search_legal_info()
- Rate limiting protection

---

## 💼 Target Market

**Primary:**
- 🏢 **SMB / Przedsiębiorcy** - 2M+ aktywnych firm w Polsce
- 📚 **Studenci prawa** - ~100k studentów prawa rocznie
- 👥 **Osoby fizyczne** - 38M populacji (potencjalnie 10M+ online-savvy)

**Secondary:**
- 🏛️ **Zespoły HR/Legal** - in-house legal support
- 🎓 **Edukacja prawna** - szkolenia, kursy

**Market Size (Poland):**
- Legal tech market: €50M+ (growing 15% YoY)
- Online legal services: €20M+ TAM
- Opportunity: First mover w AI-powered + OCR segment

---

## 🎯 Competitive Advantage

| Feature | JakiePrawo.pl | LexLege/iLaw | ChatGPT | Prawnik |
|---------|---------------|--------------|---------|---------|
| **OCR dla dokumentów** | ✅ | ❌ | ❌ | ✅ |
| **API Sejmu (oficjalne źródła)** | ✅ | ⚠️ | ❌ | ✅ |
| **15,000+ ustaw (ISAP)** | ✅ | ⚠️ | ❌ | ✅ |
| **AI natural language** | ✅ | ❌ | ⚠️ | ✅ |
| **Cena (per query)** | €0.01 | €5-10 | €0.20 | €50-200 |
| **Response time** | 5-10s | 24-48h | 3-5s | 1-7 dni |

**Key Differentiators:**
1. **3-in-1** - pierwsza platforma łącząca OCR + Legal API + AI
2. **Real-time oficjalne źródła** - nie halucynacje, tylko api.sejm.gov.pl
3. **Polish-first** - OCR + AI trenowane dla języka polskiego
4. **Open source** - transparentność i trust

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
