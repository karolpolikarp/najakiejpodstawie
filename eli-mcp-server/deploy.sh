#!/bin/bash
# Deploy ELI MCP Server to Deno Deploy
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying ELI MCP Server to Deno Deploy..."

# Check if deployctl is installed
if ! command -v deployctl &> /dev/null; then
    echo "📦 Installing deployctl..."
    deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
fi

# Deploy
echo "🌍 Deploying to production..."
deployctl deploy \
  --project=eli-mcp-prod \
  --prod \
  --include=src/ \
  --exclude=node_modules,test-*.ts \
  src/server.ts

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the deployment URL (e.g., https://eli-mcp-prod.deno.dev)"
echo "2. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets"
echo "3. Set ELI_MCP_URL to your deployment URL"
echo "4. Test: curl https://YOUR-URL/health"
echo ""
