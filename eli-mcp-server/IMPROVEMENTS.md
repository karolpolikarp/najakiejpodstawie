# Ulepszenia ekstrakcji tekstu z PDF

## Zidentyfikowane problemy

Po analizie wyników testów zauważono następujące problemy w ekstrakcji tekstu z PDF:

1. **Złamane słowa z myślnikami** - słowa przedzielone myślnikiem na końcu linii nie były łączone
   - Przykład: `po-\nkrzywdzeniem` → powinno być `pokrzywdzeniem`

2. **Błędne spacje w polskich znakach diakrytycznych**
   - Przykład: `wyj ątkiem` → powinno być `wyjątkiem`
   - Przykład: `zatru dnienia` → powinno być `zatrudnienia`
   - Przykład: `dożywot niego` → powinno być `dożywotniego`

3. **Niepoprawne formatowanie** - znaki nowej linii w dziwnych miejscach

## Wprowadzone rozwiązania

### 1. Nowa funkcja `cleanPolishText()`

Funkcja ta przeprowadza kompleksowe czyszczenie tekstu wyekstraktowanego z PDF:

**Krok 1: Łączenie słów przedzielonych myślnikami**
```typescript
text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
```
Naprawia słowa rozdzielone myślnikiem na końcu linii, np: `po-\nkrzywdzeniem` → `pokrzywdzeniem`

**Krok 2: Słownik typowych błędów**
- Ręczna korekta znanych problemów (ponad 60 wpisów):
  - Słowa z nadmiarem spacji: `wyj ątkiem` → `wyjątkiem`, `zatru dnienia` → `zatrudnienia`
  - Słowa sklejone bez spacji: `niemożna` → `nie można`, `zabijaczłowieka` → `zabija człowieka`
  - Lista stale rozszerzana o nowe przypadki

**Krok 3: Konserwatywna naprawa znaków diakrytycznych**
- Usuwa spacje TYLKO gdy są jednoznacznie w środku słowa
- Pattern: litera + spacja + polski znak + litera (np. `w ą t` → `wąt`)
- **NIE** usuwa spacji między słowami kończącymi się polskimi znakami
- Przykład: `zmierzającą do` pozostaje niezmienione (spacja prawidłowa)

**Krok 4: Czyszczenie formatowania**
- Normalizacja spacji i nowych linii
- Usunięcie nowych linii przed znakami interpunkcyjnymi

### 2. Ulepszona ekstrakcja z PDF

Funkcja `extractTextFromPDF()` została rozszerzona o:

- **Lepsze śledzenie pozycji tekstu** (X i Y)
- **Inteligentne dodawanie spacji** - nie dodaje spacji gdy:
  - Tekst zaczyna się od interpunkcji
  - Jest duża przerwa horyzontalna (nowa sekcja)
  - Poprzedni znak to już spacja lub nowa linia
- **Automatyczne czyszczenie** - wywołanie `cleanPolishText()` na końcu

### 3. Podwójne czyszczenie w `extractArticleFromPDF()`

Wyekstraktowany artykuł przechodzi przez `cleanPolishText()` dodatkowo, aby zapewnić maksymalną jakość tekstu.

## Testowanie

Uruchom plik testowy:
```bash
cd eli-mcp-server
deno run test-text-cleaning.ts
```

Test weryfikuje czy funkcja poprawnie naprawia problematyczne teksty z trzech kodeksów:
- Kodeks pracy Art. 10
- Kodeks cywilny Art. 533
- Kodeks karny Art. 148

## Oczekiwane rezultaty

Po wprowadzeniu zmian, zapytania API powinny zwracać:

✅ **Przed**: `wyj ątkiem` → **Po**: `wyjątkiem`
✅ **Przed**: `po-\nkrzywdzeniem` → **Po**: `pokrzywdzeniem`
✅ **Przed**: `zatru dnienia` → **Po**: `zatrudnienia`
✅ **Przed**: `dożywot niego` → **Po**: `dożywotniego`
✅ **Przed**: `więce j` → **Po**: `więcej`

## Użycie w produkcji

Zmiany są w pełni wstecznie kompatybilne - wszystkie istniejące zapytania będą działać, ale z lepszą jakością tekstu.

Nie wymaga żadnych zmian w API ani konfiguracji serwera.
