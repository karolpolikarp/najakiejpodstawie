#!/bin/bash
# Skrypt do sprawdzenia i naprawy problemu z git branch na produkcji

echo "🔍 DIAGNOSTYKA GIT BRANCH"
echo ""
echo "=== 1. Sprawdź obecny branch ==="
git branch
echo ""

echo "=== 2. Sprawdź ostatni commit ==="
git log --oneline -1
echo ""

echo "=== 3. Sprawdź czy jest moja poprawka ==="
if grep -q "Fixed PDF extraction errors in article markers" eli-mcp-server/src/tools.ts; then
    echo "✅ POPRAWKA JEST W KODZIE!"
else
    echo "❌ POPRAWKI BRAK W KODZIE!"
fi
echo ""

echo "=== 4. Rozwiązanie ==="
echo "Jeśli poprawki brak, wykonaj:"
echo ""
echo "  git fetch origin"
echo "  git checkout claude/fix-article-search-parsing-011CUz2evNYUCUXbfAue6APJ"
echo "  git pull origin claude/fix-article-search-parsing-011CUz2evNYUCUXbfAue6APJ"
echo ""
echo "Potem restart:"
echo "  sudo systemctl stop eli-mcp"
echo "  sudo rm -rf ~/.cache/deno"
echo "  sudo systemctl start eli-mcp"
