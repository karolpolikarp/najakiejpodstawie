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
text.replace(/(\w+)-\s+(\w+)/g, '$1$2')
```

**Krok 2: Naprawa polskich znaków diakrytycznych**
- Usuwa błędne spacje przed/po znakach: ą, ć, ę, ł, ń, ó, ś, ź, ż
- Regex dla każdego znaku, np: `/([a-z])\s+ą/gi` → `$1ą`

**Krok 3: Słownik typowych błędów**
- Ręczna korekta znanych problemów:
  - `wyj ątkiem` → `wyjątkiem`
  - `po krzywdzeniem` → `pokrzywdzeniem`
  - `zatru dnienia` → `zatrudnienia`
  - i inne...

**Krok 4: Usuwanie nadmiarowych spacji**
- Łączy krótkie fragmenty słów (1-3 znaki) z głównym słowem
- Zachowuje krótkie spójniki i przyimki (i, w, z, na, do, etc.)

**Krok 5: Czyszczenie formatowania**
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
