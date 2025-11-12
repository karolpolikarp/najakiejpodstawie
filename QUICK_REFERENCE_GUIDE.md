# JakiePrawo.pl - Quick Reference Guide
## For Technical Teams & Developers

**Last Updated:** November 12, 2025

---

## Quick Start

### Access the Application
- **Live Site:** https://jakieprawo.pl
- **Repository:** https://github.com/karolpolikarp/najakiejpodstawie
- **Tech Stack:** React 18 + TypeScript + Supabase + Claude AI

### Development Setup
```bash
# Clone and setup
git clone https://github.com/karolpolikarp/najakiejpodstawie.git
cd najakiejpodstawie

# Install dependencies
npm install

# Development server (Vite)
npm run dev          # Opens http://localhost:5173

# Testing
npm test             # Run unit tests with Vitest
npm run test:coverage # Generate coverage report

# Build for production
npm run build        # Creates optimized bundle in dist/
```

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite)                      │
│  - Components: 20+                               │
│  - Pages: 7 (main, landing, admin, etc.)         │
│  - State: Zustand                                │
│  - Features: OCR, streaming chat, file upload    │
└──────────────────┬───────────────────────────────┘
                   │ HTTPS
        ┌──────────▼──────────────────────┐
        │  Supabase Edge Functions        │
        │  - legal-assistant (1,161 LOC)  │
        │  - get-questions (analytics)    │
        │  - submit-feedback              │
        └──────────────────────────────────┘
                   │
        ┌──────────┴─────────────────┐
        │                            │
   ┌────▼─────────┐     ┌──────────▼──────┐
   │ PostgreSQL   │     │ ELI MCP Server   │
   │ (Supabase)   │     │ (Deno + API)     │
   └──────────────┘     └──────────────────┘
```

---

## Key Files & Their Purposes

### Frontend (src/)

| File | LOC | Purpose |
|------|-----|---------|
| `pages/Index.tsx` | 250+ | Main chat interface |
| `components/FileUpload.tsx` | 200+ | PDF/DOC/image handling + OCR |
| `components/ChatMessage.tsx` | 150+ | Message rendering |
| `hooks/useChatAPI.ts` | 100+ | API communication |
| `services/streamingService.ts` | 260 | SSE streaming handler |
| `store/chatStore.ts` | 120 | Zustand state management |
| `lib/pii-detector.ts` | 80 | Sensitive data detection |

### Backend (supabase/functions/)

| File | LOC | Purpose |
|------|-----|---------|
| `legal-assistant/index.ts` | 1,161 | Main AI endpoint |
| `legal-assistant/eli-tools.ts` | 752 | MCP integration |
| `legal-assistant/legal-context.ts` | 891 | Topic knowledge base |
| `legal-assistant/tool-calling.ts` | 281 | Claude tool definitions |
| `get-questions/index.ts` | 100+ | Analytics dashboard |

### Microservice (eli-mcp-server/)

| File | LOC | Purpose |
|------|-----|---------|
| `server.ts` | 150+ | HTTP API endpoint |
| `eli-client.ts` | 350+ | ISAP API wrapper |
| `act-resolver.ts` | 750+ | PDF parsing & cleaning |
| `tools.ts` | 1,200+ | Tool definitions |

---

## Technology Stack Summary

### Frontend Dependencies (22 total)
```
Core:           React 18.3, React-DOM 18.3, React-Router 6.30
State:          Zustand 5.0
UI:             Tailwind CSS 3.4, shadcn/ui, Radix UI
Processing:     Tesseract.js 6.0, PDF.js 5.4, Mammoth 1.11
Notifications:  Sonner 1.7
Animations:     Framer Motion 12.23
Utilities:      Zod 3.25, Lucide Icons
```

### Backend Runtime
```
Platform:       Supabase Edge Functions (Deno)
Database:       PostgreSQL 13.0.5
Language:       TypeScript (Deno runtime)
External APIs:  Anthropic Claude, Sejm API
```

### DevOps & CI/CD
```
Version Control:    GitHub
CI/CD:              GitHub Actions
Frontend Deploy:    Vercel (automatic)
Backend Deploy:     Supabase (automatic)
MCP Server:         Raspberry Pi / Self-hosted
```

---

## API Endpoints Quick Reference

### Main Chat Endpoint
```
POST /functions/v1/legal-assistant

Request:
{
  "message": "art 10 kodeks pracy",
  "fileContext": "Extracted text from PDF or null",
  "sessionId": "uuid",
  "messageId": "uuid",
  "usePremiumModel": false
}

Response: SSE stream
  event: data
  data: {"type": "content_block_delta", "delta": {"text": "..."}}
  ...
  data: {"type": "message_end"}
```

### Analytics Endpoint
```
POST /functions/v1/get-questions

Request:
{
  "limit": 20,
  "offset": 0,
  "search": "optional_query"
}

Response:
{
  "data": [...],
  "pagination": {"total": 100},
  "statistics": {...}
}
```

### Feedback Endpoint
```
POST /functions/v1/submit-feedback

Request:
{
  "message_id": "uuid",
  "feedback_type": "positive|negative",
  "question": "...",
  "response": "..."
}

Response: { success: true }
```

---

## Database Schema (PostgreSQL)

### user_questions
```sql
CREATE TABLE user_questions (
  id uuid PRIMARY KEY,
  question text,
  answer text,
  question_hash text,             -- SHA-256 for caching
  has_file_context boolean,
  file_name text,
  session_id text,                -- Anonymous session ID
  user_agent text,
  response_time_ms integer,
  created_at timestamptz
);

-- Key Indexes:
idx_user_questions_created_at    -- Sorted by date
idx_user_questions_session_id    -- Session tracking
idx_user_questions_hash          -- Cache lookup
```

### rate_limits
```sql
CREATE TABLE rate_limits (
  ip_address text UNIQUE,
  request_count integer,
  window_start timestamptz,
  created_at timestamptz
);
```

---

## Configuration Files

### Environment Variables (.env)
```
# Frontend (in .env.example)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_APP_PASSWORD=lex              # App access password
VITE_PREMIUM_PASSWORD=power        # Premium unlock password

# Backend (in Supabase > Settings > Secrets)
ANTHROPIC_API_KEY=sk-ant-...
ELI_MCP_URL=http://localhost:8080
ELI_API_KEY=secret-key
ALLOWED_ORIGINS=https://jakieprawo.pl,https://www.jakieprawo.pl
```

### Build Configs
```
vite.config.ts         - Vite + React plugin setup
tsconfig.json          - TypeScript strict mode enabled
tailwind.config.ts     - Custom colors, animations, shadows
vitest.config.ts       - Test environment (jsdom)
eslint.config.js       - Code style rules
```

---

## Development Workflow

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# Edit files in src/ or supabase/functions/

# 3. Test locally
npm run dev          # Frontend
npm test             # Run tests

# 4. Commit & push
git add .
git commit -m "feat: description"
git push origin feature/my-feature

# 5. Create PR on GitHub
# - CI tests run automatically
# - Coverage report generated
# - Deploy preview generated

# 6. After merge to main
# - Frontend auto-deploys to Vercel
# - Backend auto-deploys to Supabase
# - Database migrations auto-run
```

### Testing
```bash
npm test                    # Watch mode
npm run test:run          # Run once
npm run test:coverage     # With coverage report
npm run test:ui           # Interactive UI
```

---

## Common Debugging

### Frontend Issues

**Problem:** Messages not streaming
```
Check:
1. streamingService.ts - verify SSE parsing
2. Browser DevTools Network tab - check EventSource
3. Supabase Edge Function logs - check for errors
```

**Problem:** File upload fails
```
Check:
1. FileUpload.tsx - file type/size validation
2. OCR: Browser console for Tesseract errors
3. Check file size (max 5MB)
```

### Backend Issues

**Problem:** AI responses are slow
```
Check:
1. ELI MCP server availability - test /health endpoint
2. Anthropic API rate limits (50k tokens/min)
3. Check Cache hit rate (should be 20-30%)
```

**Problem:** Migrations fail on deploy
```
Check:
1. SUPABASE_DB_PASSWORD correct in GitHub secrets
2. Check Supabase project status (not in "preparing")
3. Review migration SQL for syntax errors
```

---

## Monitoring & Observability

### Key Metrics to Track

**Performance:**
```
- Page load time (target: < 3s)
- Time to first response (target: 5-10s)
- Streaming response time (p95: < 15s)
- OCR processing (target: 2-5s per page)
```

**Errors:**
```
- API error rate (target: < 0.5%)
- Timeout count (rate limit: monitor threshold)
- OCR failures (target: < 2%)
```

**Usage:**
```
- Queries per day
- Document uploads per day
- File vs. non-file question ratio
- Premium model usage %
```

---

## Important Constants

### Application Limits
```
FILE_UPLOAD:
- Max size: 5 MB
- Max content: 50,000 chars
- Allowed: PDF, DOCX, JPG, PNG

OCR:
- Min text to trigger: 50 chars
- Languages: Polish + English

API:
- Max retries: 3
- Rate limit: IP-based
- Cache TTL: 7 days
- Timeout: 30 seconds
```

### AI Models
```
Default: claude-haiku-4-5-20251001
  - Cost: €0.008 per 1M input tokens
  - Speed: Fast
  - Context: 200k tokens

Premium: claude-sonnet-4-20250514
  - Cost: €0.03 per 1M input tokens
  - Speed: Slower, more capable
  - Context: 200k tokens
```

### ELI MCP
```
Timeout Strategy:
- First attempt: 6 seconds
- Retry 1: 10 seconds
- Retry 2: 15 seconds
- Max retries: 3

Cache:
- Type: LRU in-memory
- Size: 200 acts
- TTL: 1 hour
```

---

## Performance Optimization Tips

### Frontend
```
1. Use React.lazy() for code splitting ✅ Done
2. Memoize expensive components - TODO
3. Lazy-load PDF.js worker - TODO
4. Optimize images with WebP - TODO
5. Implement request deduplication - TODO
```

### Backend
```
1. Cache responses (7-day TTL) ✅ Done
2. Rate limit to prevent abuse ✅ Done
3. Truncate articles to 3-5k chars ✅ Done
4. Detect legal context to limit articles ✅ Done
5. Add database query indexes ✅ Done
```

---

## Security Checklist

### Frontend
- ✅ PII detection before sending to API
- ✅ GDPR consent banner
- ✅ Cookie consent tracking
- ❌ JWT token implementation (TODO)
- ❌ Proper session management (TODO)

### Backend
- ✅ Row Level Security (RLS) enabled
- ✅ CORS whitelisting
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ❌ HTTPS enforcement (Vercel/Supabase handle)
- ❌ API key rotation policy (TODO)

### Database
- ✅ Anonymous session tracking (no user IDs)
- ✅ Data retention policy
- ✅ Automatic backups
- ❌ Data deletion workflow (TODO)
- ❌ Export functionality (TODO)

---

## Release Checklist

### Before Deploying
```
[ ] Run npm test -- --run
[ ] Run npm run build (no errors)
[ ] Check environment variables in .env
[ ] Review code for console.log() statements
[ ] Verify CORS origins are correct
[ ] Test with real Supabase project
[ ] Check rate limit thresholds
```

### After Deploying
```
[ ] Verify Vercel deployment succeeded
[ ] Verify Supabase functions deployed
[ ] Check API health endpoint: /health
[ ] Monitor error logs (first 30 minutes)
[ ] Test critical user flows
[ ] Check analytics dashboard
```

---

## Useful Commands

### Git
```bash
git status                          # Check changes
git log --oneline -10              # Recent commits
git diff                           # Unstaged changes
git diff --staged                  # Staged changes
```

### Node/npm
```bash
npm install                         # Install deps
npm install package-name           # Add package
npm ci                            # Clean install (CI)
npm run build                      # Production build
npm run lint                       # Check code style
```

### Supabase CLI
```bash
supabase db pull                   # Download schema
supabase db push                   # Upload migrations
supabase functions deploy          # Deploy functions
supabase logs --function=name      # View logs
```

---

## Team Contacts & Resources

**Repository:** https://github.com/karolpolikarp/najakiejpodstawie  
**Issues:** GitHub Issues for bugs and feature requests  
**Documentation:** See COMPREHENSIVE_TECHNICAL_DOCUMENTATION.md  

**External APIs:**
- Anthropic: https://console.anthropic.com
- Supabase: https://app.supabase.com
- Sejm API: https://api.sejm.gov.pl/eli

---

## Frequently Asked Questions

**Q: How do I add a new legal topic?**
A: Edit `supabase/functions/legal-assistant/legal-context.ts` and add to `LEGAL_CONTEXT` object with keywords and article mappings.

**Q: How do I increase rate limits?**
A: Edit `rate-limiter.ts` thresholds or implement database-based limiting.

**Q: How do I optimize OCR accuracy?**
A: Use Tesseract language training data, increase image resolution, or implement preprocessing.

**Q: How do I monitor the ELI MCP server?**
A: Check `/health` endpoint regularly, monitor cache hit rate, watch for timeouts.

**Q: How do I add authentication?**
A: Implement JWT tokens with Supabase Auth (supports Google, GitHub, email/password).

---

**Version:** 1.0  
**Last Updated:** November 12, 2025  
**Status:** Production Ready

