#!/bin/bash

# Test skrypt do sprawdzenia czy ELI API działa z Twojego domowego IP
# Uruchom na Raspberry Pi: bash test-from-home.sh

echo "🧪 Testing ELI API access from your home IP..."
echo "================================================"
echo ""

# Pokaż obecne IP
echo "📍 Your public IP:"
curl -s https://api.ipify.org
echo ""
echo ""

# Test 1: List publishers
echo "Test 1: GET /eli/acts (list publishers)"
echo "----------------------------------------"
response=$(curl -s -o /tmp/eli-test1.txt -w "%{http_code}" https://api.sejm.gov.pl/eli/acts)
echo "Status code: $response"
if [ "$response" = "200" ]; then
    echo "✅ SUCCESS - API is accessible!"
    head -c 200 /tmp/eli-test1.txt
    echo "..."
else
    echo "❌ FAILED - Response:"
    cat /tmp/eli-test1.txt
fi
echo ""
echo ""

# Test 2: Search
echo "Test 2: GET /eli/acts/search?title=konstytucja&limit=1"
echo "-------------------------------------------------------"
response=$(curl -s -o /tmp/eli-test2.txt -w "%{http_code}" "https://api.sejm.gov.pl/eli/acts/search?title=konstytucja&limit=1")
echo "Status code: $response"
if [ "$response" = "200" ]; then
    echo "✅ SUCCESS - Search works!"
    head -c 300 /tmp/eli-test2.txt
    echo "..."
else
    echo "❌ FAILED - Response:"
    cat /tmp/eli-test2.txt
fi
echo ""
echo ""

# Test 3: Specific act (Kodeks cywilny)
echo "Test 3: GET /eli/acts/DU/1964/16 (Kodeks cywilny)"
echo "-------------------------------------------------"
response=$(curl -s -o /tmp/eli-test3.txt -w "%{http_code}" https://api.sejm.gov.pl/eli/acts/DU/1964/16)
echo "Status code: $response"
if [ "$response" = "200" ]; then
    echo "✅ SUCCESS - Act details work!"
    head -c 200 /tmp/eli-test3.txt
    echo "..."
else
    echo "❌ FAILED - Response:"
    cat /tmp/eli-test3.txt
fi
echo ""
echo ""

# Test 4: HTML text
echo "Test 4: GET /eli/acts/DU/1964/16/text.html (KC - HTML)"
echo "------------------------------------------------------"
response=$(curl -s -o /tmp/eli-test4.txt -w "%{http_code}" https://api.sejm.gov.pl/eli/acts/DU/1964/16/text.html)
echo "Status code: $response"
if [ "$response" = "200" ]; then
    size=$(wc -c < /tmp/eli-test4.txt)
    echo "✅ SUCCESS - Got HTML text ($size bytes)"
else
    echo "❌ FAILED - Response:"
    cat /tmp/eli-test4.txt
fi
echo ""
echo ""

# Podsumowanie
echo "================================================"
echo "📊 SUMMARY"
echo "================================================"
echo ""
if grep -q "SUCCESS" /tmp/eli-summary.txt 2>/dev/null || [ "$response" = "200" ]; then
    echo "🎉 ŚWIETNIE! ELI API działa z Twojego domowego IP!"
    echo ""
    echo "Możesz bezpiecznie postawić MCP server na Raspberry Pi."
    echo ""
    echo "Następne kroki:"
    echo "1. Zainstaluj Deno: curl -fsSL https://deno.land/install.sh | sh"
    echo "2. Sklonuj projekt na RPi"
    echo "3. Uruchom MCP server: deno task start"
    echo "4. Skonfiguruj Cloudflare Tunnel dla HTTPS (instrukcja w DEPLOYMENT-RPI.md)"
else
    echo "⚠️ API nie działa z Twojego IP"
    echo ""
    echo "Możliwe przyczyny:"
    echo "1. Twój ISP jest zablokowany (mało prawdopodobne)"
    echo "2. Problem sieciowy (spróbuj ponownie)"
    echo "3. API sejm.gov.pl jest chwilowo niedostępne"
    echo ""
    echo "Rozwiązania:"
    echo "- Spróbuj przez kilka minut"
    echo "- Użyj VPN z polskim IP"
    echo "- Rozważ VPS (Mikrus FROG lub OVH)"
fi
echo ""
