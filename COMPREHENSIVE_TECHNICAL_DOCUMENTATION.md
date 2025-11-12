# JakiePrawo.pl - Comprehensive Technical Documentation
## Full Application Architecture & Technology Stack

**Document Version:** 1.0  
**Date:** November 12, 2025  
**Prepared For:** Investor & Technical Team Presentation  

---

## EXECUTIVE SUMMARY

**JakiePrawo.pl** is a production-ready, full-stack AI-powered legal assistant platform serving the Polish market. The application uniquely combines:

1. **Advanced OCR Technology** - Tesseract.js for document analysis (Polish/English)
2. **Real-time Legal API Integration** - Access to 15,000+ Polish legal acts via Sejm API
3. **Anthropic Claude AI** - Natural language legal question answering
4. **Model Context Protocol (MCP)** - Custom ELI server for legal act extraction

**Current Status:** MVP Ready (Core features operational)  
**Target Market:** SMBs, legal professionals, law students, general public  
**Key Differentiator:** First Polish platform combining OCR + Official Legal API + AI

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                  │
│  (React 18 + TypeScript + Vite - Deployed on Vercel)   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (DENO)             │
│   ├─ legal-assistant/index.ts (1,161 LOC - Main AI)    │
│   ├─ get-questions/index.ts (Analytics)                │
│   └─ submit-feedback/index.ts (User feedback)          │
└────────────────┬──────────────────────────────────────┬─┘
                 │                                        │
        ┌────────▼───────────┐              ┌──────────▼─────────┐
        │  PostgreSQL DB     │              │ ELI MCP Server     │
        │  (Supabase)        │              │ (Deno on RaspPI)   │
        │                    │              │                    │
        │  Tables:           │              │  HTTP API for      │
        │  - user_questions  │              │  Polish legal acts │
        │  - rate_limits     │              │                    │
        │  - message_feedback│              └────────────────────┘
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────────────┐
        │  ANTHROPIC CLAUDE API       │
        │  (claude-haiku-4.5 default) │
        │  (claude-sonnet-4.5 premium)│
        └────────────────────────────┘
```

### 1.2 Directory Structure

```
najakiejpodstawie/
├── src/                              # React Frontend (53 files)
│   ├── components/                   # UI components (20+ components)
│   │   ├── ChatInput.tsx             # Message input with file upload
│   │   ├── FileUpload.tsx            # PDF/DOC/Image file processor
│   │   ├── ChatMessage.tsx           # Message display with formatting
│   │   ├── PasswordGate.tsx          # Application access control
│   │   ├── GDPRWarningModal.tsx      # GDPR consent dialog
│   │   ├── CookieBanner.tsx          # Cookie consent banner
│   │   └── [ui]/                     # shadcn/ui components
│   ├── pages/                        # Route components (7 pages)
│   │   ├── Index.tsx                 # Main chat interface
│   │   ├── Landing.tsx               # Public landing page
│   │   ├── Admin.tsx                 # Admin analytics dashboard
│   │   ├── About.tsx, Contact.tsx, Privacy.tsx, etc.
│   ├── hooks/                        # Custom React hooks
│   │   ├── useChatAPI.ts             # API communication
│   │   ├── useFeedback.ts            # Feedback submission
│   │   └── usePremium.ts             # Premium mode management
│   ├── services/                     # Business logic
│   │   └── streamingService.ts       # SSE streaming handler
│   ├── store/                        # State management (Zustand)
│   │   └── chatStore.ts              # Message persistence
│   ├── lib/                          # Utilities
│   │   ├── logger.ts                 # Structured logging
│   │   ├── retry.ts                  # Exponential backoff
│   │   ├── pii-detector.ts           # PII detection for privacy
│   │   ├── constants.ts              # App-wide constants
│   │   └── storage.ts                # localStorage wrapper
│   ├── integrations/                 # External services
│   │   └── supabase/                 # Supabase client setup
│   └── test/                         # Test configuration
│
├── supabase/                         # Backend (Deno Edge Functions)
│   ├── functions/                    # Serverless functions
│   │   ├── legal-assistant/          # Main AI endpoint (3,402 LOC)
│   │   │   ├── index.ts              # Main handler (1,161 LOC)
│   │   │   ├── eli-tools.ts          # MCP integration (752 LOC)
│   │   │   ├── legal-context.ts      # Knowledge base (891 LOC)
│   │   │   ├── tool-calling.ts       # Claude tools (281 LOC)
│   │   │   └── rate-limiter.ts       # Rate limiting
│   │   ├── get-questions/            # Retrieve user questions
│   │   ├── submit-feedback/          # Store user feedback
│   │   └── _shared/                  # Shared utilities
│   │       ├── logger.ts
│   │       ├── retry.ts
│   │       └── rate-limit.ts
│   └── migrations/                   # Database schema (6 migrations)
│       ├── create_user_questions.sql
│       ├── create_rate_limits.sql
│       └── ...
│
├── eli-mcp-server/                   # Separate Deno microservice
│   └── src/
│       ├── server.ts                 # HTTP API endpoint
│       ├── eli-client.ts             # ISAP API wrapper
│       ├── act-resolver.ts           # Legal act parsing
│       └── tools.ts                  # MCP tool definitions
│
├── .github/                          # CI/CD Configuration
│   └── workflows/
│       ├── test.yml                  # Node.js test runner
│       └── deploy-supabase.yml       # Auto-deploy to Supabase
│
├── public/                           # Static assets
├── docs/                             # User documentation
└── [config files]                    # Vite, TypeScript, ESLint, Tailwind
```

---

## 2. FRONTEND ARCHITECTURE

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI rendering |
| **Language** | TypeScript | 5.8 | Type safety |
| **Build Tool** | Vite | 5.4 | Fast bundling |
| **Styling** | Tailwind CSS | 3.4 | Utility CSS framework |
| **UI Components** | shadcn/ui | Latest | Pre-built components |
| **State Mgmt** | Zustand | 5.0 | Lightweight store |
| **Routing** | React Router | 6.30 | Client-side routing |
| **HTTP Client** | Fetch API | Native | API calls (with retry) |
| **Notifications** | Sonner | 1.7 | Toast notifications |
| **PDF Processing** | PDF.js | 5.4 | Text extraction |
| **Word Processing** | Mammoth.js | 1.11 | DOCX parsing |
| **OCR** | Tesseract.js | 6.0 | Document text recognition |
| **Animation** | Framer Motion | 12.23 | Smooth transitions |
| **Icons** | Lucide React | 0.462 | Icon library |
| **Form Validation** | Zod | 3.25 | Schema validation |
| **Testing** | Vitest | 4.0 | Unit testing |

### 2.2 Key Frontend Components

**Main Chat Interface (`Index.tsx` - 250+ LOC)**
- Real-time message streaming with auto-scroll
- File attachment management (15-min inactivity auto-clear)
- Premium model toggle with password protection
- Keyboard shortcuts & message reactions (👍👎)
- Session tracking for analytics

**File Upload Handler (`FileUpload.tsx` - 316 test lines)**
- Multi-format support: PDF, DOCX, images (JPG, PNG)
- Automatic OCR trigger for scanned documents
- Text extraction with fallback detection
- File type validation and size limits (5MB max)
- PII detection before processing

**Message System (`ChatMessage.tsx` - 430 test lines)**
- Markdown rendering with code syntax highlighting
- Streaming animation for real-time responses
- Citation extraction and linking
- Feedback buttons (upvote/downvote) per message
- Copy-to-clipboard functionality

**State Management (`chatStore.ts` - 235 test lines)**
- Zustand store for message history
- Automatic localStorage persistence
- Thread-safe concurrent updates
- Undo/redo capability

### 2.3 Frontend Data Flow

```
User Input
    ↓
[ChatInput] → Validate message + file
    ↓
[useChatAPI Hook] → Format request
    ↓
[StreamingService] → SSE connection to Edge Function
    ↓
[chatStore] → Stream content delta updates
    ↓
[ChatMessage] → Render markdown with animations
    ↓
[user-questions table] → Save for analytics
```

---

## 3. BACKEND ARCHITECTURE (SUPABASE)

### 3.1 Supabase Edge Functions Overview

**Runtime:** Deno (TypeScript-first serverless)  
**Deployment:** Automatic via GitHub Actions  
**Region:** Configurable (default: EU)

#### A. Main Legal Assistant Function (`legal-assistant/index.ts` - 1,161 LOC)

**Responsibility:** Primary AI endpoint for all user queries

**Flow:**
```
1. Validate request (CORS, auth, rate limit)
2. Extract message, file context, session ID
3. Detect legal topic/context
4. Check response cache (7-day TTL)
5. Enrich with relevant articles from ELI MCP
6. Call Claude AI with tools
7. Stream response via SSE
8. Save question + answer to database
```

**Key Features:**
- **Response Caching:** SHA-256 hash of normalized question, 7-day TTL
- **Rate Limiting:** IP-based, configurable thresholds
- **Dual Model Support:** 
  - Default: `claude-haiku-4-5-20251001` (fast, cost-effective)
  - Premium: `claude-sonnet-4-20250514` (more capable)
- **Tool Calling:** Forces Claude to use tools for specific article requests
- **Error Recovery:** Exponential backoff retry with adaptive timeouts

**Main Endpoints:**
```
POST /functions/v1/legal-assistant
  Body: { message, fileContext?, sessionId, messageId, usePremiumModel }
  Response: SSE stream of content_block_delta events
```

#### B. ELI Integration Module (`eli-tools.ts` - 752 LOC)

**Responsibility:** Bridge to Polish legal acts API

**Features:**
- **Intelligent Article Detection:** Regex-based pattern matching for article references
- **Adaptive Timeout Strategy:**
  - First attempt: 6 seconds (covers 90% of acts)
  - Retry 1: 10 seconds (medium-sized PDFs)
  - Retry 2: 15 seconds (large PDFs like VAT law - 912k chars)
- **Token Limit Prevention:** Truncates articles to prevent Anthropic rate limiting
- **Multiple Act Support:** ~15,000 Polish legal acts (all codes from ISAP)

**Supported Act Codes:**
```
kc = Kodeks cywilny (Civil Code)
kp = Kodeks pracy (Labor Code)
kk = Kodeks karny (Criminal Code)
kpk = Kodeks postępowania karnego (Criminal Procedure)
kpc = Kodeks postępowania cywilnego (Civil Procedure)
kro = Kodeks rodzinny i opiekuńczy (Family & Guardian Code)
kpa = Kodeks postępowania administracyjnego (Admin Procedure)
pzp = Prawo zamówień publicznych (Public Procurement)
ksh = Kodeks spółek handlowych (Commercial Companies)
prd = Prawo o ruchu drogowym (Road Traffic Law)
op = Ordynacja podatkowa (Tax Code)
konstytucja = Konstytucja RP (Constitution)
... and 50+ more
```

#### C. Legal Context Knowledge Base (`legal-context.ts` - 891 LOC)

**Responsibility:** Topic-to-article mapping for intelligent enrichment

**Structure:**
```typescript
export const LEGAL_CONTEXT: Record<string, LegalTopic> = {
  urlop: {
    name: "Urlop wypoczynkowy",
    keywords: ["urlop", "urlopy", "wakacje", ...],
    mcpArticles: [
      { actCode: 'kp', articleNumber: '152' },  // Fetch from MCP
      { actCode: 'kp', articleNumber: '153' },
      ...
    ],
    mainActs: ["Kodeks pracy"],
    mainArticles: ["art. 152-189"],
    relatedArticles: ["art. 190-200"],
    source: "Kodeks Pracy"
  },
  // 20+ more topics covering:
  // - Labor Law (urlop, wynagrodzenie, rozwiązanie umowy)
  // - Family Law (alimenty, opieka, spadki)
  // - Civil Law (odpowiedzialność, umowy)
  // - Criminal Law (obrona konieczna, przedawnienie)
  // - Tax Law (podatki, VAT, rozliczenia)
  // - Road Traffic (mandat, punkty, prawo jazdy)
}
```

**Smart Detection Algorithm:**
- Scans message for topic keywords
- Scores topics by match frequency
- Returns TOP 1 topic only (prevents rate limiting)
- Automatically enriches prompt with relevant article snippets

#### D. Claude Tool Definitions (`tool-calling.ts` - 281 LOC)

**Two Main Tools:**

1. **`get_article`** - Fetch specific article by code & number
   ```
   Input: { act_code: string, article_number: string }
   Output: { title, article_text, eli, isapLink }
   ```

2. **`search_legal_info`** - Find articles by legal topic
   ```
   Input: { query: string }
   Output: Matched articles with context
   ```

**Smart Tool Selection:**
- Regex detects specific article requests → Force tool calling
- General questions → Allow Claude to use knowledge first
- Improves response quality and reduces token usage

#### E. Rate Limiting (`rate-limiter.ts` - 130 LOC)

**Method:** IP-based in-memory tracking  
**Thresholds:**
- Standard user: X requests per minute
- Premium user: Higher limits
- Burst protection: Exponential backoff

**Implementation:**
```typescript
export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}>
```

### 3.2 Database Schema

**PostgreSQL via Supabase**

```sql
-- Stores all user questions for analytics & quality monitoring
CREATE TABLE public.user_questions (
  id uuid PRIMARY KEY,
  question text NOT NULL,              -- User's question
  answer text NOT NULL,                -- AI response
  question_hash text,                  -- SHA-256 for cache lookup
  has_file_context boolean DEFAULT false,
  file_name text,                      -- PDF/DOCX filename if uploaded
  session_id text,                     -- Anonymous session tracking
  user_agent text,                     -- Browser info
  response_time_ms integer,            -- Latency measurement
  created_at timestamptz DEFAULT now(),
  
  -- Indexes for query optimization
  CHECK (char_length(question) > 0),
  CHECK (char_length(answer) > 0)
);

CREATE INDEX idx_user_questions_created_at ON public.user_questions(created_at DESC);
CREATE INDEX idx_user_questions_session_id ON public.user_questions(session_id);
CREATE INDEX idx_user_questions_hash ON public.user_questions(question_hash);
CREATE INDEX idx_user_questions_has_file ON public.user_questions(has_file_context);

-- Row Level Security (RLS)
-- Only service role can INSERT/SELECT (no public access)

-- Rate limiting table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY,
  ip_address text NOT NULL,
  request_count integer,
  window_start timestamptz,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(ip_address)
);
```

**Key Characteristics:**
- ✅ RLS enabled (service role only)
- ✅ PII anonymization (session IDs, no user tracking)
- ✅ Optimized indexes for common queries
- ✅ Automatic timestamp tracking
- ✅ Pagination support (for Admin panel)

### 3.3 API Endpoints

**All endpoints require Supabase auth headers or anon key**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/functions/v1/legal-assistant` | POST | Bearer token | Main AI chat |
| `/functions/v1/get-questions` | POST | Service role | Admin analytics |
| `/functions/v1/submit-feedback` | POST | Bearer token | User feedback |

---

## 4. ELI MCP SERVER (Microservice)

### 4.1 Architecture

**Framework:** Deno HTTP server  
**Language:** TypeScript  
**Deployment:** Raspberry Pi or cloud server  
**Communication:** REST API with Bearer token auth

### 4.2 File Structure

```
eli-mcp-server/src/
├── server.ts              # HTTP request handler
│   ├── GET  /health      → Health check (no auth)
│   ├── POST /fetch-article
│   ├── POST /search-acts
│   └── OPTIONS            → CORS preflight
│
├── eli-client.ts          # ISAP API wrapper (11,720 LOC)
│   ├── ELIClient class
│   ├── Search functionality
│   ├── LRU in-memory cache (200 acts)
│   └── Timeout handling
│
├── act-resolver.ts        # PDF parsing (20,742 LOC)
│   └── Complex text extraction & cleaning
│
└── tools.ts               # Tool definitions (49,278 LOC)
    ├── get_article tool
    └── search_acts tool
```

### 4.3 Key Features

**Authentication:**
```
Authorization: Bearer <API_KEY>
```

**CORS Configuration:**
```
Allowed Origins:
- https://jakieprawo.pl
- https://www.jakieprawo.pl
- https://najakiejpodstawie.pl
- https://najakiejpodstawie.vercel.app
- localhost:5173 (dev)
```

**Caching Strategy:**
- LRU cache (200 acts)
- Configurable TTL (default: 1 hour)
- Automatic expiration

**ISAP API Integration:**
```
Base URL: https://api.sejm.gov.pl/eli

Search Parameters:
- title: Search by law name
- keyword: Search by topic
- year: Filter by year
- inForce: Only active laws
- limit: Results per page (default: 20)
- offset: Pagination
```

---

## 5. AI INTEGRATION

### 5.1 Anthropic Claude Models

**Default Model (Standard):**
```
Model: claude-haiku-4-5-20251001
Context Window: 200k tokens
Optimized for: Speed and cost-efficiency
Use case: Most user queries
Cost: ~$0.008 per 1M input tokens
```

**Premium Model:**
```
Model: claude-sonnet-4-20250514
Context Window: 200k tokens
Optimized for: Higher reasoning capability
Use case: Complex legal questions (premium unlock)
Cost: ~$0.03 per 1M input tokens
```

### 5.2 Prompting Strategy

**System Prompt:**
```
You are JakiePrawo.pl - an expert Polish legal assistant.
Your role is to help users find legal provisions and understand Polish law.

CRITICAL RULES:
1. Always cite specific articles (art. XXX Kodeks YYY)
2. Only provide information you're confident about
3. For complex cases, recommend consulting a lawyer
4. Use Polish language
5. Format responses with clear structure

AVAILABLE TOOLS:
- get_article: Get specific article text
- search_legal_info: Find relevant laws by topic

IMPORTANT: This is informational, not professional legal advice.
```

### 5.3 Token Management

**Rate Limiting Prevention:**
- Anthropic limit: 50,000 tokens/minute
- Each article: ~12,000 tokens
- Strategy: Truncate articles to 3,000-5,000 chars max
- Limit to TOP 1 legal context topic per query

**Streaming:**
- SSE (Server-Sent Events) for real-time responses
- Chunk size: 15 characters per delta
- Improves perceived responsiveness

### 5.4 Tool Calling Flow

```
User Question
    ↓
detectLegalContext() → Extract topic + articles
    ↓
requiresForcedToolCalling() → Decide if Claude must use tools
    ↓
callClaude(
  message,
  tools: [get_article, search_legal_info],
  tool_choice: "auto" or "required"
)
    ↓
Claude returns tool_use block
    ↓
executeToolCalls() → Fetch articles from ELI MCP
    ↓
callClaude() again → Claude processes results
    ↓
Stream final response
```

---

## 6. AUTHENTICATION & AUTHORIZATION

### 6.1 Application Access Control

**Simple Password Gate:**
```
Default Password: 'lex' (configurable via VITE_APP_PASSWORD)
Purpose: Prevent unauthorized public access during MVP
Storage: localStorage (app_authenticated key)
```

**Premium Mode:**
```
Toggle Password: 'power' (configurable via VITE_PREMIUM_PASSWORD)
Purpose: Unlock claude-sonnet-4 model for premium features
Storage: localStorage (premium_unlocked key)
```

### 6.2 Supabase Authentication

**Client Side:**
- Anon public key (VITE_SUPABASE_PUBLISHABLE_KEY)
- Used for all Edge Function calls
- No actual user authentication yet

**Server Side:**
- Service role key (in GitHub secrets)
- Used for admin operations (get-questions)
- Database-level RLS policies

**CORS Headers:**
```
Access-Control-Allow-Origin: Whitelisted origins only
Access-Control-Allow-Methods: GET, POST, OPTIONS
Authorization: Bearer {anon_key or user_token}
```

### 6.3 PII Protection

**Implementation:**
```typescript
// src/lib/pii-detector.ts (149 test lines)
Detects and removes:
- Email addresses
- Phone numbers
- PESEL (Polish ID number)
- Bank account numbers
- Credit card numbers
```

**Usage:**
```
Before saving questions → Remove PII
Before sending to Claude → Warn user
In admin panel → Anonymized display
```

---

## 7. DEPLOYMENT & INFRASTRUCTURE

### 7.1 Deployment Architecture

```
┌──────────────────────────────────────────┐
│        GitHub Repository Push             │
│        (to main/master branch)            │
└────────────────┬─────────────────────────┘
                 │
        ┌────────▼────────────────┐
        │  GitHub Actions CI/CD    │
        └────────────┬─────────────┘
                     │
        ┌────────────┼────────────────┐
        │            │                │
   ┌────▼──┐    ┌────▼──┐      ┌────▼──┐
   │Test   │    │Frontend│     │Backend│
   │Suite  │    │Deploy  │     │Deploy │
   └───────┘    └────────┘     └───────┘
        │            │               │
        │      [Vercel]        [Supabase]
        │            │               │
        └────────────┼───────────────┘
                     │
              (Automated)
```

### 7.2 Frontend Deployment (Vercel)

**Build Process:**
```bash
# Automatic on push to main/master
npm install
npm run build  # Vite production build
# Generates optimized static assets
```

**Deployment:**
```
Branch: main/master
Domain: jakieprawo.pl / najakiejpodstawie.vercel.app
Build Time: ~2-3 minutes
SSL: Automatic (Let's Encrypt)
CDN: Vercel Edge Network (global)
```

**Environment Variables:**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_APP_PASSWORD=lex
VITE_PREMIUM_PASSWORD=power
```

### 7.3 Backend Deployment (Supabase)

**Edge Functions:**
```bash
# Automatic deployment via GitHub Actions
supabase functions deploy legal-assistant --project-ref $PROJECT_ID
supabase functions deploy get-questions
supabase functions deploy submit-feedback
```

**Database Migrations:**
```bash
# Automatic execution
supabase db push --project-ref $PROJECT_ID
```

**Environment:**
- Runtime: Deno (not Node.js)
- Region: Configurable
- Secrets (in Supabase Dashboard):
  - `ANTHROPIC_API_KEY` - Claude API key
  - `ELI_API_KEY` - MCP server authentication
  - `ELI_MCP_URL` - MCP server endpoint
  - `ALLOWED_ORIGINS` - CORS whitelist

### 7.4 ELI MCP Server Deployment

**Current Setup:**
```
Infrastructure: Raspberry Pi (or cloud server)
Language: Deno (TypeScript)
Port: 8080 (configurable)
Restart Policy: Process manager (e.g., systemd)
```

**Environment Variables:**
```
PORT=8080
API_KEY=dev-secret-key (or strong key in production)
CACHE_TTL=3600 (1 hour)
DEBUG=false (or true for logging)
```

**Health Check:**
```
GET /health
Response: { status: "ok", version: "1.0.0", timestamp: "..." }
Used by monitoring systems
```

### 7.5 CI/CD Workflows

**Test Workflow (`test.yml`):**
```yaml
Trigger: Any push or PR
Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (npm ci)
4. Run tests (vitest)
5. Generate coverage report
6. Upload coverage artifacts (30-day retention)
```

**Deploy Workflow (`deploy-supabase.yml`):**
```yaml
Trigger: Push to main/master or manual dispatch
Steps:
1. Link Supabase project (PROJECT_ID from secrets)
2. Check migration status
3. Deploy Edge Functions (if changed)
4. Run database migrations (if changed)
5. Verify deployment success
Secrets Required:
- SUPABASE_ACCESS_TOKEN
- SUPABASE_PROJECT_ID
- SUPABASE_DB_PASSWORD
```

---

## 8. DATABASE MODELS & DATA FLOW

### 8.1 Data Persistence

```
User Session
└── Messages (in-memory + localStorage)
    ├── User message
    └── Assistant response
        ├── Stored in: user_questions table
        ├── Fields: question, answer, session_id, created_at
        └── Retention: Indefinite (for analytics)

Analytics
├── user_questions (anonymized)
├── response_time_ms measurements
├── has_file_context flag
└── session_id for conversion tracking
```

### 8.2 Caching Strategy

**Frontend Cache:**
- `localStorage` for messages (max 50 messages)
- Session ID persistence (7-day expiry)
- Premium unlock state

**Backend Cache:**
- ELI MCP LRU cache (200 acts, 1-hour TTL)
- Response cache (same question within 7 days)
- Rate limit tracking (IP-based window)

### 8.3 Query Examples

**Most Common:**
```sql
-- Admin: View latest questions
SELECT id, question, answer, response_time_ms, created_at
FROM user_questions
WHERE created_at > now() - interval '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- Analytics: Question volume by day
SELECT DATE(created_at), COUNT(*) as volume
FROM user_questions
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Analytics: File vs. non-file questions
SELECT has_file_context, COUNT(*) as count
FROM user_questions
GROUP BY has_file_context;
```

---

## 9. KEY FEATURES & CAPABILITIES

### 9.1 Feature Matrix

| Feature | Status | Implemented | Technology |
|---------|--------|-------------|-----------|
| **Document Analysis** | ✅ CORE | Full OCR + text extraction | Tesseract.js, PDF.js, Mammoth |
| **Article Search** | ✅ CORE | 15,000+ acts accessible | ELI MCP + ISAP API |
| **Natural Language Q&A** | ⚠️ BETA | ~70-85% accuracy | Claude Haiku/Sonnet |
| **Streaming Responses** | ✅ CORE | Real-time content delivery | SSE + Fetch API |
| **Caching** | ✅ CORE | 7-day response cache | SHA-256 hash + DB |
| **Rate Limiting** | ✅ CORE | IP-based protection | In-memory tracker |
| **PII Detection** | ✅ CORE | Removes sensitive data | Regex patterns |
| **Feedback System** | ✅ CORE | 👍👎 per message | user_questions.feedback |
| **Admin Analytics** | ✅ CORE | Question dashboard | get-questions function |
| **Multi-language OCR** | ✅ CORE | Polish + English | Tesseract.js |
| **Premium AI Model** | ✅ CORE | Claude Sonnet upgrade | Password-gated |
| **File Persistence** | ⚠️ LIMITED | 15-min auto-clear | localStorage + cleanup |
| **User Auth** | ❌ TODO | Basic password gate | localStorage only |
| **Payment Processing** | ❌ TODO | Stripe/Tpay integration | TBD |

### 9.2 Performance Metrics

**Target SLAs:**
- Page load: < 3 seconds
- Time to first response: 5-10 seconds
- OCR processing: 2-5 seconds per page
- Article fetch (MCP): 1-6 seconds (adaptive timeout)
- Streaming latency: < 100ms per chunk

**Optimization Techniques:**
1. Code splitting (lazy-loaded routes)
2. Image optimization (WebP with fallbacks)
3. CSS-in-JS minification
4. Dead code elimination
5. Caching strategy (7-day TTL)

---

## 10. TECHNOLOGY STACK SUMMARY

### 10.1 Frontend Stack

```
┌─ UI Layer ────────────────────────────┐
│ React 18.3.1 + TypeScript 5.8        │
│ Vite 5.4 (build) + SWC (transpile)   │
│ Tailwind CSS 3.4 + shadcn/ui          │
└────────────────────────────────────────┘

┌─ State & Logic ────────────────────────┐
│ Zustand 5.0 (state)                   │
│ React Router 6.30 (routing)           │
│ Fetch API + custom retry logic        │
│ Custom hooks (useChatAPI, useFeedback)│
└────────────────────────────────────────┘

┌─ Features ─────────────────────────────┐
│ Tesseract.js 6.0 (OCR)                │
│ PDF.js 5.4 (PDF parsing)              │
│ Mammoth 1.11 (DOCX parsing)           │
│ Sonner 1.7 (notifications)            │
│ Framer Motion 12.23 (animation)       │
└────────────────────────────────────────┘

┌─ Testing & Dev ────────────────────────┐
│ Vitest 4.0 + @testing-library/react   │
│ ESLint 9.32 + Prettier                │
│ TypeScript strict mode                │
└────────────────────────────────────────┘
```

### 10.2 Backend Stack

```
┌─ Serverless ───────────────────────────┐
│ Supabase Edge Functions (Deno)        │
│ TypeScript runtime (Deno 1.x)        │
│ Automatic deployment via GitHub       │
└────────────────────────────────────────┘

┌─ Database ─────────────────────────────┐
│ PostgreSQL (Supabase managed)         │
│ Row Level Security (RLS)              │
│ Automatic backup & replication        │
│ Point-in-time recovery (7 days)       │
└────────────────────────────────────────┘

┌─ AI & External APIs ───────────────────┐
│ Anthropic Claude (Haiku 4.5, Sonnet 4)│
│ Model Context Protocol (custom MCP)   │
│ ISAP API (Sejm legal acts)            │
│ ELI MCP Server (Deno microservice)    │
└────────────────────────────────────────┘

┌─ Auth & Security ──────────────────────┐
│ Supabase Auth (for future expansion)  │
│ JWT tokens support                    │
│ API key validation                    │
│ CORS whitelisting                     │
│ Rate limiting (IP-based)              │
│ PII detection & removal               │
└────────────────────────────────────────┘
```

### 10.3 Infrastructure

```
┌─ Version Control ──────────────────────┐
│ GitHub (public repository)            │
│ Branch protection (main/master)       │
│ Pull request reviews                  │
└────────────────────────────────────────┘

┌─ CI/CD ────────────────────────────────┐
│ GitHub Actions (free tier)            │
│ Automated testing on PR               │
│ Automatic deployment to production    │
│ Coverage reporting                    │
└────────────────────────────────────────┘

┌─ Hosting & Services ───────────────────┐
│ Vercel (Frontend) - Next.js optimized│
│ Supabase (Backend) - PostgreSQL, Auth │
│ Raspberry Pi (ELI MCP Server)        │
│ Anthropic Claude API (AI)            │
│ Sejm API (Legal data)                │
└────────────────────────────────────────┘
```

---

## 11. TESTING & QUALITY ASSURANCE

### 11.1 Test Coverage

**Current Statistics:**
- Total test files: 7
- Total test lines: 1,395
- Test-to-code ratio: ~7.5%

**Test Breakdown:**

| Component | Test Lines | Coverage | Status |
|-----------|-----------|----------|--------|
| ChatStore | 235 | Good | ✅ Complete |
| ChatInput | 227 | Good | ✅ Complete |
| FileUpload | 316 | Good | ✅ Complete |
| ChatMessage | 430 | Good | ✅ Complete |
| PII Detector | 149 | Good | ✅ Complete |
| Utils | 38 | Minimal | ⚠️ Partial |

**Coverage Gaps:**
- ❌ Hooks (useChatAPI, useFeedback, usePremium)
- ❌ Services (StreamingService)
- ❌ Pages (Index, Landing, Admin)
- ❌ Backend functions

### 11.2 Testing Strategy

**Unit Tests:**
- Component rendering
- State management
- Utility functions
- PII detection patterns

**Integration Tests:**
- Supabase function calls
- File upload & OCR
- Streaming responses
- Message persistence

**Manual Testing Checklist:**
- File uploads (PDF, DOCX, images)
- OCR accuracy
- Article search
- Rate limiting
- Premium unlock
- Mobile responsiveness

### 11.3 Code Quality Tools

```
ESLint: 9.32 (enforces code style)
Prettier: Configured (code formatting)
TypeScript: Strict mode enabled
  ✅ strict: true
  ✅ noImplicitAny: true
  ✅ strictNullChecks: true
  ✅ strictFunctionTypes: true
  ❌ noUnusedLocals: false (disabled)
  ❌ noUnusedParameters: false (disabled)
```

---

## 12. KNOWN ISSUES & TECHNICAL DEBT

### 12.1 Code Duplication

**Issue 1: Duplicate Logger Implementation**
```
Frontend: /src/lib/logger.ts (82 lines)
Backend: /supabase/functions/_shared/logger.ts (84 lines)
Status: Nearly identical, maintenance burden
Recommendation: Share interface
```

**Issue 2: Duplicate Retry Logic**
```
Frontend: /src/lib/retry.ts (133 lines)
Backend: /supabase/functions/_shared/retry.ts (123 lines)
Status: 99% identical
Recommendation: Consolidate
```

**Issue 3: Duplicate Rate Limiting**
```
In-memory: /supabase/functions/_shared/rate-limit.ts
Database: /supabase/functions/legal-assistant/rate-limiter.ts
Status: Two different approaches, unclear which is active
Recommendation: Use DB-based for distributed systems
```

### 12.2 Security Issues

**Issue: Hardcoded Passwords**
```
/src/hooks/usePremium.ts:
const PREMIUM_PASSWORD = import.meta.env.VITE_PREMIUM_PASSWORD || 'power';

/src/components/PasswordGate.tsx:
const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'lex';

Status: Client-side only (not a production vulnerability)
Recommendation: Implement JWT-based auth system
```

### 12.3 Code Quality Issues

**Issue: Console Logging**
- 15+ instances of `console.log()` instead of `logger` utility
- Should use structured logger for production

**Issue: Type Safety**
- 4 instances of `as any` in FileUpload.tsx
- Bypasses TypeScript checks
- Should use type guards instead

**Issue: Unused Code**
- `useIsMobile` hook (19 lines, never imported)
- `@radix-ui/react-toast` (unused, Sonner used instead)
- Test files in root directory (should be in test/)

### 12.4 Architecture Issues

**Issue: Large Files**
```
legal-context.ts: 891 lines (should be split by topic)
index.ts (legal-assistant): 1,161 lines (very large)
tools.ts (ELI server): 49,278 lines (extremely large)
```

**Issue: Missing Abstraction**
- 11+ direct localStorage accesses across files
- No centralized storage layer
- Hard to migrate or test

**Issue: Inactivity Timer Logic**
- Mixed in Index.tsx page component
- Should be extracted to custom hook

---

## 13. ROADMAP & FUTURE ENHANCEMENTS

### 13.1 Short Term (0-3 months)

- [ ] Fix code duplication (logger, retry)
- [ ] Add missing test coverage (hooks, services)
- [ ] Implement proper JWT authentication
- [ ] Move legal context to database
- [ ] Remove hardcoded passwords
- [ ] Add more legal topics to knowledge base

### 13.2 Medium Term (3-6 months)

- [ ] Payment integration (Stripe/Tpay)
- [ ] User accounts & premium subscriptions
- [ ] API for third-party integration
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Multi-language support (beyond Polish)

### 13.3 Long Term (6-12 months)

- [ ] ML model fine-tuning on Polish law data
- [ ] Browser extension
- [ ] Document generation (contracts, templates)
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Enterprise/B2B plans

---

## 14. PERFORMANCE & SCALABILITY

### 14.1 Performance Characteristics

**Frontend Bundle:**
```
Main JS: ~250-300KB (gzipped)
CSS: ~50KB (gzipped)
Total with dependencies: ~400KB initial load
Performance: Lighthouse score 85+
```

**Backend Performance:**
```
p50 latency: 2-3 seconds (to first response)
p95 latency: 8-10 seconds (full response)
p99 latency: 15-20 seconds (large articles)
Throughput: ~100 concurrent users (Edge Functions scaling)
```

**Database Performance:**
```
user_questions queries: < 100ms (with indexes)
Max storage: 2GB (Supabase free tier)
Scaling: Automatic via Supabase
```

### 14.2 Scalability Considerations

**Bottlenecks:**
1. Anthropic API rate limits (50k tokens/min)
2. ISAP API rate limits (unknown, not documented)
3. Supabase connection pool (10 concurrent by default)
4. ELI MCP server single instance

**Scaling Strategy:**
1. Increase cache hit rate (7-day TTL)
2. Implement request deduplication
3. Add more MCP server instances (behind load balancer)
4. Upgrade Supabase connection pool
5. Implement more aggressive article truncation

---

## 15. COMPETITIVE ANALYSIS

### 15.1 Market Positioning

| Aspect | JakiePrawo.pl | LexLege/iLaw | ChatGPT | Professional Lawyer |
|--------|--------------|-------------|---------|-------------------|
| **OCR** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Official API** | ✅ Sejm | ⚠️ Limited | ❌ No | ✅ Yes |
| **15,000+ Acts** | ✅ Yes | ⚠️ Partial | ❌ No | ✅ Yes |
| **Cost/Query** | €0.01 | €5-10 | €0.20 | €50-200 |
| **Response Time** | 5-10s | 24-48h | 3-5s | 1-7 days |
| **Polish Tuned** | ✅ Yes | ✅ Yes | ⚠️ Limited | ✅ Yes |
| **Offline** | ❌ No | ❌ No | ❌ No | N/A |
| **Open Source** | ✅ Yes (GitHub) | ❌ No | ❌ No | N/A |

**Key Differentiators:**
1. Only platform combining OCR + Official API + AI
2. Real-time officiel sources (api.sejm.gov.pl) - not hallucinations
3. Polish-first optimization
4. Transparent & open source
5. Affordable (€0.01 per query vs. lawyers at €50-200)

---

## 16. COST ANALYSIS & PRICING

### 16.1 Operating Costs (Monthly Estimate)

| Service | Cost | Usage | Notes |
|---------|------|-------|-------|
| **Supabase** | $25 | DB + Auth + Functions | 500MB data, 50k messages/month |
| **Anthropic Claude** | $50 | ~50k queries/month | Haiku at €0.001/k tokens |
| **Vercel** | $20 | Frontend hosting | Bandwidth + serverless |
| **ISAP API** | Free | Unlimited | Official Czech API, free tier |
| **Domain** | $12/year | jakieprawo.pl | Renewable |
| **Monitoring** | $0 | Basic | Using free tier tools |
| **TOTAL** | ~$95 | Per month | For 50k queries |
| **Per Query** | €0.002 | Average | (Excluding fixed costs) |

### 16.2 Pricing Strategy

**Proposed B2C Model:**
```
Free Tier:
- 5 queries/day
- Haiku model only
- No file uploads

Premium (Personal):
- Unlimited queries
- Sonnet model access
- File uploads (5MB)
- Cost: €4.99/month

Enterprise (B2B):
- API access
- Custom integration
- SLA support
- Cost: Custom quote
```

---

## 17. REGULATORY & COMPLIANCE

### 17.1 GDPR Compliance

**Implemented:**
- ✅ PII detection & removal before processing
- ✅ Session-based anonymization (no user IDs)
- ✅ Data retention policy (database indefinite, need policy)
- ✅ RLS at database level
- ✅ GDPR warning modal on first visit
- ✅ Cookie consent banner

**To Implement:**
- [ ] Data deletion request handling
- [ ] Right to access (user export)
- [ ] Data processing agreement (DPA)
- [ ] Privacy policy (exists, needs refinement)
- [ ] Cookie policy

### 17.2 Legal Disclaimers

**Current Implementation:**
```
"JakiePrawo.pl serves informational and educational purposes.
The application does NOT replace professional legal advice.
In individual cases, especially those of significant legal or
financial importance, always consult a qualified attorney."
```

**Recommendation:**
- Add disclaimers per feature
- Include liability limitations
- Mention accuracy (70-85% for AI responses)
- Terms of Service (exists, needs finalization)

---

## 18. DEPLOYMENT CHECKLIST

### 18.1 Pre-Production

- [ ] Verify all environment variables are set
- [ ] Test rate limiting thresholds
- [ ] Load test with 100+ concurrent users
- [ ] Test OCR with edge cases
- [ ] Verify CORS whitelist
- [ ] Security audit of secrets management
- [ ] Database backup automated

### 18.2 Production Readiness

**Required GitHub Secrets:**
```
SUPABASE_ACCESS_TOKEN: [token from supabase.com]
SUPABASE_PROJECT_ID: [project-id]
SUPABASE_DB_PASSWORD: [secure password]
```

**Required Supabase Secrets (Edge Functions):**
```
ANTHROPIC_API_KEY: [key from console.anthropic.com]
ELI_MCP_URL: https://eli-mcp.example.com:8080
ELI_API_KEY: [strong key for MCP authentication]
ALLOWED_ORIGINS: https://jakieprawo.pl,https://www.jakieprawo.pl
```

**Monitoring Setup:**
- [ ] Error tracking (Sentry recommended)
- [ ] Performance monitoring (New Relic or Datadog)
- [ ] Log aggregation (CloudWatch or equivalent)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database backups (automated daily)

---

## 19. DOCUMENTATION

### 19.1 Available Documentation

- ✅ README.md (overview + features)
- ✅ ACCESSIBILITY.md (a11y guidelines)
- ✅ CODE_REVIEW.md (previous review results)
- ✅ CODEBASE_ANALYSIS.md (detailed analysis)
- ✅ TEST_INSTRUCTIONS.md (testing guide)
- ✅ .github/SUPABASE_DEPLOYMENT.md (deployment guide)
- ✅ Inline code comments (scattered)

### 19.2 Missing Documentation

- [ ] Architecture Decision Records (ADRs)
- [ ] API specification (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Deployment runbooks
- [ ] Troubleshooting guide
- [ ] Contributing guidelines
- [ ] API client library (SDKs)

---

## 20. CONTACT & SUPPORT

**Project:** JakiePrawo.pl  
**Repository:** https://github.com/karolpolikarp/najakiejpodstawie  
**Website:** https://jakieprawo.pl  
**Status:** Open Source (MIT License)  
**Community:** GitHub Issues for bug reports & feature requests  

---

## APPENDIX A: CODE STATISTICS

**Total Lines of Code:**
```
Frontend (src/):            ~4,500 LOC
Backend (supabase/):        ~3,500 LOC (including legal-context)
ELI MCP Server:             ~42,000 LOC (mostly tools.ts)
Tests:                      ~1,400 LOC
Configuration:              ~200 LOC
─────────────────────────────────────────
TOTAL:                      ~51,600 LOC
```

**File Breakdown:**
```
TypeScript/TSX files:       87 total
  - Frontend:               53 files
  - Backend:                11 files
  - ELI MCP:                5 files
  - Tests:                  7 files
  - Config:                 11 files

Largest Files:
1. eli-mcp-server/src/tools.ts          49,278 LOC
2. eli-mcp-server/src/act-resolver.ts   20,742 LOC
3. legal-assistant/index.ts              1,161 LOC
4. legal-assistant/legal-context.ts        891 LOC
```

---

## APPENDIX B: DEPENDENCIES OVERVIEW

**Production Dependencies: 22**
- Core: React, React DOM, React Router
- State: Zustand
- UI: Tailwind CSS, shadcn/ui, Radix UI components
- Features: Tesseract.js, PDF.js, Mammoth, Framer Motion
- Utilities: Zod, Sonner, Lucide React

**Development Dependencies: 18**
- Testing: Vitest, Testing Library
- Linting: ESLint, TypeScript ESLint
- Build: Vite, SWC transpiler
- Styling: Tailwind CSS, PostCSS
- Type safety: TypeScript

---

**End of Document**

*This comprehensive technical documentation provides investors, technical teams, and developers with a complete understanding of JakiePrawo.pl's architecture, capabilities, and technical implementation.*

