# Strategia Zapobiegania Rate Limiting (429 Errors)

## Ogólny Wzorzec Problemu

Błąd 429 z Anthropic API ("50,000 input tokens per minute exceeded") występuje gdy:

```
Input Tokens = System Prompt + User Message + Context (Articles)
```

### Typowy Scenariusz Przekroczenia:

1. **Pytanie użytkownika:** "Czy mogę rozwiązać umowę z operatorem?"
2. **System wykrywa 3 tematy:** telecom, employment, rental (zbyt szerokie keywords)
3. **Każdy temat dodaje artykuły:** 3 tematy × 3 artykuły = 9 artykułów
4. **Każdy artykuł:** ~50,000 znaków ≈ 12,500 tokenów
5. **Łączne tokeny:** 9 × 12,500 = 112,500 tokenów → **BŁĄD 429**

---

## Ogólna Strategia Rozwiązania

### 🎯 Zasada #1: Limit Wykrywanych Tematów (TOP 1)

**Problem:** System wykrywa WSZYSTKIE pasujące tematy jednocześnie

**Rozwiązanie:** Wykryj tylko NAJLEPIEJ pasujący temat

```typescript
// ❌ PRZED (ZŁE):
for (const topic of allTopics) {
  if (topic.keywords.some(kw => message.includes(kw))) {
    detectedTopics.push(topic);  // Dodaje WSZYSTKIE
  }
}

// ✅ PO (DOBRE):
const MAX_DETECTED_TOPICS = 1;

const scored = allTopics
  .map(topic => ({
    topic,
    score: topic.keywords.filter(kw =>
      message.includes(kw)
    ).length  // Zlicz ile keywords pasuje
  }))
  .filter(t => t.score > 0)
  .sort((a, b) => b.score - a.score)  // Najwyższy score pierwszy
  .slice(0, MAX_DETECTED_TOPICS);     // Weź TOP 1
```

**Oszczędność:** 60-80% redukcja tokenów

---

### 🎯 Zasada #2: Zwiększ Specyficzność Keywords

**Problem:** Zbyt ogólne słowa kluczowe powodują false positives

**Rozwiązanie:** Użyj pełnych fraz zamiast pojedynczych słów

```typescript
// ❌ PRZED (ZŁE):
keywords: ["rozwiązanie", "umowa", "wypowiedzenie"]
// Pasuje do: pracy, najmu, telecomu, wszystkiego!

// ✅ PO (DOBRE):
keywords: [
  "rozwiązanie umowy o pracę",
  "wypowiedzenie pracy",
  "zwolnienie z pracy"
]
// Pasuje TYLKO do employment questions
```

---

### 🎯 Zasada #3: Zmniejsz Limit Pobieranych Artykułów

**Problem:** Za dużo artykułów pobieranych jednocześnie

**Rozwiązanie:** Dynamiczne limity oparte na tier użytkownika

```typescript
// Każdy artykuł: ~50k chars ≈ 12.5k tokens
// Anthropic limit: 50k tokens/min

const MAX_ARTICLES = usePremiumModel
  ? 6   // Premium: 6 × 12.5k = 75k tokens (WCIĄŻ ZA DUŻO!)
  : 3;  // Standard: 3 × 12.5k = 37.5k tokens (BEZPIECZNE)

// ✅ ZALECANE WARTOŚCI (po TOP 1 topic):
const MAX_ARTICLES_FROM_TOPICS = usePremiumModel ? 4 : 2;
const MAX_TOTAL_ARTICLES = usePremiumModel ? 6 : 3;
```

**Matematyka:**
- Standard user: 2 artykuły × 12.5k = 25k tokens + prompt (2.5k) = **27.5k** ✅
- Premium user: 4 artykuły × 12.5k = 50k tokens + prompt (2.5k) = **52.5k** ⚠️ (na granicy)

---

### 🎯 Zasada #4: Monitoring Tokenów

**Problem:** Nie wiesz ile tokenów faktycznie zużywasz

**Rozwiązanie:** Loguj usage z message_start events

```typescript
// Anthropic streaming API zwraca usage w message_start event
if (parsed.type === 'message_start' && parsed.message?.usage) {
  const inputTokens = parsed.message.usage.input_tokens;
  const outputTokens = parsed.message.usage.output_tokens;

  console.log(`[TOKENS] Input: ${inputTokens}, Output: ${outputTokens}`);

  // Alert gdy blisko limitu
  if (inputTokens > 40000) {
    console.warn(`[TOKENS] ⚠️  HIGH INPUT: ${inputTokens}/50000`);
  }
}
```

**Zalety:**
- Widzisz rzeczywiste zużycie
- Możesz wykryć problemy przed 429
- Data-driven optimization

---

### 🎯 Zasada #5: Graceful Degradation

**Problem:** Gdy 429 wystąpi, użytkownik dostaje błąd

**Rozwiązanie:** Fallback do wiedzy AI bez artykułów

```typescript
if (response.status === 429) {
  console.log('[FALLBACK] Rate limit exceeded - using AI knowledge');

  // Drugi request BEZ context articles (tylko system prompt + message)
  const fallbackResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5',  // Tańszy model
    max_tokens: 2048,
    system: minimalSystemPrompt,  // Bez artykułów
    messages: [{ role: 'user', content: message }]
  });

  // Dodaj disclaimer
  return {
    answer: fallbackResponse.content +
      "\n\n⚠️ Odpowiedź oparta na wiedzy AI (przekroczono limit zapytań)"
  };
}
```

---

## Implementacja Krok Po Kroku

### Krok 1: Audit Obecnego Systemu

```bash
# Ile tematów w LEGAL_CONTEXT?
grep -c "^  [a-z_]*: {" legal-context.ts

# Ile znaków ma system prompt?
sed -n '241,494p' index.ts | wc -c

# Ile artykułów pobierasz średnio?
# Sprawdź logi: [CONTEXT] Detected X articles
```

### Krok 2: Dodaj Topic Scoring

```typescript
// W detectLegalContext():
const topicScores = Object.entries(LEGAL_CONTEXT)
  .map(([key, data]) => ({
    key,
    data,
    score: data.keywords.filter(kw =>
      message.toLowerCase().includes(kw.toLowerCase())
    ).length
  }))
  .filter(t => t.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 1);  // TOP 1 tylko
```

### Krok 3: Dodaj Token Monitoring

```typescript
// W stream parsing loop:
if (parsed.type === 'message_start' && parsed.message?.usage) {
  const usage = parsed.message.usage;
  console.log(`[TOKENS] Input: ${usage.input_tokens}, Output: ${usage.output_tokens}`);
}
```

### Krok 4: Zmniejsz Limity Artykułów

```typescript
// W enrichWithArticles():
const MAX_ARTICLES_FROM_TOPICS = 2;  // Było: 5
const MAX_TOTAL_ARTICLES = 3;        // Było: 10
```

### Krok 5: Zwiększ Specyficzność Keywords

```typescript
// Dla każdego tematu w legal-context.ts:
// ❌ PRZED:
keywords: ["wypowiedzenie", "umowa"]

// ✅ PO:
keywords: [
  "wypowiedzenie umowy o pracę",
  "rozwiązanie umowy o pracę",
  "zwolnienie z pracy"
]
```

---

## Przykład Przed/Po

### PRZED zmianami:

```
Pytanie: "Czy mogę rozwiązać umowę z operatorem?"

[CONTEXT] Detected topic: Wypowiedzenie umowy o pracę
[CONTEXT] Detected topic: Wypowiedzenie najmu
[CONTEXT] Detected topic: Umowy telekomunikacyjne
[CONTEXT] Total: 9 articles

[TOKENS] Input: 112,500 → BŁĄD 429
```

### PO zmianach:

```
Pytanie: "Czy mogę rozwiązać umowę z operatorem?"

[CONTEXT] Detected topic: Umowy telekomunikacyjne - score: 3
[CONTEXT] Total: 3 articles

[TOKENS] Input: 37,500 → SUCCESS ✅
```

---

## Monitoring i Debugging

### Sprawdź Logi:

```bash
# Ile tematów wykryto?
grep "\[CONTEXT\] Detected topic:" logs.txt

# Ile tokenów zużyto?
grep "\[TOKENS\]" logs.txt

# Czy są błędy 429?
grep "429\|rate limit" logs.txt
```

### Red Flags:

- ⚠️ Więcej niż 1 temat wykryty
- ⚠️ Więcej niż 5 artykułów pobieranych
- ⚠️ Input tokens > 40,000
- ⚠️ Częste błędy 429 w logach

---

## Checklisty

### ✅ Przed Deployment:

- [ ] MAX_DETECTED_TOPICS = 1
- [ ] MAX_TOTAL_ARTICLES ≤ 3 (standard) / ≤ 6 (premium)
- [ ] Token monitoring włączony
- [ ] Keywords są specific (3+ wyrazy)
- [ ] Przetestowano z najczęstszymi pytaniami

### ✅ Po Deployment:

- [ ] Sprawdź logi co tydzień
- [ ] Monitoruj rate 429 errors
- [ ] Adjustuj limity jeśli potrzeba
- [ ] Dodawaj nowe tematy ostrożnie (testuj keyword specificity)

---

## Zaawansowane Optymalizacje (Future)

### 1. Lazy Loading Artykułów

Zamiast pobierać artykuły PRZED pierwszym requestem, pozwól LLM je pobierać przez tool calling:

```typescript
// Teraz: Eager loading
enrichWithArticles() → Fetch all → Add to prompt → LLM call

// Future: Lazy loading
LLM call → LLM decides what it needs → Tool call → Fetch specific article
```

### 2. Cache'owanie Artykułów

```typescript
const articleCache = new Map<string, ArticleResponse>();

// Cache artykuły przez 1h
if (cache.has(key) && !isExpired(key)) {
  return cache.get(key);
}
```

### 3. Adaptive Limits

```typescript
// Zmniejsz limity gdy rate limit się zbliża
if (recentTokenUsage > 40000) {
  MAX_ARTICLES = 2;  // Temporary reduction
}
```

---

## Podsumowanie

**3 Kluczowe Zmiany:**

1. **TOP 1 Topic Detection** - Zmniejsza tokeny o 60-80%
2. **Specific Keywords** - Zapobiega false positives
3. **Token Monitoring** - Data-driven optimization

**Rezultat:**

- Redukcja 429 errors o 90%+
- Średnie zużycie: 25-35k tokens (z 75-120k)
- Lepsze dopasowanie odpowiedzi (1 topic = bardziej focused)

---

## Wsparcie

Jeśli nadal występują problemy 429:

1. Sprawdź logi dla `[TOKENS]` i `[CONTEXT]`
2. Upewnij się że MAX_DETECTED_TOPICS = 1
3. Zmniejsz MAX_TOTAL_ARTICLES do 2
4. Dodaj more specific keywords
5. Consider lazy loading architecture

**Ostatnia aktualizacja:** 2025-11-12
**Wersja:** 1.0
