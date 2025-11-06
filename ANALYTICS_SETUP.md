# Konfiguracja Analytics

Ten dokument opisuje, jak skonfigurować Google Analytics i Plausible Analytics w aplikacji.

## Google Analytics 4 (GA4)

### Krok 1: Utwórz konto Google Analytics

1. Przejdź do [Google Analytics](https://analytics.google.com/)
2. Zaloguj się kontem Google
3. Kliknij "Rozpocznij pomiar" lub "Admin"
4. Utwórz nowe konto i właściwość

### Krok 2: Uzyskaj identyfikator pomiaru (Measurement ID)

1. W panelu administracyjnym wybierz swoją właściwość
2. Kliknij "Strumienie danych" (Data Streams)
3. Dodaj nowy strumień dla strony internetowej
4. Wpisz URL swojej witryny
5. Skopiuj **Identyfikator pomiaru** (format: `G-XXXXXXXXXX`)

### Krok 3: Skonfiguruj w aplikacji

Otwórz plik `index.html` i zamień `G-XXXXXXXXXX` na swój prawdziwy identyfikator pomiaru:

```html
<!-- Przed -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Po -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123DEF4');
</script>
```

## Plausible Analytics

Plausible to prostsza, bardziej przyjazna prywatności alternatywa dla Google Analytics.

### Krok 1: Utwórz konto Plausible

1. Przejdź do [Plausible.io](https://plausible.io/)
2. Zarejestruj się (dostępna jest 30-dniowa próba)
3. Dodaj swoją domenę (np. `najakiejpodstawie.pl`)

### Krok 2: Skonfiguruj w aplikacji

Kod Plausible jest już dodany w `index.html`. Upewnij się, że atrybut `data-domain` zawiera twoją rzeczywistą domenę:

```html
<script defer data-domain="najakiejpodstawie.pl" src="https://plausible.io/js/script.js"></script>
```

Jeśli twoja domena jest inna, zmień wartość `data-domain`:

```html
<script defer data-domain="twoja-domena.pl" src="https://plausible.io/js/script.js"></script>
```

### Opcjonalnie: Self-hosting Plausible

Jeśli wolisz hostować Plausible samodzielnie:

1. Użyj [oficjalnego repozytorium](https://github.com/plausible/analytics)
2. Zamień URL skryptu na URL twojej instancji:

```html
<script defer data-domain="twoja-domena.pl" src="https://twoj-plausible.pl/js/script.js"></script>
```

## Dashboard Statystyk (Backend Analytics)

Aplikacja zawiera również własny system statystyk oparty na Supabase, który śledzi:
- Najczęściej zadawane pytania
- Dzienne statystyki użycia
- Średni czas odpowiedzi
- Pytania z załączonym kontekstem

### Wymagana konfiguracja

1. **Uruchom migrację bazy danych**:
   ```bash
   supabase db push
   ```

2. **Ustaw zmienne środowiskowe w Supabase**:
   - Przejdź do Supabase Dashboard → Settings → Edge Functions
   - Dodaj zmienne środowiskowe:
     - `SUPABASE_URL` - automatycznie dostępne
     - `SUPABASE_SERVICE_ROLE_KEY` - automatycznie dostępne

3. **Dostęp do dashboardu**:
   - Dashboard jest dostępny pod adresem `/dashboard`
   - Link znajduje się w stopce aplikacji

### Struktura bazy danych

Migracja tworzy następujące tabele:
- `questions` - wszystkie zadane pytania
- `responses` - odpowiedzi z metadanymi (czas, tokeny)
- `user_sessions` - opcjonalne śledzenie sesji
- Widoki: `most_asked_questions`, `daily_statistics`

## Prywatność

### Google Analytics
- Śledzi wizyty, odsłony stron, zdarzenia
- Używa cookies
- **Pamiętaj**: Dodaj informacje o GA w polityce prywatności

### Plausible Analytics
- Nie używa cookies
- Bardziej przyjazny dla prywatności
- Dane są anonimowe
- Zgodny z RODO bez zgody użytkownika (w większości przypadków)

### Dashboard Statystyk (Backend)
- Śledzi tylko pytania i odpowiedzi
- NIE śledzi danych osobowych użytkowników
- Brak cookies i śledzenia między sesjami
- Pytania są hasowane dla grupowania

## Testowanie

### Sprawdź Google Analytics
1. Otwórz aplikację w przeglądarce
2. Otwórz Narzędzia deweloperskie (F12)
3. Przejdź do zakładki Network
4. Przeładuj stronę
5. Szukaj żądań do `google-analytics.com` lub `googletagmanager.com`

### Sprawdź Plausible
1. Otwórz aplikację w przeglądarce
2. Otwórz Narzędzia deweloperskie (F12)
3. Przejdź do zakładki Network
4. Przeładuj stronę
5. Szukaj żądania do `plausible.io/api/event`

### Sprawdź Dashboard
1. Zadaj kilka pytań w aplikacji
2. Przejdź do `/dashboard`
3. Sprawdź, czy statystyki się pojawiają
4. Jeśli nie, sprawdź konsolę przeglądarki i logi Supabase

## Wyłączanie Analytics

Aby wyłączyć któryś z systemów analytics, po prostu usuń odpowiedni kod z `index.html`:

```html
<!-- Usuń Google Analytics -->
<!-- Usuń poniższy kod -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>...</script>

<!-- Usuń Plausible Analytics -->
<!-- Usuń poniższy kod -->
<script defer data-domain="..." src="https://plausible.io/js/script.js"></script>
```

Dashboard statystyk (backend) można wyłączyć, usuwając route `/dashboard` z `App.tsx`.

## Wsparcie

W razie problemów:
1. Sprawdź konsole przeglądarki (F12)
2. Sprawdź logi Supabase Edge Function
3. Upewnij się, że migracje zostały zastosowane
4. Sprawdź, czy zmienne środowiskowe są ustawione

## Dalsze zasoby

- [Dokumentacja Google Analytics 4](https://support.google.com/analytics/answer/9304153)
- [Dokumentacja Plausible](https://plausible.io/docs)
- [Dokumentacja Supabase](https://supabase.com/docs)
