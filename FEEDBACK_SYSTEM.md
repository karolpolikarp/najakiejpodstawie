# System Feedbacku - Dokumentacja

## Przegląd

System feedbacku umożliwia użytkownikom ocenę odpowiedzi asystenta prawnego za pomocą łapek w górę (thumbs up) i w dół (thumbs down). Zebrane dane mogą być wykorzystane do:

- Analizy jakości odpowiedzi AI
- Identyfikacji problemów z promptami
- Poprawy procesu generowania odpowiedzi
- Trenowania modeli AI (przyszłość)

## Architektura

### 1. Frontend

#### Komponent ChatMessage (`src/components/ChatMessage.tsx`)
- Wyświetla przyciski thumbs up/down pod każdą odpowiedzią asystenta
- Wizualna informacja zwrotna (podświetlenie wybranego przycisku)
- Możliwość zmiany feedbacku (toggle)
- Nie wyświetla się dla wiadomości błędów

#### Store (`src/store/chatStore.ts`)
- Rozszerzony interfejs `Message` o pole `feedback?: 'positive' | 'negative' | null`
- Nowa funkcja `setMessageFeedback()` do aktualizacji stanu
- Feedback jest zapisywany lokalnie w localStorage

#### Index.tsx (`src/pages/Index.tsx`)
- Funkcja `handleFeedback()` obsługuje kliknięcia przycisków
- Natychmiastowa aktualizacja UI (optimistic update)
- Asynchroniczne wysyłanie do backendu
- Błędy nie są pokazywane użytkownikowi (feedback zapisany lokalnie)

### 2. Backend

#### Tabela Supabase (`message_feedback`)
```sql
CREATE TABLE public.message_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id text NOT NULL UNIQUE,
    feedback_type text NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
    user_question text,              -- Pytanie użytkownika dla kontekstu
    assistant_response text,         -- Odpowiedź asystenta
    created_at timestamptz DEFAULT now(),
    session_id text,                 -- ID sesji użytkownika
    user_agent text                  -- Informacja o przeglądarce
);
```

#### Edge Function (`supabase/functions/submit-feedback`)
- Endpoint: `submit-feedback`
- Obsługuje INSERT i UPDATE (użytkownik może zmienić zdanie)
- Walidacja danych wejściowych
- CORS headers dla bezpieczeństwa

#### Migracja
- Plik: `supabase/migrations/20250106000000_create_message_feedback.sql`
- Zawiera definicję tabeli, indexy i RLS policies
- Row Level Security włączone (publiczny dostęp do insert/update/select)

### 3. Przepływ danych

```
Użytkownik klika thumbs up/down
         ↓
ChatMessage wywołuje onFeedback()
         ↓
Index.tsx → setMessageFeedback() (lokalnie)
         ↓
Index.tsx → supabase.functions.invoke('submit-feedback')
         ↓
Edge Function → INSERT/UPDATE w tabeli message_feedback
         ↓
Dane zapisane w Supabase
```

## Wykorzystanie danych

### Zapytania analityczne

#### 1. Statystyki ogólne
```sql
SELECT
  feedback_type,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM message_feedback
GROUP BY feedback_type;
```

#### 2. Odpowiedzi z negatywnym feedbackiem
```sql
SELECT
  user_question,
  assistant_response,
  created_at
FROM message_feedback
WHERE feedback_type = 'negative'
ORDER BY created_at DESC
LIMIT 20;
```

#### 3. Trend w czasie
```sql
SELECT
  DATE(created_at) as date,
  feedback_type,
  COUNT(*) as count
FROM message_feedback
GROUP BY DATE(created_at), feedback_type
ORDER BY date DESC;
```

#### 4. Najczęstsze problemy (negatywne)
```sql
SELECT
  user_question,
  COUNT(*) as negative_count
FROM message_feedback
WHERE feedback_type = 'negative'
GROUP BY user_question
ORDER BY negative_count DESC
LIMIT 10;
```

### Dashboard w Supabase

1. Otwórz Supabase Dashboard
2. Wybierz projekt
3. Przejdź do "Table Editor" → `message_feedback`
4. Możesz:
   - Przeglądać feedback w czasie rzeczywistym
   - Eksportować dane do CSV
   - Uruchamiać własne zapytania SQL

## Poprawa promptów AI

### Analiza negatywnego feedbacku

1. **Identyfikacja wzorców**
   - Czy użytkownicy mają problem z konkretnym typem pytań?
   - Czy odpowiedzi są zbyt długie/krótkie?
   - Czy ton odpowiedzi jest odpowiedni?

2. **Przykłady problemów**
   - Odpowiedzi zbyt ogólne → Dodaj więcej szczegółów do promptu
   - Odpowiedzi nie na temat → Ulepsz parsing intencji użytkownika
   - Błędne podstawy prawne → Aktualizuj bazę wiedzy

3. **Iteracyjne ulepszanie**
   ```typescript
   // Przykład: Jeśli użytkownicy często dają thumbs down na krótkie odpowiedzi
   const systemPrompt = `
   Odpowiadaj szczegółowo, zawsze podając:
   1. Konkretny artykuł ustawy
   2. Wyjaśnienie co to oznacza w prostych słowach
   3. Powiązane przepisy jeśli istnieją
   4. Praktyczne przykłady
   `;
   ```

### A/B Testing

Możesz użyć feedbacku do testowania różnych wersji promptów:

1. Wprowadź zmianę w prompt (np. w `supabase/functions/legal-assistant/index.ts`)
2. Zbieraj feedback przez tydzień
3. Porównaj statystyki przed/po
4. Zachowaj lepszą wersję

## Prywatność i GDPR

### Dane zbierane
- ✅ Message ID (UUID generowane lokalnie)
- ✅ Typ feedbacku (positive/negative)
- ✅ Treść pytania i odpowiedzi (anonimowe)
- ✅ Session ID (opcjonalne)
- ✅ User Agent (metadane techniczne)

### Dane NIE zbierane
- ❌ Dane osobowe użytkowników
- ❌ Adresy IP (Supabase może je logować, ale nie przechowujemy)
- ❌ Cookie tracking

### Zgodność
- System jest zgodny z GDPR (dane anonimowe)
- Użytkownicy są informowani o AI w bannerze i modalach
- Brak mechanizmu identyfikacji użytkowników

## Integracja z innymi systemami

### Export danych
```bash
# Eksport do CSV przez Supabase CLI
supabase db dump -t message_feedback > feedback.csv

# Lub przez SQL
COPY (SELECT * FROM message_feedback) TO '/tmp/feedback.csv' CSV HEADER;
```

### Webhook na nowy feedback (opcjonalnie)
```sql
-- Utworzenie funkcji webhook
CREATE OR REPLACE FUNCTION notify_new_feedback()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('new_feedback', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER on_new_feedback
  AFTER INSERT ON message_feedback
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_feedback();
```

## Maintenance

### Czyszczenie starych danych
```sql
-- Usuń feedback starszy niż 1 rok
DELETE FROM message_feedback
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Monitoring
```sql
-- Sprawdź rozmiar tabeli
SELECT
  pg_size_pretty(pg_total_relation_size('message_feedback')) as total_size;

-- Sprawdź liczbę rekordów
SELECT COUNT(*) FROM message_feedback;
```

## FAQ

### Czy feedback jest widoczny dla innych użytkowników?
Nie, feedback jest zapisywany tylko w bazie danych dla analizy.

### Czy mogę zmienić zdanie po kliknięciu thumbs up?
Tak, możesz kliknąć thumbs down i feedback zostanie zaktualizowany.

### Jak usunąć feedback?
Kliknij ponownie ten sam przycisk (toggle off). W przyszłości można dodać button "Usuń feedback".

### Co się stanie jeśli backend nie jest dostępny?
Feedback zostanie zapisany lokalnie w przeglądarce, ale nie zostanie wysłany do backendu. UI nie pokazuje błędu.

## Roadmap

### Planowane funkcje
- [ ] Dashboard analityczny dla administratorów
- [ ] Eksport danych do Google Sheets/Excel
- [ ] Machine learning do przewidywania jakości odpowiedzi
- [ ] Dodatkowe pole do komentarza tekstowego
- [ ] Powiadomienia dla administratorów przy niskim ratingu

## Support

W razie problemów:
1. Sprawdź logi Supabase Edge Functions
2. Sprawdź console.error w przeglądarce (DevTools)
3. Zweryfikuj czy migracja została uruchomiona
4. Sprawdź RLS policies w Supabase Dashboard
