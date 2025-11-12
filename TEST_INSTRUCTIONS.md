# 🧪 MVP Testing Instructions

## QUICK START (Raspberry Pi)

### 1. Przygotowanie środowiska

```bash
cd /home/user/najakiejpodstawie

# Set environment variables (zastąp wartościami z Supabase)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"

# Make script executable
chmod +x test-runner.sh

# Run tests
./test-runner.sh
```

### 2. Uruchomienie testów

```bash
# OPTION A: Full test suite (wszystkie 30 pytań)
./test-runner.sh

# OPTION B: Manual testing przez UI
# 1. Otwórz https://jakieprawo.pl/czat
# 2. Zadaj pytania z test-scenarios.md
# 3. Sprawdź czy odpowiedzi są poprawne
# 4. Zbierz logi z Supabase (patrz sekcja 3)
```

---

## 📊 ZBIERANIE WYNIKÓW

### Format output:

Po uruchomieniu `./test-runner.sh` zobaczysz:

```
🧪 MVP Test Runner - JakiePrawo.pl
==================================
Timestamp: 20250112_143045
API: https://xxx.supabase.co/functions/v1/legal-assistant
Results: ./test-results/results_20250112_143045.txt

📋 Running Test Suite...

📌 CATEGORY A: Popular Questions (Cache Test)
----------------------------------------------
Testing A1: A-Popular - ✓ PASS (3420ms, cache: MISS)
Testing A2: A-Popular - ✓ PASS (2890ms, cache: MISS)
Testing A3: A-Popular - ✓ PASS (4100ms, cache: MISS)
Testing A4: A-Popular - ✓ PASS (3750ms, cache: MISS)
Testing A5: A-Popular - ✓ PASS (3200ms, cache: MISS)

📌 CATEGORY B: Specific Articles (MCP Test)
--------------------------------------------
Testing B1: B-MCP - ✓ PASS (4200ms, cache: MISS)
Testing B2: B-MCP - ✓ PASS (3900ms, cache: MISS)
...

📌 CATEGORY E: Cache Validation (Duplicates)
----------------------------------------------
Testing E1: E-Cache - ✓ PASS (280ms, cache: HIT)   ← CACHE DZIAŁA!
Testing E2: E-Cache - ✓ PASS (310ms, cache: HIT)
Testing E3: E-Cache - ✓ PASS (290ms, cache: HIT)
Testing E4: E-Cache - ✓ PASS (305ms, cache: HIT)
Testing E5: E-Cache - ✓ PASS (275ms, cache: HIT)

==================================
📊 TEST SUMMARY
==================================

Total tests:    30
Passed:         28
Failed:         2
Success rate:   93.3%

Cache hits:     5
Cache misses:   25
Cache hit rate: 16.7%

Results saved to: ./test-results/results_20250112_143045.txt
Summary saved to: ./test-results/summary_20250112_143045.json

✅ ALL TESTS PASSED!
```

### Pliki wynikowe:

1. **results_[timestamp].txt** - Szczegółowe rezultaty każdego testu
2. **summary_[timestamp].json** - JSON podsumowanie (dla Claude'a do analizy)

---

## 📋 ZBIERANIE LOGÓW Z SUPABASE

### OPTION 1: Przez Supabase Dashboard

1. Otwórz https://supabase.com/dashboard
2. Wybierz projekt
3. **Database** → **Table Editor** → `user_questions`
4. Filter by session_id: `test-session-[timestamp]`
5. Export to CSV lub skopiuj dane

### OPTION 2: SQL Query (Supabase SQL Editor)

```sql
-- Get all test questions from last hour
SELECT
    created_at,
    question,
    LEFT(answer, 100) as answer_preview,
    question_hash,
    response_time_ms,
    has_file_context,
    session_id
FROM user_questions
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND session_id LIKE 'test-session-%'
ORDER BY created_at DESC;
```

### OPTION 3: Bash script (z Raspberry Pi)

Utwórz plik `get-logs.sh`:

```bash
#!/bin/bash

# Get logs from Supabase
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
SESSION_ID="test-session-${1:-latest}"

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/get_recent_questions" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"session_filter\": \"${SESSION_ID}\"}"
```

---

## 🔍 CO PRZESŁAĆ DO CLAUDE'A DO ANALIZY

### Minimum:

1. **summary_[timestamp].json** - JSON podsumowanie
2. **results_[timestamp].txt** - Szczegółowe rezultaty

### Idealnie:

1. Summary + Results (jak wyżej)
2. **Logi z Supabase** (SQL query output lub CSV export)
3. **Edge Function logs** (jeśli są errory):
   - Supabase Dashboard → Functions → legal-assistant → Logs

### Format do skopiowania:

```
=== TEST RESULTS ===

Summary:
[wklej zawartość summary_[timestamp].json]

Detailed Results:
[wklej zawartość results_[timestamp].txt]

Supabase Logs:
[wklej output SQL query]

Edge Function Logs (jeśli są błędy):
[wklej logi z Supabase Dashboard]
```

---

## ❓ INTERPRETACJA WYNIKÓW

### ✅ SUCCESS CRITERIA (dla MVP):

**MUST HAVE:**
- Success rate: **>= 83%** (25/30 pytań)
- Category A (Popular): **100%** (5/5)
- Category E (Cache): **100%** cache hits (5/5)
- Zero crashes (HTTP 500)

**NICE TO HAVE:**
- Category B (MCP): **>= 87%** (7/8)
- Category C (Context): **>= 80%** (4/5)
- Category D (Edge): Graceful errors (nie crash)

### 📊 Cache Performance:

**Po pierwszym uruchomieniu:**
- Cache hit rate: ~16% (5/30 - tylko duplikaty z kategorii E)

**Po tygodniu użytkowania:**
- Cache hit rate: 40-60% (popularne pytania powtarzają się)

**Oszczędność:**
- Cache HIT: $0 (nie wywołujemy AI)
- Cache MISS: ~$0.0024 (AI call)
- Przy 60% hit rate na 1000 pytań: oszczędność ~$1.44

### ⏱️ Response Times:

**Oczekiwane:**
- Cache HIT: 200-500ms ⚡
- Cache MISS + MCP (1 artykuł): 2-5s
- Cache MISS + MCP (3+ artykuły): 5-10s
- Cache MISS + AI only: 2-4s

**Red flags:**
- Cache HIT > 1s → coś nie tak z cache
- Any request > 15s → timeout issues
- HTTP 500 errors → crashes (FAIL)

---

## 🚨 CO ZROBIĆ GDY TESTY FAILUJĄ

### Scenario 1: High failure rate (< 80%)

```bash
# Check edge function logs
# Supabase Dashboard → Functions → legal-assistant → Logs

# Look for errors:
- MCP timeout errors → zwiększ timeout
- Rate limiting → check Anthropic quota
- Database errors → check migration ran
```

### Scenario 2: Cache nie działa (0% hit rate)

```bash
# Verify migration ran:
# Supabase Dashboard → Database → Migrations
# Should see: 20250112000000_add_question_cache_index.sql ✓

# Check if column exists:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_questions' AND column_name = 'question_hash';
# Should return: question_hash
```

### Scenario 3: OCR tests (manual)

**Test F1: Zdjęcie umowy (JPG)**
```
1. Otwórz /czat
2. Kliknij "Załącz plik"
3. Wybierz zdjęcie umowy najmu (zrób telefonem)
4. Poczekaj na "Rozpoznano tekst z obrazu" ✓
5. Zadaj pytanie: "Ile wynosi kaucja?"
6. Sprawdź czy AI znajduje wartość z OCR
```

---

## 📝 TEMPLATE DO RAPORTU

```markdown
# MVP Test Report - [DATE]

## Summary
- Total tests: XX
- Success rate: XX%
- Cache hit rate: XX%
- Average response time: XXXms

## Category Results
- A (Popular): X/5 (XX%)
- B (MCP): X/8 (XX%)
- C (Context): X/5 (XX%)
- D (Edge): X/4 (XX%)
- E (Cache): X/5 (XX%)

## Performance
- Cache HIT avg: XXXms
- Cache MISS avg: XXXms
- Fastest response: XXXms
- Slowest response: XXXms

## Issues Found
1. [Describe any failures]
2. [Describe edge cases]
3. [Any errors/warnings]

## Recommendations
- [What needs fixing]
- [What works well]
- [Ready for investors? YES/NO]
```

---

## 🎯 NEXT STEPS AFTER TESTING

### If success rate >= 83%:
✅ **READY FOR INVESTORS!**
1. Merge to main
2. Deploy to production
3. Create demo video/screenshots
4. Prepare investor pitch

### If success rate < 83%:
⚠️ **NEEDS FIXES** (~$5-10 budget left)
1. Przeanalizuj failed tests z Claude'm
2. Targeted fixes (nie przepisujemy wszystkiego!)
3. Re-test
4. Then → investors

---

## 💡 PRO TIPS

1. **Uruchom testy 2 razy**:
   - 1st run: Cache misses (baseline)
   - 2nd run: Cache hits (verify caching works)

2. **Test OCR osobno** (manual):
   - Wymaga załączników (trudne do zautomatyzowania)
   - Ale bardzo impressive dla inwestorów!

3. **Zbieraj metryki**:
   - Response times
   - Cache hit rates
   - Token usage
   - → Pokazuje skalowanie i koszty

4. **Screenshot wins**:
   - Cache HIT w < 300ms
   - Poprawna odpowiedź z MCP
   - OCR rozpoznający umowę
   - → Marketing materials!

---

## 📞 SUPPORT

Jeśli coś nie działa:
1. Sprawdź logi (Supabase Dashboard)
2. Verify env vars (SUPABASE_URL, ANON_KEY)
3. Daj Claude'owi output + logi
4. Naprawimy razem! 🚀
