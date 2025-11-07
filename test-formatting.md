# Test formatowania odpowiedzi Legal Assistant

## Oczekiwana struktura odpowiedzi:

```markdown
**PODSTAWA PRAWNA:**
Ustawa z dnia 30 maja 2014 r. o prawach konsumenta, Art. 27


**CO TO OZNACZA:**
Konsument może zwrócić towar zakupiony w sklepie internetowym w ciągu 14 dni od jego otrzymania bez podawania przyczyny.


**POWIĄZANE PRZEPISY:**
• Art. 28 Ustawy o prawach konsumenta - złożenie oświadczenia o odstąpieniu
• Art. 29 Ustawy o prawach konsumenta - termin na zwrot pieniędzy


**ŹRÓDŁO:**
https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827


---

**UWAGA:**
⚠️ To nie jest porada prawna. W indywidualnych sprawach skonsultuj się z prawnikiem.
```

## Kluczowe zmiany w formatowaniu:

### ✅ Poprawki wprowadzone:

1. **Dwie puste linie między sekcjami** - lepszy podział wizualny
2. **Linia pozioma `---` przed UWAGA** - wyraźne oddzielenie sekcji końcowej
3. **Sekcja UWAGA zawsze na końcu** - po linii poziomej
4. **Przykład w promptcie** - AI widzi dokładnie jak ma formatować

### 📊 Porównanie:

| Element | Przed | Po |
|---------|-------|-----|
| Odstępy między sekcjami | 1 linia | 2 linie |
| Separator przed UWAGA | ❌ Brak | ✅ `---` |
| Wizualne wyróżnienie UWAGA | ❌ Słabe | ✅ Mocne |
| Przykład w promptcie | ❌ Brak | ✅ Pełny przykład |

### 🎯 Oczekiwany efekt:

- Sekcja **UWAGA** będzie renderowana w osobnym czerwonym boxie/bloku ostrzeżenia
- Linia `---` w markdown tworzy separator `<hr>` który wizualnie oddziela sekcje
- Dwie puste linie dają więcej "przestrzeni do oddychania" między sekcjami
- Struktura jest bardziej przejrzysta i czytelna

### 🧪 Przykładowe pytania do przetestowania:

1. "Ile dni urlopu mi przysługuje?"
2. "Czy mogę zwrócić towar kupiony online?"
3. "Jak długo muszę czekać na wypłatę pensji?"

Każda z tych odpowiedzi powinna mieć:
- ✅ Dwie puste linie między każdą sekcją
- ✅ Linię `---` przed sekcją UWAGA
- ✅ Sekcję UWAGA na samym końcu
