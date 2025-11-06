# Legal Assistant Edge Function

Funkcja Supabase Edge obsługująca asystenta prawnego opartego na Claude AI.

## Jak działa

Funkcja ta:
1. Odbiera zapytania od użytkowników dotyczące polskiego prawa
2. Waliduje, czy pytanie dotyczy kwestii prawnych
3. Wywołuje Claude API (model Haiku) z zoptymalizowanym promptem systemowym
4. Zwraca ustrukturyzowane odpowiedzi z podstawami prawnymi

## Struktura odpowiedzi

Każda odpowiedź zawiera obowiązkowe sekcje:

- **PODSTAWA PRAWNA** - główne artykuły prawne
- **CO TO OZNACZA** - wyjaśnienie w prostym języku
- **POWIĄZANE PRZEPISY** - dodatkowe artykuły rozszerzające kontekst
- **ŹRÓDŁO** - linki do pełnych tekstów ustaw

Opcjonalne sekcje:
- **KLUCZOWE INFORMACJE / SZCZEGÓŁY / WARUNKI**
- **DODATKOWE INFORMACJE**
- **UWAGA** - disclaimer i dodatkowe uwagi

## Aktualizacja treści prawnych

### Gdy zmieniają się przepisy (nowelizacje, nowe ustawy):

1. **Aktualizuj `legal-context.ts`**
   - Otwórz plik `legal-context.ts`
   - Znajdź odpowiedni temat lub dodaj nowy
   - Zaktualizuj numery artykułów i opisy
   - Zaktualizuj datę w sekcji "Last updated"

   ```typescript
   urlop: {
     name: "Urlop wypoczynkowy",
     mainArticles: [
       "Art. 152 - definicja urlopu wypoczynkowego",
       "Art. 153 - wymiar urlopu (ZAKTUALIZUJ JEŚLI SIĘ ZMIENIŁ)",
       // ...
     ],
     // ...
   }
   ```

2. **Zaktualizuj przykłady w promptcie systemowym** (opcjonalnie)
   - Otwórz `index.ts`
   - Znajdź sekcję `PRZYKŁAD DOBREJ ODPOWIEDZI:`
   - Zaktualizuj przykłady, jeśli dotyczą zmienionych przepisów

3. **Przetestuj zmiany**
   - Wdróż funkcję: `supabase functions deploy legal-assistant`
   - Zadaj testowe pytanie przez interfejs użytkownika
   - Sprawdź, czy AI podaje zaktualizowane informacje

### Przykład aktualizacji

**Scenariusz:** Zmienił się wymiar urlopu wypoczynkowego

1. Edytuj `legal-context.ts`:
```typescript
urlop: {
  mainArticles: [
    "Art. 153 - wymiar urlopu wypoczynkowego (NOWY WYMIAR: 22 lub 28 dni)", // ZAKTUALIZOWANO
  ],
}
```

2. Zaktualizuj datę:
```typescript
/**
 * Last updated: 2025-11-20  // NOWA DATA
 */
```

3. Wdróż:
```bash
supabase functions deploy legal-assistant
```

## Zmienne środowiskowe

Wymagane:
- `ANTHROPIC_API_KEY` - klucz API dla Claude

## Model AI

- **Model:** claude-3-5-haiku-20241022
- **Max tokens:** 2048
- **Temperature:** 0.7

## Obsługa błędów

- 429 - Limit zapytań (rate limit)
- 401 - Nieprawidłowy klucz API
- 500 - Błąd wewnętrzny

## Pliki

- `index.ts` - główna logika funkcji Edge
- `legal-context.ts` - baza wiedzy prawnej (do aktualizacji)
- `README.md` - ten plik

## Rozwój

Aby dodać nową kategorię prawną:

1. Dodaj wpis do `LEGAL_CONTEXT` w `legal-context.ts`
2. Opcjonalnie dodaj przykład do promptu systemowego
3. Przetestuj z reprezentatywnymi pytaniami

## Linki

- [Dokumentacja Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Dokumentacja Claude API](https://docs.anthropic.com/)
- [ISAP - Internetowy System Aktów Prawnych](https://isap.sejm.gov.pl/)
