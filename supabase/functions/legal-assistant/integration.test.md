# Testy Integracyjne - Legal Assistant AI

## Scenariusze testowe po optymalizacji

### Test 1: Wykrywanie kontekstu - Urlop
**Pytanie:** "Ile dni urlopu wypoczynkowego mi się należy?"

**Oczekiwany wynik:**
- ✅ AI powinno wykryć temat "urlop"
- ✅ System prompt powinien zawierać kontekst z Art. 152-155 Kodeksu pracy
- ✅ Odpowiedź powinna zawierać dokładne informacje o wymiarze (20 lub 26 dni)
- ✅ Temperature 0.3 powinna zapewnić spójną odpowiedź

### Test 2: Wykrywanie kontekstu - Zwrot towaru online
**Pytanie:** "Kupiłem buty w sklepie internetowym. Czy mogę je zwrócić?"

**Oczekiwany wynik:**
- ✅ AI powinno wykryć temat "zwrot_towaru_online"
- ✅ Kontekst: Art. 27-38 Ustawy o prawach konsumenta
- ✅ Odpowiedź o 14 dniach na odstąpienie
- ✅ Informacja o wyjątkach (Art. 38)

### Test 3: Wykrywanie kontekstu - RODO
**Pytanie:** "Firma przetwarza moje dane osobowe bez zgody. Co mogę zrobić?"

**Oczekiwany wynik:**
- ✅ AI wykrywa temat "rodo"
- ✅ Kontekst: Art. 6, 15, 17 RODO
- ✅ Informacja o prawach (dostęp, usunięcie, sprostowanie)
- ✅ Link do RODO na eur-lex.europa.eu

### Test 4: Nowy temat - Prawo spadkowe
**Pytanie:** "Zmarł mój ojciec. Jak wygląda dziedziczenie bez testamentu?"

**Oczekiwany wynik:**
- ✅ AI wykrywa nowy temat "spadek"
- ✅ Kontekst: Art. 922, 924, 931 KC
- ✅ Informacja o dziedziczeniu ustawowym
- ✅ Wspomniane Art. 1011 o zachowku

### Test 5: Nowy temat - Mobbing
**Pytanie:** "Szef ciągle krzyczy na mnie przy innych pracownikach. Czy to mobbing?"

**Oczekiwany wynik:**
- ✅ AI wykrywa temat "mobbing"
- ✅ Kontekst: Art. 94³ Kodeksu pracy
- ✅ Definicja mobbingu
- ✅ Informacja o odszkodowaniu (Art. 300 KC)

### Test 6: Nowy temat - Prawa autorskie
**Pytanie:** "Ktoś opublikował moje zdjęcie bez zgody. Co mogę zrobić?"

**Oczekiwany wynik:**
- ✅ AI wykrywa temat "prawa_autorskie"
- ✅ Kontekst: Art. 1, 16, 17 ustawy o prawie autorskim
- ✅ Informacja o prawach osobistych i majątkowych
- ✅ Możliwość dochodzenia roszczeń (Art. 79, 115-119)

### Test 7: Nowy temat - Postępowanie sądowe
**Pytanie:** "Jak złożyć pozew do sądu?"

**Oczekiwany wynik:**
- ✅ AI wykrywa temat "postepowanie_sadowe"
- ✅ Kontekst: Art. 126 KPC (pozew)
- ✅ Procedura składania pozwu
- ✅ Informacja o kosztach (Art. 19, 98 KPC)

### Test 8: Wykrywanie wielu tematów
**Pytanie:** "Dostałem wypowiedzenie i nie dostałem pensji za ostatni miesiąc"

**Oczekiwany wynik:**
- ✅ AI wykrywa DWA tematy: "wypowiedzenie_umowy_pracy" + "wynagrodzenie"
- ✅ Kontekst zawiera oba zestawy przepisów
- ✅ Odpowiedź odnosi się do obu kwestii

### Test 9: Pytanie nieprawne - odrzucenie
**Pytanie:** "Jak ugotować makaron carbonara?"

**Oczekiwany wynik:**
- ✅ AI NIE wykrywa kontekstu prawnego (pusty string)
- ✅ Odpowiedź: "❌ Przepraszam, ale jestem asystentem prawnym..."
- ✅ Odmowa odpowiedzi na pytanie niezwiązane z prawem

### Test 10: Pytanie z załączonym plikiem
**Pytanie:** "Czy ta umowa jest prawidłowa?" + [załączony PDF umowy]

**Oczekiwany wynik:**
- ✅ AI przetwarza fileContext (limit 30000 znaków)
- ✅ Priorytet dla analizy dokumentu
- ✅ Cytowanie konkretnych fragmentów z umowy
- ✅ Odniesienie do odpowiednich przepisów

### Test 11: Złożone pytanie prawne
**Pytanie:** "Pracodawca chce mnie zwolnić, ale jestem w ciąży. Czy może to zrobić?"

**Oczekiwany wynik:**
- ✅ Wykrycie tematu "wypowiedzenie_umowy_pracy"
- ✅ Temperatura 0.3 = precyzyjna odpowiedź o ochronie kobiet w ciąży
- ✅ Max_tokens 4096 = szczegółowe wyjaśnienie
- ✅ Art. 177 Kodeksu pracy (zakaz wypowiedzenia)

### Test 12: Temperatura 0.3 - konsystencja odpowiedzi
**Test:** Zadaj to samo pytanie 3 razy: "Ile dni urlopu mi przysługuje?"

**Oczekiwany wynik:**
- ✅ Wszystkie 3 odpowiedzi powinny być bardzo podobne
- ✅ Te same podstawy prawne w każdej odpowiedzi
- ✅ Minimalna wariancja w sformułowaniach
- ✅ Brak halucynacji lub różnych interpretacji

## Metryki do sprawdzenia

### Wydajność
- ⏱️ Czas generowania odpowiedzi: < 5 sekund
- 📊 Długość odpowiedzi: 500-2000 tokenów (średnio)
- 🎯 Trafność wykrywania kontekstu: > 95%

### Jakość
- ✅ Dokładność podstaw prawnych: 100%
- ✅ Odpowiedzi w strukturze (PODSTAWA PRAWNA, CO TO OZNACZA, etc.)
- ✅ Zawsze disclaimer: "⚠️ To nie jest porada prawna..."
- ✅ Linki do źródeł (isap.sejm.gov.pl lub eur-lex.europa.eu)

### Bezpieczeństwo
- 🔒 Odrzucanie pytań nieprawnych: 100%
- 🔒 Odrzucanie pytań o działania nielegalne
- 🔒 Rate limiting: max 10 zapytań/minutę/IP

## Porównanie przed/po optymalizacji

| Metryka | Przed | Po optymalizacji |
|---------|-------|------------------|
| System prompt | ~100 linii | ~50 linii |
| Max tokens | 2048 | 4096 |
| Temperature | 0.7 | 0.3 |
| Kontekst prawny | ❌ Brak | ✅ 16 kategorii |
| Wykrywanie tematu | ❌ Brak | ✅ Automatyczne |
| Precyzja odpowiedzi | Średnia | Wysoka |
| Długość odpowiedzi | Krótka | Szczegółowa |
| Konsystencja | Niska | Wysoka |

## Uwagi końcowe

Po wdrożeniu zmian, funkcja legal-assistant powinna:
1. **Automatycznie wykrywać** temat pytania i dodawać kontekst prawny
2. **Generować precyzyjne** odpowiedzi z niższą temperaturą
3. **Oferować szczegółowe** wyjaśnienia dzięki większemu limitowi tokenów
4. **Pokrywać więcej tematów** - 16 zamiast 9 kategorii prawnych
5. **Zachowywać konsystencję** - te same pytania = podobne odpowiedzi
