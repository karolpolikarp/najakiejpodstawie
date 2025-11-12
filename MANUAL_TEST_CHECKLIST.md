# ✅ Manual Test Checklist - MVP JakiePrawo.pl

**Tester:** ___________________
**Date:** ___________________
**Environment:** ☐ Production ☐ Staging
**URL:** https://jakieprawo.pl/czat

---

## 🎯 QUICK SMOKE TESTS (10 min)

### Test 1: Basic Functionality
- [ ] Strona się ładuje
- [ ] Formularz czatu działa
- [ ] Można wysłać pytanie
- [ ] Dostajemy odpowiedź
- [ ] Odpowiedź się streamuje (tekst pojawia się stopniowo)

**Pytanie testowe:** "Ile punktów karnych można mieć?"
**Oczekiwana odpowiedź:** 24 punkty + Art. 103 PRD
**Status:** ☐ PASS ☐ FAIL
**Uwagi:** _________________________________

---

### Test 2: Cache (powtórzone pytanie)
- [ ] Zadaj TO SAMO pytanie ponownie
- [ ] Odpowiedź pojawia się szybciej (< 1s)
- [ ] Odpowiedź identyczna jak za pierwszym razem

**Pytanie:** "Ile punktów karnych można mieć?" (TO SAMO!)
**Oczekiwany czas:** < 500ms (cache HIT)
**Status:** ☐ PASS ☐ FAIL
**Czas odpowiedzi:** _______ ms
**Uwagi:** _________________________________

---

### Test 3: Konkretny artykuł (MCP)
- [ ] Zadaj pytanie o konkretny artykuł
- [ ] Dostajemy pełną treść artykułu
- [ ] Artykuł jest z oficjalnego źródła (link do ISAP)

**Pytanie:** "art 118 kc"
**Oczekiwana odpowiedź:** Pełna treść Art. 118 KC (przedawnienie 6 lat)
**Status:** ☐ PASS ☐ FAIL
**Czy pokazuje pełny tekst artykułu:** ☐ TAK ☐ NIE
**Uwagi:** _________________________________

---

### Test 4: OCR - Zdjęcie dokumentu
- [ ] Kliknij "Załącz plik"
- [ ] Wybierz JPG/PNG (zdjęcie umowy lub paragonu)
- [ ] Pokaże się "Rozpoznawanie tekstu z obrazu..."
- [ ] Toast: "Rozpoznano tekst z obrazu" ✓
- [ ] Zadaj pytanie o zawartość dokumentu
- [ ] AI cytuje fragment z załączonego obrazu

**Plik:** _________________ (JPG/PNG)
**Pytanie:** "Co jest w tym dokumencie?"
**Status OCR:** ☐ PASS ☐ FAIL
**Czy AI czyta tekst z obrazu:** ☐ TAK ☐ NIE
**Uwagi:** _________________________________

---

### Test 5: Error Handling
- [ ] Zadaj pytanie nie-prawne
- [ ] Dostajemy komunikat o off-topic
- [ ] Aplikacja nie crashuje

**Pytanie:** "Jaka jest najlepsza pizza?"
**Oczekiwana odpowiedź:** "Odpowiadam tylko na pytania prawne"
**Status:** ☐ PASS ☐ FAIL
**Uwagi:** _________________________________

---

## 📊 SZCZEGÓŁOWE TESTY (30 min)

### KATEGORIA A: Popularne Pytania (5 testów)

#### A1. Punkty karne
**Pytanie:** "Ile punktów karnych można mieć maksymalnie?"
**Oczekiwane:** 24 punkty (20 dla początkujących) + Art. 103
☐ PASS ☐ FAIL ☐ PARTIAL
**Czas:** _____ ms | **Cache:** ☐ HIT ☐ MISS
**Uwagi:** _________________________________

#### A2. Przedawnienie
**Pytanie:** "Kiedy przedawnia się roszczenie?"
**Oczekiwane:** 6 lat + Art. 118 KC
☐ PASS ☐ FAIL ☐ PARTIAL
**Czas:** _____ ms | **Cache:** ☐ HIT ☐ MISS
**Uwagi:** _________________________________

#### A3. Urlop
**Pytanie:** "Ile dni urlopu się należy?"
**Oczekiwane:** 20 lub 26 dni + Art. 154 KP
☐ PASS ☐ FAIL ☐ PARTIAL
**Czas:** _____ ms | **Cache:** ☐ HIT ☐ MISS
**Uwagi:** _________________________________

#### A4. Minimalne wynagrodzenie
**Pytanie:** "Ile wynosi minimalne wynagrodzenie?"
**Oczekiwane:** Aktualna kwota + Art. 87 KP
☐ PASS ☐ FAIL ☐ PARTIAL
**Czas:** _____ ms | **Cache:** ☐ HIT ☐ MISS
**Uwagi:** _________________________________

#### A5. Kaucja
**Pytanie:** "Czy wynajmujący może żądać kaucji?"
**Oczekiwane:** TAK + Art. 659 KC
☐ PASS ☐ FAIL ☐ PARTIAL
**Czas:** _____ ms | **Cache:** ☐ HIT ☐ MISS
**Uwagi:** _________________________________

---

### KATEGORIA B: Konkretne Artykuły (8 testów)

#### B1. KC - Kodeks cywilny
**Pytanie:** "art 118 kc"
**Oczekiwane:** Pełna treść Art. 118 KC
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B2. KP - Kodeks pracy
**Pytanie:** "art 152 kp"
**Oczekiwane:** Pełna treść Art. 152 KP (urlop)
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B3. KK - Kodeks karny
**Pytanie:** "art 25 kk"
**Oczekiwane:** Pełna treść Art. 25 KK (obrona konieczna)
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B4. PRD - Prawo o ruchu drogowym
**Pytanie:** "art 103 prawo o ruchu drogowym"
**Oczekiwane:** Pełna treść Art. 103 PRD
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B5. Konstytucja
**Pytanie:** "art 30 konstytucji"
**Oczekiwane:** Pełna treść Art. 30 Konstytucji
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B6. KPC - Kodeks postępowania cywilnego
**Pytanie:** "art 187 kpc"
**Oczekiwane:** Pełna treść Art. 187 KPC
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B7. KRO - Kodeks rodzinny i opiekuńczy
**Pytanie:** "art 23 kro"
**Oczekiwane:** Pełna treść Art. 23 KRO
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

#### B8. Długa nazwa ustawy (dynamic search)
**Pytanie:** "art 10 ustawa o prawach konsumenta"
**Oczekiwane:** Pełna treść Art. 10 UPK
☐ PASS ☐ FAIL | **MCP:** ☐ SUCCESS ☐ TIMEOUT ☐ ERROR
**Uwagi:** _________________________________

---

### KATEGORIA C: Pytania Ogólne (5 testów)

#### C1. Obrona konieczna
**Pytanie:** "Co to jest obrona konieczna?"
**Oczekiwane:** Wyjaśnienie + Art. 25 KK
☐ PASS ☐ FAIL ☐ PARTIAL
**Uwagi:** _________________________________

#### C2. Rozwiązanie umowy
**Pytanie:** "Jak rozwiązać umowę o pracę?"
**Oczekiwane:** Wyjaśnienie + Art. 30-36 KP
☐ PASS ☐ FAIL ☐ PARTIAL
**Uwagi:** _________________________________

#### C3. Czas pracy
**Pytanie:** "Ile godzin tygodniowo można pracować?"
**Oczekiwane:** 40 godzin + Art. 129 KP
☐ PASS ☐ FAIL ☐ PARTIAL
**Uwagi:** _________________________________

#### C4. Windykacja
**Pytanie:** "Jakie mam prawa przy windykacji długu?"
**Oczekiwane:** Prawa wierzyciela + artykuły KC
☐ PASS ☐ FAIL ☐ PARTIAL
**Uwagi:** _________________________________

#### C5. Zniesławienie
**Pytanie:** "Czy można pozwać za zniesławienie w internecie?"
**Oczekiwane:** TAK + Art. 212 KK
☐ PASS ☐ FAIL ☐ PARTIAL
**Uwagi:** _________________________________

---

### KATEGORIA D: Edge Cases (4 testy)

#### D1. Artykuł uchylony
**Pytanie:** "art 207 kpc"
**Oczekiwane:** Ostrzeżenie "(uchylony)" + info
☐ PASS ☐ FAIL | **Handling:** ☐ Graceful ☐ Crash
**Uwagi:** _________________________________

#### D2. Nieistniejący artykuł
**Pytanie:** "art 99999 kc"
**Oczekiwane:** Błąd "nie znaleziono" lub fallback
☐ PASS ☐ FAIL | **Handling:** ☐ Graceful ☐ Crash
**Uwagi:** _________________________________

#### D3. Nieznana ustawa
**Pytanie:** "art 10 ustawa o kotach i psach"
**Oczekiwane:** Błąd lub fallback
☐ PASS ☐ FAIL | **Handling:** ☐ Graceful ☐ Crash
**Uwagi:** _________________________________

#### D4. Off-topic
**Pytanie:** "Jaka jest najlepsza pizza w Warszawie?"
**Oczekiwane:** "Odpowiadam tylko na pytania prawne"
☐ PASS ☐ FAIL | **Handling:** ☐ Graceful ☐ Crash
**Uwagi:** _________________________________

---

### KATEGORIA E: Cache Validation (5 testów)

**INSTRUKCJA:** Powtórz DOKŁADNIE te same pytania z Kategorii A

#### E1. Cache test - punkty karne
**Pytanie:** "Ile punktów karnych można mieć maksymalnie?"
☐ PASS ☐ FAIL | **Cache:** ☐ HIT ☐ MISS | **Czas:** _____ ms
**Czy < 500ms:** ☐ TAK ☐ NIE

#### E2. Cache test - przedawnienie
**Pytanie:** "Kiedy przedawnia się roszczenie?"
☐ PASS ☐ FAIL | **Cache:** ☐ HIT ☐ MISS | **Czas:** _____ ms
**Czy < 500ms:** ☐ TAK ☐ NIE

#### E3. Cache test - urlop
**Pytanie:** "Ile dni urlopu się należy?"
☐ PASS ☐ FAIL | **Cache:** ☐ HIT ☐ MISS | **Czas:** _____ ms
**Czy < 500ms:** ☐ TAK ☐ NIE

#### E4. Cache test - minimalna
**Pytanie:** "Ile wynosi minimalne wynagrodzenie?"
☐ PASS ☐ FAIL | **Cache:** ☐ HIT ☐ MISS | **Czas:** _____ ms
**Czy < 500ms:** ☐ TAK ☐ NIE

#### E5. Cache test - kaucja
**Pytanie:** "Czy wynajmujący może żądać kaucji?"
☐ PASS ☐ FAIL | **Cache:** ☐ HIT ☐ MISS | **Czas:** _____ ms
**Czy < 500ms:** ☐ TAK ☐ NIE

---

### KATEGORIA F: OCR Tests (3 testy - manual)

#### F1. Zdjęcie umowy najmu (JPG)
- [ ] Zrób zdjęcie umowy najmu (telefon)
- [ ] Załącz w aplikacji
- [ ] Czekaj na "Rozpoznano tekst z obrazu"
- [ ] Zapytaj: "Ile wynosi kaucja?"
- [ ] Sprawdź czy AI znajduje wartość z dokumentu

**Status OCR:** ☐ PASS ☐ FAIL
**Czy AI cytuje z załącznika:** ☐ TAK ☐ NIE
**Accuracy:** ☐ 90%+ ☐ 70-90% ☐ < 70%
**Uwagi:** _________________________________

#### F2. Skan PDF (scanned PDF)
- [ ] Załącz skan PDF (nie text PDF!)
- [ ] Toast: "Wykryto skan - rozpoznawanie..."
- [ ] Toast: "Rozpoznano tekst ze skanu"
- [ ] Zapytaj o zawartość
- [ ] AI cytuje z OCR

**Status OCR:** ☐ PASS ☐ FAIL
**Auto-detekcja skanu:** ☐ TAK ☐ NIE
**Accuracy:** ☐ 90%+ ☐ 70-90% ☐ < 70%
**Uwagi:** _________________________________

#### F3. Screenshot artykułu (PNG)
- [ ] Zrób screenshot artykułu z ISAP
- [ ] Załącz PNG
- [ ] Toast: "Rozpoznano tekst z obrazu"
- [ ] Zapytaj: "O czym jest ten artykuł?"
- [ ] AI czyta z OCR i wyjaśnia

**Status OCR:** ☐ PASS ☐ FAIL
**Accuracy:** ☐ 90%+ ☐ 70-90% ☐ < 70%
**Uwagi:** _________________________________

---

## 📊 PODSUMOWANIE

### Rezultaty:
- **Kategoria A (Popular):** ___/5 (____%)
- **Kategoria B (MCP):** ___/8 (____%)
- **Kategoria C (Context):** ___/5 (____%)
- **Kategoria D (Edge):** ___/4 (____%)
- **Kategoria E (Cache):** ___/5 (____%)
- **Kategoria F (OCR):** ___/3 (____%)

**TOTAL:** ___/30 tests (____ % success rate)

### Performance:
- **Cache hit rate:** ___/5 cache tests (____%)
- **Średni czas (cache HIT):** _____ ms
- **Średni czas (cache MISS):** _____ ms
- **Najwolniejsza odpowiedź:** _____ ms

### Błędy/Problemy:
1. ___________________________________
2. ___________________________________
3. ___________________________________

### Pozytywne obserwacje:
1. ___________________________________
2. ___________________________________
3. ___________________________________

---

## ✅ MVP READINESS DECISION

☐ **READY FOR INVESTORS** (success rate >= 83%, cache działa, zero crashes)
☐ **NEEDS MINOR FIXES** (success rate 70-82%, kilka bugów)
☐ **NEEDS MAJOR WORK** (success rate < 70%, crashuje)

**Uzasadnienie:** _________________________________
_________________________________________________
_________________________________________________

**Następne kroki:** _________________________________
_________________________________________________
_________________________________________________

---

**Podpis testera:** ___________________
**Data:** ___________________
