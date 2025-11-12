#!/bin/bash

# Quick single test to verify API works

export SUPABASE_URL="https://topujvufxlywazazgujz.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcHVqdnVmeGx5d2F6YXpndWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNjQ0NzcsImV4cCI6MjA1MTc0MDQ3N30.5xjvPBDCNqx6B6ufLXSQwbHVRhcRxgjKy8f7ufTuY5M"

API_URL="${SUPABASE_URL}/functions/v1/legal-assistant"

echo "🧪 Quick API Test"
echo "=================="
echo "API: ${API_URL}"
echo ""
echo "Sending test question..."
echo ""

temp_file=$(mktemp)

timeout 30s curl -s -N \
    -X POST "${API_URL}" \
    -H "Content-Type: application/json" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -d '{"message":"Ile punktów karnych można mieć maksymalnie?","sessionId":"quick-test","messageId":"test1","usePremiumModel":false}' \
    2>&1 | while IFS= read -r line; do
        echo "$line" >> "${temp_file}"
        # Stop after message_stop event
        if echo "$line" | grep -q 'message_stop'; then
            break
        fi
    done

echo "Response received:"
echo "=================="
if grep -q "message_stop" "${temp_file}"; then
    echo "✅ API działa! Otrzymano pełną odpowiedź SSE."
    echo ""
    echo "First 30 lines of response:"
    head -30 "${temp_file}"
else
    echo "❌ Problem z API - nie otrzymano message_stop"
    echo ""
    echo "Received:"
    cat "${temp_file}"
fi

rm -f "${temp_file}"
