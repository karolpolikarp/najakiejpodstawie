#!/bin/bash

echo "🧪 Testing article extraction fix..."
echo ""

# Test 1: Art. 10 KC
echo "Test 1: Art. 10 KC (Pełnoletność)"
curl -s -X POST http://localhost:8080/tools/get_article \
  -H "Authorization: Bearer dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"actCode":"kc","articleNumber":"10"}' | jq -r '.article.text' | head -5

echo ""
echo "---"
echo ""

# Test 2: Art. 103 KC
echo "Test 2: Art. 103 KC (Pełnomocnictwo)"
curl -s -X POST http://localhost:8080/tools/get_article \
  -H "Authorization: Bearer dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"actCode":"kc","articleNumber":"103"}' | jq -r '.article.text' | head -5

echo ""
