#!/bin/bash

# MVP Test Runner
# Automatyczne testowanie aplikacji JakiePrawo.pl

set -e

# Configuration
API_URL="${SUPABASE_URL}/functions/v1/legal-assistant"
ANON_KEY="${SUPABASE_ANON_KEY}"
OUTPUT_DIR="./test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="${OUTPUT_DIR}/results_${TIMESTAMP}.txt"
SUMMARY_FILE="${OUTPUT_DIR}/summary_${TIMESTAMP}.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create output directory
mkdir -p "${OUTPUT_DIR}"

echo "🧪 MVP Test Runner - JakiePrawo.pl"
echo "=================================="
echo "Timestamp: ${TIMESTAMP}"
echo "API: ${API_URL}"
echo "Results: ${RESULTS_FILE}"
echo ""

# Initialize counters
total_tests=0
passed_tests=0
failed_tests=0
cache_hits=0
cache_misses=0

# Function to call API
call_api() {
    local question="$1"
    local category="$2"
    local test_id="$3"

    echo -n "Testing ${test_id}: ${category} - "

    start_time=$(date +%s%3N)

    # Call API
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
        -X POST "${API_URL}" \
        -H "Content-Type: application/json" \
        -H "apikey: ${ANON_KEY}" \
        -H "Authorization: Bearer ${ANON_KEY}" \
        -d "{
            \"message\": \"${question}\",
            \"sessionId\": \"test-session-${TIMESTAMP}\",
            \"messageId\": \"test-msg-${test_id}\",
            \"usePremiumModel\": false
        }")

    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))

    # Parse response (last 2 lines are status code and time)
    http_code=$(echo "$response" | tail -2 | head -1)
    body=$(echo "$response" | head -n -2)

    # Extract cache status from headers (if available)
    cache_status="UNKNOWN"
    if echo "$body" | grep -q "X-Cache-Status: HIT"; then
        cache_status="HIT"
        ((cache_hits++))
    elif [ -n "$body" ]; then
        cache_status="MISS"
        ((cache_misses++))
    fi

    # Check success
    ((total_tests++))

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${response_time}ms, cache: ${cache_status})"
        ((passed_tests++))

        # Log to results file
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:50}... | PASS | ${response_time}ms | ${cache_status} | http_${http_code}" >> "${RESULTS_FILE}"

        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (${response_time}ms, HTTP ${http_code})"
        ((failed_tests++))

        # Log to results file with error
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:50}... | FAIL | ${response_time}ms | ${cache_status} | http_${http_code}" >> "${RESULTS_FILE}"
        echo "  Error body: ${body:0:200}" >> "${RESULTS_FILE}"

        return 1
    fi
}

# Header for results file
echo "TIMESTAMP | TEST_ID | CATEGORY | QUESTION | STATUS | TIME | CACHE | INFO" > "${RESULTS_FILE}"
echo "==================================================================================" >> "${RESULTS_FILE}"

echo "📋 Running Test Suite..."
echo ""

# CATEGORY A: Popular Questions (Cache Test)
echo "📌 CATEGORY A: Popular Questions (Cache Test)"
echo "----------------------------------------------"

call_api "Ile punktów karnych można mieć maksymalnie?" "A-Popular" "A1"
call_api "Kiedy przedawnia się roszczenie?" "A-Popular" "A2"
call_api "Ile dni urlopu się należy?" "A-Popular" "A3"
call_api "Ile wynosi minimalne wynagrodzenie w Polsce?" "A-Popular" "A4"
call_api "Czy wynajmujący może żądać kaucji?" "A-Popular" "A5"

echo ""

# CATEGORY B: Specific Articles (MCP Test)
echo "📌 CATEGORY B: Specific Articles (MCP Test)"
echo "--------------------------------------------"

call_api "art 118 kc" "B-MCP" "B1"
call_api "art 152 kp" "B-MCP" "B2"
call_api "art 25 kk" "B-MCP" "B3"
call_api "art 103 prawo o ruchu drogowym" "B-MCP" "B4"
call_api "art 30 konstytucji" "B-MCP" "B5"
call_api "art 187 kpc" "B-MCP" "B6"
call_api "art 23 kro" "B-MCP" "B7"
call_api "art 10 ustawa o prawach konsumenta" "B-MCP" "B8"

echo ""

# CATEGORY C: General Questions (LEGAL_CONTEXT Test)
echo "📌 CATEGORY C: General Questions (Context Test)"
echo "------------------------------------------------"

call_api "Co to jest obrona konieczna?" "C-Context" "C1"
call_api "Jak rozwiązać umowę o pracę?" "C-Context" "C2"
call_api "Ile godzin tygodniowo można pracować?" "C-Context" "C3"
call_api "Jakie mam prawa przy windykacji długu?" "C-Context" "C4"
call_api "Czy można pozwać za zniesławienie w internecie?" "C-Context" "C5"

echo ""

# CATEGORY D: Edge Cases (Error Handling)
echo "📌 CATEGORY D: Edge Cases (Error Handling)"
echo "-------------------------------------------"

call_api "art 207 kpc" "D-Edge" "D1" || true  # Uchylony - może failować
call_api "art 99999 kc" "D-Edge" "D2" || true  # Nieistniejący - może failować
call_api "art 10 ustawa o kotach i psach" "D-Edge" "D3" || true  # Nieznana ustawa
call_api "Jaka jest najlepsza pizza w Warszawie?" "D-Edge" "D4" || true  # Off-topic

echo ""

# CATEGORY E: Cache Validation (Repeat questions)
echo "📌 CATEGORY E: Cache Validation (Duplicates)"
echo "----------------------------------------------"

call_api "Ile punktów karnych można mieć maksymalnie?" "E-Cache" "E1"
call_api "Kiedy przedawnia się roszczenie?" "E-Cache" "E2"
call_api "Ile dni urlopu się należy?" "E-Cache" "E3"
call_api "Ile wynosi minimalne wynagrodzenie w Polsce?" "E-Cache" "E4"
call_api "Czy wynajmujący może żądać kaucji?" "E-Cache" "E5"

echo ""
echo "=================================="
echo "📊 TEST SUMMARY"
echo "=================================="
echo ""
echo "Total tests:    ${total_tests}"
echo -e "Passed:         ${GREEN}${passed_tests}${NC}"
echo -e "Failed:         ${RED}${failed_tests}${NC}"
echo "Success rate:   $(awk "BEGIN {printf \"%.1f%%\", (${passed_tests}/${total_tests})*100}")"
echo ""
echo "Cache hits:     ${cache_hits}"
echo "Cache misses:   ${cache_misses}"
echo "Cache hit rate: $(awk "BEGIN {printf \"%.1f%%\", (${cache_hits}/(${cache_hits}+${cache_misses}))*100}")"
echo ""

# Generate JSON summary
cat > "${SUMMARY_FILE}" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "total_tests": ${total_tests},
  "passed": ${passed_tests},
  "failed": ${failed_tests},
  "success_rate": $(awk "BEGIN {printf \"%.2f\", (${passed_tests}/${total_tests})*100}"),
  "cache_hits": ${cache_hits},
  "cache_misses": ${cache_misses},
  "cache_hit_rate": $(awk "BEGIN {printf \"%.2f\", (${cache_hits}/(${cache_hits}+${cache_misses}))*100}"),
  "results_file": "${RESULTS_FILE}",
  "api_url": "${API_URL}"
}
EOF

echo "Results saved to: ${RESULTS_FILE}"
echo "Summary saved to: ${SUMMARY_FILE}"
echo ""

# Exit code
if [ "${failed_tests}" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
    exit 1
fi
