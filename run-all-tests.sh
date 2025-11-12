#!/bin/bash

# MVP Test Suite - SSE Stream Compatible
# Properly handles Server-Sent Events responses

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="${SUPABASE_URL}/functions/v1/legal-assistant"
ANON_KEY="${SUPABASE_ANON_KEY}"
OUTPUT_DIR="./test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="test-session-${TIMESTAMP}"
RESULTS_FILE="${OUTPUT_DIR}/results_${TIMESTAMP}.txt"
SUMMARY_FILE="${OUTPUT_DIR}/summary_${TIMESTAMP}.json"
REPORT_FILE="${OUTPUT_DIR}/FINAL_REPORT_${TIMESTAMP}.txt"

mkdir -p "${OUTPUT_DIR}"

echo "════════════════════════════════════════════════════════════"
echo "🧪 AUTOMATED MVP TEST SUITE (SSE Compatible)"
echo "════════════════════════════════════════════════════════════"
echo "Started: $(date)"
echo "Session: ${SESSION_ID}"
echo "════════════════════════════════════════════════════════════"
echo ""

# Counters
total_tests=0
passed_tests=0
failed_tests=0
cache_hits=0
cache_misses=0
total_response_time=0

declare -a failed_test_ids=()
declare -a failed_test_details=()

# Call API with SSE handling
call_api() {
    local question="$1"
    local category="$2"
    local test_id="$3"

    echo -n "[$test_id] ${category}: "

    start_time=$(date +%s%3N)

    # Create temp file for response
    local temp_file=$(mktemp)

    # Call API with timeout, stop after message_stop event
    timeout 30s bash -c "
        curl -s -N \
            -X POST '${API_URL}' \
            -H 'Content-Type: application/json' \
            -H 'apikey: ${ANON_KEY}' \
            -H 'Authorization: Bearer ${ANON_KEY}' \
            -d '{\"message\":\"${question}\",\"sessionId\":\"${SESSION_ID}\",\"messageId\":\"${test_id}\",\"usePremiumModel\":false}' \
            2>&1 | while IFS= read -r line; do
                echo \"\$line\" >> '${temp_file}'
                # Stop after message_stop event
                if echo \"\$line\" | grep -q 'message_stop'; then
                    break
                fi
            done
    " || {
        end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        echo -e "${RED}TIMEOUT${NC} (${response_time}ms)"
        ((total_tests++))
        ((failed_tests++))
        failed_test_ids+=("${test_id}")
        failed_test_details+=("${test_id}: TIMEOUT after 30s")
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:40}... | TIMEOUT | ${response_time}ms | N/A | timeout" >> "${RESULTS_FILE}"
        rm -f "${temp_file}"
        return 1
    }

    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    total_response_time=$((total_response_time + response_time))

    # Check if response contains valid SSE data
    if grep -q "message_stop" "${temp_file}"; then
        # Success - got complete stream
        cache_status="MISS"
        if grep -q "X-Cache-Status: HIT" "${temp_file}"; then
            cache_status="HIT"
            ((cache_hits++))
        else
            ((cache_misses++))
        fi

        echo -e "${GREEN}PASS${NC} (${response_time}ms, cache: ${cache_status})"
        ((total_tests++))
        ((passed_tests++))
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:40}... | PASS | ${response_time}ms | ${cache_status} | ok" >> "${RESULTS_FILE}"
        rm -f "${temp_file}"
        return 0
    else
        # Check for errors
        if grep -q "error" "${temp_file}"; then
            error_msg=$(grep "error" "${temp_file}" | head -1)
            echo -e "${RED}FAIL${NC} (${response_time}ms) - ${error_msg:0:50}"
        else
            echo -e "${RED}FAIL${NC} (${response_time}ms) - no valid response"
        fi

        ((total_tests++))
        ((failed_tests++))
        ((cache_misses++))
        failed_test_ids+=("${test_id}")
        failed_test_details+=("${test_id}: Invalid response")
        echo "${TIMESTAMP} | ${test_id} | ${category} | ${question:0:40}... | FAIL | ${response_time}ms | MISS | error" >> "${RESULTS_FILE}"
        rm -f "${temp_file}"
        return 1
    fi
}

# Initialize results
echo "TIMESTAMP | TEST_ID | CATEGORY | QUESTION | STATUS | TIME | CACHE | INFO" > "${RESULTS_FILE}"
echo "══════════════════════════════════════════════════════════════════════════════════" >> "${RESULTS_FILE}"

sleep_between() {
    echo ""
    echo "⏳ Wait 3s..."
    sleep 3
    echo ""
}

# CATEGORY A
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY A: Popular Questions (5 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "Ile punktów karnych można mieć maksymalnie?" "A-Popular" "A1"
call_api "Kiedy przedawnia się roszczenie?" "A-Popular" "A2"
call_api "Ile dni urlopu się należy?" "A-Popular" "A3"
call_api "Ile wynosi minimalne wynagrodzenie?" "A-Popular" "A4"
call_api "Czy wynajmujący może żądać kaucji?" "A-Popular" "A5"

sleep_between

# CATEGORY B
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY B: Specific Articles (8 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "art 118 kc" "B-MCP" "B1"
call_api "art 152 kp" "B-MCP" "B2"
call_api "art 25 kk" "B-MCP" "B3"
call_api "art 103 prawo o ruchu drogowym" "B-MCP" "B4"
call_api "art 30 konstytucji" "B-MCP" "B5"
call_api "art 187 kpc" "B-MCP" "B6"
call_api "art 23 kro" "B-MCP" "B7"
call_api "art 10 ustawa o prawach konsumenta" "B-MCP" "B8"

sleep_between

# CATEGORY C
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY C: General Questions (5 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "Co to jest obrona konieczna?" "C-Context" "C1"
call_api "Jak rozwiązać umowę o pracę?" "C-Context" "C2"
call_api "Ile godzin tygodniowo można pracować?" "C-Context" "C3"
call_api "Jakie mam prawa przy windykacji długu?" "C-Context" "C4"
call_api "Czy można pozwać za zniesławienie w internecie?" "C-Context" "C5"

sleep_between

# CATEGORY D
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY D: Edge Cases (4 tests)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "art 207 kpc" "D-Edge" "D1" || true
call_api "art 99999 kc" "D-Edge" "D2" || true
call_api "art 10 ustawa o kotach i psach" "D-Edge" "D3" || true
call_api "Jaka jest najlepsza pizza?" "D-Edge" "D4" || true

sleep_between

# CATEGORY E
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📌 CATEGORY E: Cache Validation (5 tests - should be HIT)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

call_api "Ile punktów karnych można mieć maksymalnie?" "E-Cache" "E1"
call_api "Kiedy przedawnia się roszczenie?" "E-Cache" "E2"
call_api "Ile dni urlopu się należy?" "E-Cache" "E3"
call_api "Ile wynosi minimalne wynagrodzenie?" "E-Cache" "E4"
call_api "Czy wynajmujący może żądać kaucji?" "E-Cache" "E5"

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Calculate stats
success_rate=$(awk "BEGIN {printf \"%.1f\", (${passed_tests}/${total_tests})*100}")
cache_hit_rate=$(awk "BEGIN {printf \"%.1f\", (${cache_hits}/(${cache_hits}+${cache_misses}))*100}")
avg_response_time=$(awk "BEGIN {printf \"%.0f\", ${total_response_time}/${total_tests}}")

mvp_ready="NO"
if (( passed_tests >= 23 )) && (( cache_hits >= 4 )); then
    mvp_ready="YES"
fi

# SUMMARY
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 FINAL TEST SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Results:"
echo "  Total:        ${total_tests}"
echo -e "  Passed:       ${GREEN}${passed_tests}${NC}"
echo -e "  Failed:       ${RED}${failed_tests}${NC}"
echo "  Success:      ${success_rate}%"
echo ""
echo "Cache:"
echo "  Hits:         ${cache_hits}"
echo "  Misses:       ${cache_misses}"
echo "  Hit rate:     ${cache_hit_rate}%"
echo "  Avg time:     ${avg_response_time}ms"
echo ""
echo "MVP Status:"
if [ "$mvp_ready" = "YES" ]; then
    echo -e "  ${GREEN}✅ READY FOR INVESTORS!${NC}"
else
    echo -e "  ${YELLOW}⚠️  NEEDS REVIEW${NC}"
fi
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

if [ ${#failed_test_ids[@]} -gt 0 ]; then
    echo -e "${YELLOW}Failed tests:${NC}"
    for detail in "${failed_test_details[@]}"; do
        echo "  - ${detail}"
    done
    echo ""
fi

# JSON summary
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
  "mvp_ready": "${mvp_ready}"
}
EOF

# Final report
cat > "${REPORT_FILE}" <<EOREPORT
════════════════════════════════════════════════════════════
MVP TEST REPORT - $(date)
════════════════════════════════════════════════════════════

SESSION: ${SESSION_ID}

RESULTS:
  Total tests:    ${total_tests}
  Passed:         ${passed_tests}
  Failed:         ${failed_tests}
  Success rate:   ${success_rate}%

CACHE:
  Hits:           ${cache_hits}
  Misses:         ${cache_misses}
  Hit rate:       ${cache_hit_rate}%

PERFORMANCE:
  Avg time:       ${avg_response_time}ms

MVP READY: ${mvp_ready}

$(if [ "$mvp_ready" = "YES" ]; then
    echo "✅ MVP IS READY!"
else
    echo "⚠️  Needs fixes (target: 23/27 passed, 4/5 cache hits)"
fi)

FAILED TESTS:
$(if [ ${#failed_test_ids[@]} -gt 0 ]; then
    for detail in "${failed_test_details[@]}"; do
        echo "${detail}"
    done
else
    echo "None - all tests passed! 🎉"
fi)

DETAILED RESULTS:
$(cat "${RESULTS_FILE}")

════════════════════════════════════════════════════════════
Files: ${RESULTS_FILE}, ${SUMMARY_FILE}, ${REPORT_FILE}
════════════════════════════════════════════════════════════
EOREPORT

echo -e "${GREEN}✅ Tests complete!${NC}"
echo ""
echo "Files:"
echo "  ${RESULTS_FILE}"
echo "  ${SUMMARY_FILE}"
echo "  ${REPORT_FILE}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📋 FINAL REPORT (copy to send to Claude):${NC}"
echo "════════════════════════════════════════════════════════════"
cat "${REPORT_FILE}"
echo "════════════════════════════════════════════════════════════"

[ "$mvp_ready" = "YES" ] && exit 0 || exit 1
