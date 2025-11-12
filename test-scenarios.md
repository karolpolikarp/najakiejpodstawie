# MVP Test Scenarios

## 🎯 CEL TESTÓW:
Zweryfikować czy aplikacja stabilnie obsługuje:
1. Response caching (powtarzające się pytania)
2. MCP integration (konkretne artykuły + ogólne pytania)
3. OCR (skany/zdjęcia - manual testing)
4. Error handling

---

## KATEGORIA A: Popularne pytania (CACHE TEST)
**Cel:** Te pytania powinny być często zadawane → test cachowania

### A1. Punkty karne (Prawo o ruchu drogowym)
```
Pytanie: "Ile punktów karnych można mieć maksymalnie?"
Oczekiwana odpowiedź: 24 punkty (20 dla początkujących) + Art. 103 PRD
Status cache: 1st call = MISS, 2nd call = HIT
```

### A2. Przedawnienie (Kodeks cywilny)
```
Pytanie: "Kiedy przedawnia się roszczenie?"
Oczekiwana odpowiedź: 6 lat (podstawowy termin) + Art. 118 KC
Status cache: 1st call = MISS, 2nd call = HIT
```

### A3. Urlop wypoczynkowy (Kodeks pracy)
```
Pytanie: "Ile dni urlopu się należy?"
Oczekiwana odpowiedź: 20 lub 26 dni (w zależności od stażu) + Art. 154 KP
Status cache: 1st call = MISS, 2nd call = HIT
```

### A4. Minimalne wynagrodzenie (Kodeks pracy)
```
Pytanie: "Ile wynosi minimalne wynagrodzenie w Polsce?"
Oczekiwana odpowiedź: Informacja o minimalnej krajowej + Art. 87 KP
Status cache: 1st call = MISS, 2nd call = HIT
```

### A5. Kaucja przy najmie (Kodeks cywilny)
```
Pytanie: "Czy wynajmujący może żądać kaucji?"
Oczekiwana odpowiedź: TAK + Art. 659 KC (umowa najmu)
Status cache: 1st call = MISS, 2nd call = HIT
```

---

## KATEGORIA B: Konkretne artykuły (MCP TEST)
**Cel:** Sprawdzenie czy MCP poprawnie pobiera artykuły z różnych ustaw

### B1. Kodeks cywilny
```
Pytanie: "art 118 kc"
Oczekiwana odpowiedź: Pełna treść Art. 118 KC (przedawnienie 6 lat)
MCP call: get_article("kc", "118")
```

### B2. Kodeks pracy
```
Pytanie: "art 152 kp"
Oczekiwana odpowiedź: Pełna treść Art. 152 KP (definicja urlopu)
MCP call: get_article("kp", "152")
```

### B3. Kodeks karny
```
Pytanie: "art 25 kk"
Oczekiwana odpowiedź: Pełna treść Art. 25 KK (obrona konieczna)
MCP call: get_article("kk", "25")
```

### B4. Prawo o ruchu drogowym
```
Pytanie: "art 103 prawo o ruchu drogowym"
Oczekiwana odpowiedź: Pełna treść Art. 103 PRD (punkty karne)
MCP call: get_article("prd", "103")
```

### B5. Konstytucja
```
Pytanie: "art 30 konstytucji"
Oczekiwana odpowiedź: Pełna treść Art. 30 Konstytucji (godność człowieka)
MCP call: get_article("konstytucja", "30")
```

### B6. Kodeks postępowania cywilnego
```
Pytanie: "art 187 kpc"
Oczekiwana odpowiedź: Pełna treść Art. 187 KPC (pozew)
MCP call: get_article("kpc", "187")
```

### B7. Kodeks rodzinny i opiekuńczy
```
Pytanie: "art 23 kro"
Oczekiwana odpowiedź: Pełna treść Art. 23 KRO (małżeństwo)
MCP call: get_article("kro", "23")
```

### B8. Ustawa z długą nazwą (dynamiczne wyszukiwanie)
```
Pytanie: "art 10 ustawa o prawach konsumenta"
Oczekiwana odpowiedź: Pełna treść Art. 10 UPK
MCP call: get_article("upk", "10") lub dynamic search
```

---

## KATEGORIA C: Ogólne pytania (LEGAL_CONTEXT TEST)
**Cel:** Sprawdzenie czy wykrywa tematy i używa search_legal_info

### C1. Temat: Obrona konieczna
```
Pytanie: "Co to jest obrona konieczna?"
Oczekiwana odpowiedź: Wyjaśnienie + Art. 25 KK
Tool: search_legal_info("obrona konieczna")
```

### C2. Temat: Rozwiązanie umowy o pracę
```
Pytanie: "Jak rozwiązać umowę o pracę?"
Oczekiwana odpowiedź: Wyjaśnienie + Art. 30-36 KP
Tool: search_legal_info("rozwiązanie umowy o pracę")
```

### C3. Temat: Wynagrodzenie i czas pracy
```
Pytanie: "Ile godzin tygodniowo można pracować?"
Oczekiwana odpowiedź: 40 godzin (art. 129 KP) + nadgodziny
Tool: search_legal_info("czas pracy")
```

### C4. Temat: Windykacja długu
```
Pytanie: "Jakie mam prawa przy windykacji długu?"
Oczekiwana odpowiedź: Prawa wierzyciela + Art. 64, 455, 481 KC
Tool: search_legal_info("windykacja długu")
```

### C5. Temat: Zniesławienie
```
Pytanie: "Czy można pozwać za zniesławienie w internecie?"
Oczekiwana odpowiedź: TAK + Art. 212 KK (zniesławienie)
Tool: search_legal_info("zniesławienie")
```

---

## KATEGORIA D: Edge Cases (ERROR HANDLING TEST)
**Cel:** Sprawdzenie obsługi błędów i edge cases

### D1. Artykuł uchylony
```
Pytanie: "art 207 kpc"
Oczekiwana odpowiedź: Ostrzeżenie że artykuł uchylony + "(uchylony)"
Handling: isRepealed flag
```

### D2. Nieistniejący artykuł
```
Pytanie: "art 99999 kc"
Oczekiwana odpowiedź: Błąd "nie znaleziono artykułu" lub fallback
Handling: graceful error
```

### D3. Nieznana ustawa
```
Pytanie: "art 10 ustawa o kotach i psach"
Oczekiwana odpowiedź: Błąd "nie znaleziono ustawy" lub fallback
Handling: graceful error lub AI knowledge
```

### D4. Pytanie nie-prawne
```
Pytanie: "Jaka jest najlepsza pizza w Warszawie?"
Oczekiwana odpowiedź: "Odpowiadam tylko na pytania prawne."
Handling: off-topic detection
```

### D5. Bardzo długie pytanie (stress test)
```
Pytanie: [500+ słów pytania prawnego]
Oczekiwana odpowiedź: Powinna obsłużyć + odpowiedzieć
Handling: no truncation errors
```

---

## KATEGORIA E: Cache Validation (DUPLICATE QUESTIONS)
**Cel:** Weryfikacja czy cache działa poprawnie

### E1-E5: Powtórzenia z Kategorii A
```
Powtórz pytania A1-A5 (dokładnie te same teksty)
Oczekiwany status: X-Cache-Status: HIT w response headers
Oczekiwany czas: < 500ms (vs ~2-5s dla AI call)
Oczekiwana odpowiedź: Identyczna jak za pierwszym razem
```

---

## KATEGORIA F: OCR Tests (MANUAL - ze zdjęciami/skanami)
**Cel:** Weryfikacja OCR functionality

### F1. Zdjęcie umowy najmu (JPG)
```
Akcja: Załącz zdjęcie umowy najmu (z telefonem)
Pytanie: "Ile wynosi kaucja?"
Oczekiwana odpowiedź: AI znajduje wartość kaucji w załączonym dokumencie + cytuje
OCR: Tesseract.js powinien rozpoznać tekst
```

### F2. Skan PDF (scanned PDF)
```
Akcja: Załącz skan PDF (dokument zeskanowany)
Pytanie: "Kto jest stroną umowy?"
Oczekiwana odpowiedź: AI rozpoznaje strony z OCR
OCR: Auto-detect (< 50 chars) → performPDFOCR()
```

### F3. Screenshot artykułu (PNG)
```
Akcja: Załącz screenshot artykułu z ISAP (PNG)
Pytanie: "O czym jest ten artykuł?"
Oczekiwana odpowiedź: AI czyta tekst z OCR i wyjaśnia
OCR: Tesseract.js na PNG
```

---

## 📊 METRYKI DO ZBIERANIA:

### Performance Metrics:
- **Response time** (ms):
  - Cache HIT: < 500ms
  - Cache MISS + MCP: 2-5s
  - Cache MISS + no MCP: 3-8s
- **Token usage** (per request):
  - Input: 500-1500 tokens
  - Output: 300-1000 tokens
- **Cache hit rate** (%):
  - After 30 tests: ~16% (5/30)
  - After user traffic: 40-60% (popular questions)

### Success Metrics:
- **Accuracy** (correct answer):
  - Category A: 100% (5/5)
  - Category B: 100% (8/8)
  - Category C: 80%+ (4/5+)
  - Category D: 80%+ (graceful errors)
  - Category E: 100% cache hits
- **MCP calls**:
  - Success rate: 90%+
  - Average time: 2-4s per article
- **OCR accuracy**:
  - Good quality scan: 90%+
  - Phone photo: 70-90%
  - Low quality: 50-70%

### Error Handling:
- **Rate limiting**: 0 errors (cache prevents)
- **MCP timeouts**: < 5% failure rate
- **Graceful degradation**: 100% (no crashes)

---

## 🎯 SUCCESS CRITERIA:

**MUST HAVE (dla inwestorów):**
✅ Kategoria A: 5/5 poprawnych odpowiedzi + cache działa
✅ Kategoria B: 7/8 poprawnych (1 może failować)
✅ Kategoria E: 5/5 cache hits
✅ Zero crashes/500 errors

**NICE TO HAVE:**
✅ Kategoria C: 4/5 poprawnych
✅ Kategoria D: Graceful errors (nie crashuje)
✅ Kategoria F: 2/3 OCR działa

**MVP READY gdy:**
- 25/30 pytań działa poprawnie (83%+)
- Cache hit rate: 100% dla duplikatów
- Żadnych crashy/500 errors
- Response time < 10s dla 95% requests

---

## 💾 INSTRUKCJA ZAPISYWANIA WYNIKÓW:

```bash
# Format zapisu rezultatów:
TIMESTAMP | CATEGORY | QUESTION | STATUS | RESPONSE_TIME | CACHE_STATUS | ERRORS

# Przykład:
2025-01-12 14:30:45 | A1 | Ile punktów karnych... | SUCCESS | 3420ms | MISS | none
2025-01-12 14:31:10 | A1 | Ile punktów karnych... | SUCCESS | 280ms | HIT | none
2025-01-12 14:31:35 | B1 | art 118 kc | SUCCESS | 4100ms | MISS | none
2025-01-12 14:32:00 | D4 | Jaka pizza... | SUCCESS | 2800ms | MISS | off-topic-detected
```

---

## 🚀 NASTĘPNY KROK:

1. Uruchom testy A-E (można manual przez UI lub automated script)
2. Zbierz logi z Supabase (tabela user_questions)
3. Daj mi output + logi
4. Przeanalizuję wyniki
5. Dopracujemy co trzeba (zostało ~$10)
6. Prezentacja inwestorom! 🎉
