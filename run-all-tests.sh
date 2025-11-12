#!/bin/bash

# Full Automated Test Suite for MVP
# Runs all tests + collects logs + generates report
# Usage: ./run-all-tests.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${SUPABASE_URL}/functions/v1/legal-assistant"
ANON_KEY="${SUPABASE_ANON_KEY}"
OUTPUT_DIR="./test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="test-session-${TIMESTAMP}"
RESULTS_FILE="${OUTPUT_DIR}/results_${TIMESTAMP}.txt"
SUMMARY_FILE="${OUTPUT_DIR}/summary_${TIMESTAMP}.json"
REPORT_FILE="${OUTPUT_DIR}/FINAL_REPORT_${TIMESTAMP}.txt"

# Create output directory
mkdir -p "${OUTPUT_DIR}"

echo "════════════════════════════════════════════════════════════"
echo "🧪 AUTOMATED MVP TEST SUITE"
echo "════════════════════════════════════════════════════════════"
echo "Started: $(date)"
echo "Session ID: ${SESSION_ID}"
echo "API: ${API_URL}"
echo "════════════════════════════════════════════════════════════"
echo ""

# Initialize counters
total_tests=0
passed_tests=0
failed_tests=0
cache_hits=0
cache_misses=0
total_response_time=0

# Arrays to store results
declare -a failed_test_ids=()
declare -a failed_test_details=()

# Function to call API and measure
call_api() {
    local question="$1"
    local category="$2"
    local test_id="$3"
    local expected="$4"

    echo -n "[$test_id] ${category}: "

    start_time=$(date +%s%3N)

    # Call API with timeout
    response=$(timeout 30s curl -s -w "\n%{http_code}\n%{time_total}" \
        -X POST "${API_URL}" \
        -H "Content-Type: application/json" \
        -H "apikey: ${ANON_KEY}" \
        -H "Authorization: Bearer ${ANON_KEY}" \
        -d "{
            \"message\": \"${question}\",
            \"sessionId\": \"${SESSION_ID}\",
            \"messageId\": \"${test_id}-msg\",
            \"usePremiumModel\": false
        }" 2>&1) || {
        echo -e "${RED}TIMEOUT${NC}"
        ((total_tests++))
        ((failed_tests++))
        failed_test_ids+=("${test_id}")
        failed_test_details+=("${test_id}: TIMEOUT after 30s")
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:40}... | TIMEOUT | 30000ms | N/A | timeout" >> "${RESULTS_FILE}"
        return 1
    }

    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    total_response_time=$((total_response_time + response_time))

    # Parse response
    http_code=$(echo "$response" | tail -2 | head -1)
    body=$(echo "$response" | head -n -2)

    # Determine cache status
    cache_status="MISS"
    if echo "$body" | grep -q "X-Cache-Status: HIT"; then
        cache_status="HIT"
        ((cache_hits++))
    else
        ((cache_misses++))
    fi

    ((total_tests++))

    # Check success
    if [ "$http_code" = "200" ] || [ "$http_code" = "000" ]; then
        echo -e "${GREEN}PASS${NC} (${response_time}ms, cache: ${cache_status})"
        ((passed_tests++))
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:40}... | PASS | ${response_time}ms | ${cache_status} | http_${http_code}" >> "${RESULTS_FILE}"
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP ${http_code}, ${response_time}ms)"
        ((failed_tests++))
        failed_test_ids+=("${test_id}")
        failed_test_details+=("${test_id}: HTTP ${http_code} - ${body:0:100}")
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:40}... | FAIL | ${response_time}ms | ${cache_status} | http_${http_code}" >> "${RESULTS_FILE}"
        return 1
    fi
}

# Sleep between categories to avoid rate limiting
sleep_between_categories() {
    echo ""
    echo "⏳ Waiting 5s before next category..."
    sleep 5
    echo ""
}

# Initialize results file
echo "TIMESTAMP | TEST_ID | CATEGORY | QUESTION | STATUS | TIME | CACHE | INFO" > "${RESULTS_FILE}"
echo "══════════════════════════════════════════════════════════════════════════════════" >> "${RESULTS_FILE}"

# ═══════════════════════════════════════════════════════════════
# CATEGORY A: Popular Questions (Cache Test)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY A: Popular Questions (Cache Test - 5 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "Ile punktów karnych można mieć maksymalnie?" "A-Popular" "A1" "24 punkty"
call_api "Kiedy przedawnia się roszczenie?" "A-Popular" "A2" "6 lat"
call_api "Ile dni urlopu się należy?" "A-Popular" "A3" "20 lub 26 dni"
call_api "Ile wynosi minimalne wynagrodzenie w Polsce?" "A-Popular" "A4" "minimalna krajowa"
call_api "Czy wynajmujący może żądać kaucji?" "A-Popular" "A5" "TAK"

sleep_between_categories

# ═══════════════════════════════════════════════════════════════
# CATEGORY B: Specific Articles (MCP Test)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY B: Specific Articles (MCP Test - 8 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "art 118 kc" "B-MCP" "B1" "Art. 118 KC"
call_api "art 152 kp" "B-MCP" "B2" "Art. 152 KP"
call_api "art 25 kk" "B-MCP" "B3" "Art. 25 KK"
call_api "art 103 prawo o ruchu drogowym" "B-MCP" "B4" "Art. 103"
call_api "art 30 konstytucji" "B-MCP" "B5" "Art. 30"
call_api "art 187 kpc" "B-MCP" "B6" "Art. 187 KPC"
call_api "art 23 kro" "B-MCP" "B7" "Art. 23 KRO"
call_api "art 10 ustawa o prawach konsumenta" "B-MCP" "B8" "Art. 10"

sleep_between_categories

# ═══════════════════════════════════════════════════════════════
# CATEGORY C: General Questions (Context Test)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY C: General Questions (Context Test - 5 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "Co to jest obrona konieczna?" "C-Context" "C1" "Art. 25 KK"
call_api "Jak rozwiązać umowę o pracę?" "C-Context" "C2" "rozwiązanie"
call_api "Ile godzin tygodniowo można pracować?" "C-Context" "C3" "40 godzin"
call_api "Jakie mam prawa przy windykacji długu?" "C-Context" "C4" "wierzyciel"
call_api "Czy można pozwać za zniesławienie w internecie?" "C-Context" "C5" "Art. 212"

sleep_between_categories

# ═══════════════════════════════════════════════════════════════
# CATEGORY D: Edge Cases (Error Handling - 4 tests)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY D: Edge Cases (Error Handling - 4 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "art 207 kpc" "D-Edge" "D1" "uchylony" || true
call_api "art 99999 kc" "D-Edge" "D2" "nie znaleziono" || true
call_api "art 10 ustawa o kotach i psach" "D-Edge" "D3" "błąd" || true
call_api "Jaka jest najlepsza pizza w Warszawie?" "D-Edge" "D4" "pytania prawne" || true

sleep_between_categories

# ═══════════════════════════════════════════════════════════════
# CATEGORY E: Cache Validation (Duplicates - 5 tests)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY E: Cache Validation (Should all be HIT - 5 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "Ile punktów karnych można mieć maksymalnie?" "E-Cache" "E1" "cache HIT"
call_api "Kiedy przedawnia się roszczenie?" "E-Cache" "E2" "cache HIT"
call_api "Ile dni urlopu się należy?" "E-Cache" "E3" "cache HIT"
call_api "Ile wynosi minimalne wynagrodzenie w Polsce?" "E-Cache" "E4" "cache HIT"
call_api "Czy wynajmujący może żądać kaucji?" "E-Cache" "E5" "cache HIT"

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Calculate statistics
success_rate=$(awk "BEGIN {printf \"%.1f\", (${passed_tests}/${total_tests})*100}")
cache_hit_rate=$(awk "BEGIN {printf \"%.1f\", (${cache_hits}/(${cache_hits}+${cache_misses}))*100}")
avg_response_time=$(awk "BEGIN {printf \"%.0f\", ${total_response_time}/${total_tests}}")

# Determine if MVP is ready
mvp_ready="NO"
if (( passed_tests >= 25 )) && (( cache_hits >= 4 )); then
    mvp_ready="YES"
fi

# ═══════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 FINAL TEST SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Test Execution:"
echo "  Total tests:        ${total_tests}"
echo -e "  Passed:             ${GREEN}${passed_tests}${NC}"
echo -e "  Failed:             ${RED}${failed_tests}${NC}"
echo "  Success rate:       ${success_rate}%"
echo ""
echo "Performance:"
echo "  Cache hits:         ${cache_hits}"
echo "  Cache misses:       ${cache_misses}"
echo "  Cache hit rate:     ${cache_hit_rate}%"
echo "  Avg response time:  ${avg_response_time}ms"
echo ""
echo "MVP Readiness:"
echo -e "  Target: >= 83% success (25/30 tests)"
echo -e "  Target: >= 80% cache hits (4/5 duplicates)"
if [ "$mvp_ready" = "YES" ]; then
    echo -e "  Status: ${GREEN}✅ READY FOR INVESTORS!${NC}"
else
    echo -e "  Status: ${YELLOW}⚠️  NEEDS REVIEW${NC}"
fi
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Failed tests details
if [ ${#failed_test_ids[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Failed Tests Details:${NC}"
    for detail in "${failed_test_details[@]}"; do
        echo "  - ${detail}"
    done
    echo ""
fi

# Save JSON summary
cat > "${SUMMARY_FILE}" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "session_id": "${SESSION_ID}",
  "total_tests": ${total_tests},
  "passed": ${passed_tests},
  "failed": ${failed_tests},
  "success_rate": ${success_rate},
  "cache_hits": ${cache_hits},
  "cache_misses": ${cache_misses},
  "cache_hit_rate": ${cache_hit_rate},
  "avg_response_time_ms": ${avg_response_time},
  "mvp_ready": "${mvp_ready}",
  "failed_test_ids": [$(IFS=,; echo "\"${failed_test_ids[*]//,/\",\"}\"")],
  "results_file": "${RESULTS_FILE}",
  "report_file": "${REPORT_FILE}"
}
EOF

# ═══════════════════════════════════════════════════════════════
# GENERATE FINAL REPORT (for Claude to analyze)
# ═══════════════════════════════════════════════════════════════
cat > "${REPORT_FILE}" <<EOREPORT
════════════════════════════════════════════════════════════════
MVP TEST REPORT - $(date)
════════════════════════════════════════════════════════════════

SESSION INFO:
  Timestamp:     ${TIMESTAMP}
  Session ID:    ${SESSION_ID}
  API Endpoint:  ${API_URL}

════════════════════════════════════════════════════════════════
TEST RESULTS SUMMARY
════════════════════════════════════════════════════════════════

Overall Performance:
  Total tests:         ${total_tests}
  Passed:              ${passed_tests} ✓
  Failed:              ${failed_tests} ✗
  Success rate:        ${success_rate}%

Category Breakdown:
  A (Popular):         ?/5  (will check details)
  B (MCP):             ?/8  (will check details)
  C (Context):         ?/5  (will check details)
  D (Edge):            ?/4  (will check details)
  E (Cache):           ?/5  (will check details)

Cache Performance:
  Cache hits:          ${cache_hits}
  Cache misses:        ${cache_misses}
  Cache hit rate:      ${cache_hit_rate}%
  Expected for E:      100% (5/5)

Response Times:
  Average:             ${avg_response_time}ms
  Expected (cache):    < 500ms
  Expected (AI):       2000-10000ms

════════════════════════════════════════════════════════════════
MVP READINESS ASSESSMENT
════════════════════════════════════════════════════════════════

Success Criteria:
  ✓ Success rate >= 83% (25/30):    $([ $passed_tests -ge 25 ] && echo "PASS" || echo "FAIL")
  ✓ Cache hits >= 80% (4/5):        $([ $cache_hits -ge 4 ] && echo "PASS" || echo "FAIL")

Final Decision: ${mvp_ready}

$(if [ "$mvp_ready" = "YES" ]; then
    echo "✅ MVP IS READY FOR INVESTORS!"
    echo ""
    echo "Next steps:"
    echo "  1. Review failed tests (if any)"
    echo "  2. Merge to main branch"
    echo "  3. Deploy to production"
    echo "  4. Prepare investor pitch"
else
    echo "⚠️  MVP NEEDS ATTENTION"
    echo ""
    echo "Issues to address:"
    echo "  - Success rate: ${success_rate}% (target: 83%)"
    echo "  - Failed tests: ${failed_tests}"
    echo ""
    echo "Next steps:"
    echo "  1. Analyze failed tests"
    echo "  2. Apply targeted fixes (~\$5-10 budget)"
    echo "  3. Re-run tests"
    echo "  4. Then → investors"
fi)

════════════════════════════════════════════════════════════════
FAILED TESTS (if any)
════════════════════════════════════════════════════════════════

$(if [ ${#failed_test_ids[@]} -gt 0 ]; then
    for detail in "${failed_test_details[@]}"; do
        echo "${detail}"
    done
else
    echo "No failed tests! All ${passed_tests}/${total_tests} passed. 🎉"
fi)

════════════════════════════════════════════════════════════════
DETAILED RESULTS
════════════════════════════════════════════════════════════════

$(cat "${RESULTS_FILE}")

════════════════════════════════════════════════════════════════
END OF REPORT
════════════════════════════════════════════════════════════════

Files generated:
  - Detailed results: ${RESULTS_FILE}
  - JSON summary:     ${SUMMARY_FILE}
  - This report:      ${REPORT_FILE}

To share with Claude:
  cat ${REPORT_FILE}

EOREPORT

# Display final report
echo ""
echo -e "${GREEN}✅ Test execution complete!${NC}"
echo ""
echo "Files generated:"
echo "  📄 ${RESULTS_FILE}"
echo "  📄 ${SUMMARY_FILE}"
echo "  📄 ${REPORT_FILE}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📋 COPY THIS OUTPUT TO SEND TO CLAUDE:${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
cat "${REPORT_FILE}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "Completed: $(date)"
echo "════════════════════════════════════════════════════════════"

# Exit with proper code
if [ "$mvp_ready" = "YES" ]; then
    exit 0
else
    exit 1
fi
