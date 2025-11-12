# Comprehensive Codebase Analysis Report: JakiePrawo.pl

## Executive Summary

**JakiePrawo.pl** is a modern legal assistant web application that helps users find Polish legal provisions using AI. The codebase is well-structured with a clear separation between frontend (React/Vite), backend (Supabase Edge Functions), and a specialized service (ELI MCP Server for legal acts extraction).

**Overall Assessment**: The codebase is functional and demonstrates good practices in many areas, but contains several optimization opportunities, code duplication issues, and minor security concerns that should be addressed.

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### 1.1 Project Type & Main Technologies

**Type**: Full-stack web application with serverless backend

**Frontend Stack**:
- React 18.3.1 with TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- Zustand (state management)
- React Query (data fetching)
- React Router (routing)
- Sonner (toast notifications)

**Backend Stack**:
- Supabase (PostgreSQL + Edge Functions)
- Deno (runtime for serverless functions)
- Anthropic Claude (AI model for legal analysis)

**Supporting Service**:
- ELI MCP Server (Deno-based, runs on Raspberry Pi)
- Handles Polish legal acts extraction via ISAP API

**CI/CD**:
- GitHub Actions (test + deploy pipelines)
- Automated Supabase migrations
- Vercel deployment for frontend

### 1.2 File Structure Overview

```
najakiejpodstawie/
├── src/                          # Frontend (React)
│   ├── components/              # UI components + tests
│   ├── pages/                   # Route pages
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # Business logic (StreamingService)
│   ├── store/                   # Zustand store + tests
│   ├── lib/                     # Utilities (logger, retry, PII detection, constants)
│   ├── integrations/            # Supabase client configuration
│   └── test/                    # Test setup
├── supabase/
│   ├── functions/               # Edge Functions (Deno)
│   │   ├── legal-assistant/    # Main AI assistant function (963 LOC)
│   │   ├── get-questions/      # Fetch user questions
│   │   ├── submit-feedback/    # Save user feedback
│   │   └── _shared/            # Shared utilities (logger, retry, rate-limit)
│   └── migrations/              # Database schema
├── eli-mcp-server/              # Separate Deno service
│   └── src/
│       ├── server.ts            # HTTP API
│       ├── eli-client.ts        # ISAP API client
│       └── tools.ts             # Article extraction tools
├── .github/workflows/           # CI/CD pipelines
└── [config files]               # TypeScript, ESLint, Tailwind, Vite configs
```

### 1.3 Code Statistics

| Metric | Value |
|--------|-------|
| Total source files (TS/TSX) | 87 |
| Production code in `src/` | 53 files |
| Test files | 7 files |
| Total test code | 1,582 lines |
| Main Supabase function | 963 lines |
| Total backend code | 3,087 lines |

---

## 2. DETAILED ANALYSIS

### 2.1 Frontend Architecture

**Strengths**:
- ✅ Lazy-loaded route components for code splitting
- ✅ Proper separation of concerns (hooks, components, services)
- ✅ Centralized state management with Zustand
- ✅ Good use of custom hooks (`useChatAPI`, `useFeedback`, `usePremium`)
- ✅ TypeScript with strict null checks enabled
- ✅ Error boundaries and fallback UI
- ✅ Responsive design with mobile considerations

**Key Components**:

1. **App.tsx** - Main router with lazy loading
   - Uses React Router v6 with 8 routes
   - Suspense fallback for lazy pages
   - Proper nesting of providers (ErrorBoundary, QueryClient, ThemeProvider)

2. **Pages** (all lazy-loaded):
   - `Landing.tsx` - Public homepage
   - `Index.tsx` - Main chat interface (complex, 250+ LOC)
   - `Admin.tsx` - Questions/feedback dashboard
   - `About.tsx`, `Contact.tsx`, `Privacy.tsx`, `Terms.tsx`, `FAQ.tsx`
   - `NotFound.tsx` - Fallback 404

3. **Custom Hooks**:
   - `useChatAPI.ts` - Handles streaming API calls
   - `usePremium.ts` - Premium mode management (⚠️ See issues below)
   - `useFeedback.ts` - Submits user feedback

4. **Store** (Zustand):
   - `chatStore.ts` - Message history, loading state, file attachments
   - Properly persists messages to localStorage
   - Well-tested (235 lines of tests)

### 2.2 Backend Architecture (Supabase Functions)

**Main Functions**:

1. **`legal-assistant/index.ts`** (963 lines)
   - **Purpose**: Main AI assistant endpoint
   - **Flow**: Detect legal context → Call ELI MCP → Call Claude → Stream response
   - **Key Features**:
     - Forced tool calling for specific article requests
     - Legal context detection (topics, keywords)
     - Rate limiting (checkRateLimit)
     - CORS configuration
     - Streaming response with SSE

2. **`legal-assistant/eli-tools.ts`** (686 lines)
   - **Purpose**: Integration with ELI MCP server
   - **Features**:
     - Article detection from user messages
     - Dynamic article fetching from MCP
     - Supports all ~15,000 Polish legal acts
     - Adaptive timeout strategy (6s → 10s → 15s)

3. **`legal-assistant/legal-context.ts`** (840 lines)
   - **Purpose**: Knowledge base of legal topics
   - **Content**: Maps legal topics to articles for auto-fetching
   - **Topics covered**: Labor law, civil law, tax law, etc.
   - ⚠️ Very large file - could be split

4. **`legal-assistant/tool-calling.ts`** (281 lines)
   - **Purpose**: Claude tool definitions and execution
   - **Tools**: search_acts, fetch_article_content
   - Handles article text extraction and formatting

5. **Shared utilities** (`_shared/`):
   - `logger.ts` - Logging with debug mode
   - `retry.ts` - Exponential backoff retry logic
   - `rate-limit.ts` - IP-based rate limiting (in-memory)

6. **Supporting Functions**:
   - `get-questions/index.ts` - Retrieve user questions
   - `submit-feedback/index.ts` - Save feedback with PII detection

### 2.3 ELI MCP Server (Separate Service)

**Architecture**:
- Deno-based HTTP API
- Acts as a bridge to Polish legal acts API (ISAP)
- Caching layer to reduce API calls

**Key Files**:
- `server.ts` - HTTP endpoints and authentication
- `eli-client.ts` - ISAP API client with LRU cache
- `tools.ts` - Tool definitions for article search and fetching

**Features**:
- Health check endpoint
- API key authentication
- Caching with configurable TTL
- Multiple test files for validation

---

## 3. KEY ISSUES & PROBLEMS

### 3.1 Code Duplication Issues

#### Issue 1: Duplicate Logger Implementation
**Files**: 
- `/src/lib/logger.ts` (82 lines)
- `/supabase/functions/_shared/logger.ts` (84 lines)

**Problem**: Nearly identical implementations with only minor differences (Deno vs browser environment detection)

**Impact**: Maintenance burden, potential for inconsistent logging behavior

**Recommendation**: Create a shared logging interface that both can use

---

#### Issue 2: Duplicate Retry Logic
**Files**:
- `/src/lib/retry.ts` (133 lines)
- `/supabase/functions/_shared/retry.ts` (123 lines)

**Problem**: 99% identical exponential backoff implementation

**Impact**: Maintenance overhead, potential for divergence

**Recommendation**: Share implementation or use a single source of truth

---

#### Issue 3: Duplicate Rate Limiting Implementations
**Files**:
- `/supabase/functions/_shared/rate-limit.ts` - In-memory rate limiting (IP-based, 133 lines)
- `/supabase/functions/legal-assistant/rate-limiter.ts` - Database-based rate limiting (Supabase, 130 lines)

**Problem**: Two different approaches exist; unclear which is actually being used

**Impact**: Potential security gaps, confusion about rate limit enforcement

**Implementation Status**: The in-memory version in `_shared/` appears to be the active one (used in `legal-assistant/index.ts`), but the database version is also defined and unused.

**Recommendation**: Consolidate to a single implementation. The DB-based approach is better for distributed systems.

---

#### Issue 4: Duplicate Toast Hook
**Files**:
- `/src/hooks/use-toast.ts` (186 lines)
- `/src/components/ui/use-toast.ts` (3 lines - re-export)

**Problem**: The UI version just re-exports the hook version

**Impact**: Confusing import paths, unnecessary duplication

**Recommendation**: Remove the UI version, import directly from hooks

---

### 3.2 Unused Code

#### Issue 5: Unused Hook - `useIsMobile`
**File**: `/src/hooks/use-mobile.tsx` (19 lines)

**Problem**: 
- Defined but never imported or used anywhere in the codebase
- Checked via grep: `useIsMobile` is not referenced in any component

**Impact**: Dead code increasing bundle size

**Recommendation**: Remove if not planned for near-term use, or document why it's kept

---

#### Issue 6: Duplicate Toast System
**Files**:
- `@radix-ui/react-toast` (imported in dependencies)
- `sonner` (imported in dependencies)

**Problem**:
- Both are included but only `sonner` is actively used
- Radix UI toast components are defined but the implementation uses Sonner in all components
- `sonner.tsx` wrapper is created but barely used

**Impact**: Unnecessary bundle bloat (~15-20KB)

**Recommendation**: 
- Remove `@radix-ui/react-toast` from dependencies
- Consolidate all notifications to use Sonner
- Keep Radix UI alert-dialog and dialog (those are used)

---

### 3.3 Security & Code Quality Issues

#### Issue 7: Hardcoded Premium Password
**File**: `/src/hooks/usePremium.ts` (line 13)

```typescript
const PREMIUM_PASSWORD = 'power'; // TODO: Remove hardcoded password
```

**Problem**:
- Password is visible in source code
- Not a security issue per se (it's client-side), but bad practice
- TODO comment indicates awareness of the problem

**Impact**: Trivial to bypass, demonstrates incomplete implementation

**Recommendation**:
- Use JWT tokens or proper authentication backend
- Check environment variables if needed
- Implement proper session management

---

#### Issue 8: Unsafe Type Casting with `as any`
**Location**: 4 instances found in `/src/components/FileUpload.tsx` and related files

```typescript
file.type as any  // File Upload (line 44)
```

**Problem**: Bypasses TypeScript type checking

**Impact**: May hide actual type errors

**Recommendation**: Use proper type guards or `unknown` with type checking

---

#### Issue 9: Direct Console Usage Instead of Logger
**Count**: 15 instances

**Files affected**:
- `/src/components/FileUpload.tsx` - PDF parsing debug logs
- `/src/pages/Index.tsx` - Multiple console calls
- Various other components

**Example** (FileUpload.tsx, line 82):
```typescript
console.log('📄 Starting PDF parsing...');
console.log('✓ ArrayBuffer created, size:', arrayBuffer.byteLength);
```

**Problem**:
- Inconsistent with the logger utility that exists
- Debug logs may leak to production
- Harder to control log levels

**Impact**: Inconsistent logging, harder debugging in production

**Recommendation**: Replace all `console.*` with the logger utility

---

### 3.4 Performance & Optimization Issues

#### Issue 10: Large Legal Context File
**File**: `/supabase/functions/legal-assistant/legal-context.ts` (840 lines)

**Problem**:
- Contains static mapping of all legal topics and articles
- Could be split into multiple files or moved to database
- Decreases readability

**Impact**: Harder to navigate and maintain

**Recommendation**:
- Split by legal topic (labor-law.ts, civil-law.ts, etc.)
- Consider moving to database for dynamic updates
- Create separate files for each major topic area

---

#### Issue 11: Repeated Article Detection Patterns
**Found in**:
- `/supabase/functions/legal-assistant/eli-tools.ts` - detectArticleReferences()
- `/test-detect-articles.ts` - Duplicate detection logic
- Root level test scripts (not in proper test directory)

**Impact**: Maintenance burden, risk of pattern divergence

**Recommendation**: Consolidate article detection into a shared utility

---

### 3.5 Test Coverage Issues

#### Issue 12: Incomplete Test Coverage
**Statistics**:
- Total test files: 7
- Total test lines: 1,582
- Production files: 53

**Test Distribution**:
- Good: ChatStore (235 lines of tests)
- Good: ChatInput (227 lines of tests)
- Good: FileUpload (316 lines of tests)
- Good: ChatMessage (430 lines of tests)
- Good: PII Detector (149 lines of tests)
- Weak: Utils (38 lines)
- Missing: Services, Hooks, Pages have NO tests

**Coverage Gaps**:
- ❌ No tests for `useChatAPI` hook
- ❌ No tests for `useFeedback` hook
- ❌ No tests for `usePremium` hook
- ❌ No tests for `StreamingService`
- ❌ No tests for Supabase client integration
- ❌ No tests for page components

**Impact**: Risk of regressions, harder to refactor

**Recommendation**:
- Add tests for critical hooks (useChatAPI, StreamingService)
- Add integration tests for Supabase functions
- Aim for 70%+ coverage

---

### 3.6 Architectural Issues

#### Issue 13: Mixed LocalStorage Usage Without Abstraction
**Locations**: 11+ instances across multiple files

**Files**:
- `useChatAPI.ts` - session_id
- `usePremium.ts` - premium_unlocked
- `GDPRWarningModal.tsx` - gdpr_acceptance
- `PasswordGate.tsx` - app_authenticated
- `CookieBanner.tsx` - cookie_consent
- `ThemeProvider.tsx` - theme
- `chatStore.ts` - persistent messages

**Problem**:
- No abstraction layer for localStorage
- Different key naming conventions
- Hard to manage migrations
- Direct browser APIs mixed with business logic

**Impact**: Harder to test, harder to migrate storage, potential conflicts

**Recommendation**:
```typescript
// Create src/lib/storage.ts
export const StorageKeys = {
  SESSION_ID: 'session_id',
  PREMIUM_KEY: 'premium_unlocked',
  // ...
} as const;

export const useStorage = () => {
  // Wrapper functions for localStorage
};
```

---

#### Issue 14: Inactivity Timer Cleanup Complexity
**File**: `/src/pages/Index.tsx` (lines 106-132)

**Problem**:
- Complex timer management for clearing attached files
- 15-minute inactivity threshold is business logic mixed with UI
- Could be moved to a custom hook

**Recommendation**:
```typescript
// Create src/hooks/useInactivityTimer.ts
export const useInactivityTimer = (onInactive: () => void, timeout = 15 * 60 * 1000) => {
  // Encapsulate timer logic
};
```

---

### 3.7 Configuration & Environment Issues

#### Issue 15: Missing Environment Variable Validation at Build Time
**File**: `/src/integrations/supabase/client.ts`

**Status**: ✅ Actually implemented correctly with Zod validation
- Has proper schema validation
- Throws descriptive errors if env vars missing

**Note**: Good practice, just wanted to confirm it's there.

---

## 4. DEPENDENCY ANALYSIS

### 4.1 Dependencies Status

**All dependencies appear to be used:**

| Package | Version | Used | Notes |
|---------|---------|------|-------|
| @radix-ui/react-alert-dialog | ^1.1.14 | ✅ | AlertDialog, confirmed in components |
| @radix-ui/react-checkbox | ^1.3.2 | ✅ | FileUpload, ChatInput |
| @radix-ui/react-dialog | ^1.1.14 | ✅ | Multiple dialogs |
| @radix-ui/react-slot | ^1.2.3 | ✅ | Button primitive |
| @radix-ui/react-toast | ^1.1.14 | ⚠️ | Defined but not used (Sonner used instead) |
| @radix-ui/react-tooltip | ^1.2.7 | ✅ | Tooltip component |
| @supabase/supabase-js | ^2.79.0 | ✅ | Database & auth |
| @tanstack/react-query | ^5.83.0 | ⚠️ | Imported in App.tsx but not actively used (Supabase direct calls) |
| class-variance-authority | ^0.7.1 | ✅ | UI component styling |
| clsx | ^2.1.1 | ✅ | Used in utils.ts |
| framer-motion | ^12.23.24 | ⚠️ | Imported but minimal usage (check actual usage) |
| lucide-react | ^0.462.0 | ✅ | Icons throughout |
| mammoth | ^1.11.0 | ✅ | DOCX parsing |
| next-themes | ^0.3.0 | ✅ | Theme provider |
| pdfjs-dist | ^5.4.394 | ✅ | PDF text extraction |
| react | ^18.3.1 | ✅ | Core framework |
| react-dom | ^18.3.1 | ✅ | DOM rendering |
| react-router-dom | ^6.30.1 | ✅ | Routing |
| sonner | ^1.7.4 | ✅ | Toast notifications |
| tailwind-merge | ^2.6.0 | ✅ | Utility in cn() function |
| zod | ^3.25.76 | ✅ | Env validation, form validation |
| zustand | ^5.0.8 | ✅ | State management |

**Recommendation**:
- Remove `@radix-ui/react-toast` (unused, Sonner is better)
- Verify `@tanstack/react-query` is actually needed (might be planned for future)
- Check actual usage of `framer-motion` (might be minimal)

---

## 5. AREAS FOR IMPROVEMENT & OPTIMIZATION

### 5.1 Code Quality Improvements

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 HIGH | Remove hardcoded password in `usePremium` | 1-2h | Security |
| 🔴 HIGH | Consolidate duplicate logger implementations | 2-3h | Maintainability |
| 🟠 MED | Merge rate limiting implementations | 2-3h | Clarity, security |
| 🟠 MED | Replace console.* with logger utility | 1-2h | Consistency |
| 🟠 MED | Remove unused `use-mobile.tsx` hook | 15m | Bundle size |
| 🟠 MED | Remove unused `@radix-ui/react-toast` | 30m | Bundle size |
| 🟡 LOW | Create localStorage abstraction layer | 2-3h | Testability |
| 🟡 LOW | Split large `legal-context.ts` file | 2-4h | Readability |
| 🟡 LOW | Move inactivity timer to custom hook | 1h | Code organization |

### 5.2 Testing Improvements

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 HIGH | Add tests for `useChatAPI` hook | 2-3h | Critical path testing |
| 🔴 HIGH | Add tests for `StreamingService` | 2-3h | Critical path testing |
| 🟠 MED | Add tests for page components | 3-4h | Regression prevention |
| 🟠 MED | Add Supabase function integration tests | 3-4h | Backend validation |
| 🟡 LOW | Increase overall coverage to 70% | 4-6h | Quality metrics |

### 5.3 Performance Optimizations

| Priority | Item | Potential Savings |
|----------|------|-------------------|
| 🟡 LOW | Remove duplicate tools/utilities | ~3KB gzipped |
| 🟡 LOW | Code split legal-context.ts | Dynamic loading benefit |
| 🟡 LOW | Lazy-load PDF.js worker | ~50KB conditional |

### 5.4 Architecture Improvements

| Priority | Improvement | Benefits |
|----------|-------------|----------|
| 🟠 MED | Move legal context to database | Dynamic updates, faster load |
| 🟠 MED | Create utility library for shared code | DRY principle, easier updates |
| 🟠 MED | Implement proper auth for premium | Security, scalability |
| 🟡 LOW | Add API response caching | Better performance |
| 🟡 LOW | Implement request deduplication | Fewer API calls |

---

## 6. CODE PATTERNS & ANTI-PATTERNS

### 6.1 Good Patterns Found

✅ **Proper Error Handling**:
```typescript
// In useChatAPI.ts
if (isRateLimitError(error)) {
  toast.error('Przekroczono limit zapytań...');
}
```

✅ **Retry Logic with Exponential Backoff**:
```typescript
// In retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
)
```

✅ **Type-Safe Environment Variables**:
```typescript
// In integrations/supabase/client.ts
const envSchema = z.object({...})
const env = validateEnv()
```

✅ **Zustand Persistence**:
```typescript
// In store/chatStore.ts
persist((set) => ({...}), {
  name: 'chat-storage',
  partialize: (state) => ({ messages: state.messages })
})
```

✅ **Service Layer Separation**:
```typescript
// StreamingService encapsulates API communication
export class StreamingService { ... }
```

### 6.2 Anti-Patterns Found

❌ **Console Logging in Production Code**:
```typescript
// FileUpload.tsx
console.log('📄 Starting PDF parsing...');
console.error('❌ PDF parsing error:', pdfError);
```

❌ **Magic Strings Scattered**:
```typescript
// Multiple files
localStorage.getItem('session_id')
localStorage.setItem(PREMIUM_KEY, 'true')
// Should be centralized
```

❌ **Mixed Concerns**:
```typescript
// Index.tsx mixes UI, state management, API calls, and business logic
const handleClearChat = () => {
  clearMessages();
  setAttachedFile(null);
  setShowClearDialog(false);
  toast.success('...');
}
```

❌ **Repeated Patterns**:
```typescript
// Same article detection regex appears in multiple places
// Should be extracted to utility
```

---

## 7. COMMENTED CODE & TODO ANALYSIS

### Found TODOs:
1. **usePremium.ts:6** - TODO: Move to backend authentication with JWT tokens
2. **usePremium.ts:13** - TODO: Remove hardcoded password

### No significant commented-out code found (good!)

---

## 8. CONFIGURATION & BUILD SETUP

### 8.1 Configuration Files Review

**TypeScript Config** (`tsconfig.json`):
- ✅ Strict null checks enabled
- ✅ No implicit any
- ✅ Strict function types
- ⚠️ `noUnusedLocals` and `noUnusedParameters` disabled (cosmetic)

**Vite Config** (`vite.config.ts`):
- ✅ React SWC plugin (fast transpilation)
- ✅ Path alias configured (@/)
- ✅ Proper server configuration

**Vitest Config** (`vitest.config.ts`):
- ✅ jsdom environment for React components
- ✅ Setup files configured
- ✅ Coverage provider configured
- ✅ Proper excludes for Supabase functions (Deno)

**ESLint Config** (`eslint.config.js`):
- ✅ TypeScript support
- ✅ React hooks rules
- ✅ React Refresh rules
- ⚠️ `@typescript-eslint/no-unused-vars` is disabled (should be enabled)

**Tailwind Config** (`tailwind.config.ts`):
- ✅ Custom colors for user/assistant messages
- ✅ Custom animations (float, shimmer)
- ✅ Dark mode support
- ✅ Custom shadows and gradients

### 8.2 GitHub Actions CI/CD

**test.yml**:
- ✅ Runs on all branches
- ✅ Node.js 20 cache configured
- ✅ Coverage report generation
- ✅ Artifact upload for coverage

**deploy-supabase.yml**:
- ✅ Triggered on main/master push
- ✅ Manual workflow dispatch
- ✅ Migrations and functions deployment
- ⚠️ `continue-on-error: true` might hide failures

---

## 9. RECOMMENDATIONS SUMMARY

### Quick Wins (< 1 hour each)
1. Remove `use-mobile.tsx` (unused)
2. Remove `@radix-ui/react-toast` from dependencies
3. Add `@typescript-eslint/no-unused-vars: warn` to ESLint
4. Create storage keys constant file

### Medium Priority (1-3 hours each)
1. Replace all `console.*` with logger utility
2. Remove hardcoded premium password
3. Consolidate duplicate logger implementations
4. Merge rate limiting implementations
5. Add tests for critical hooks (useChatAPI, StreamingService)

### Important for Scalability (2-6 hours)
1. Move legal context to database
2. Create localStorage abstraction layer
3. Implement proper JWT-based premium auth
4. Add integration tests for Supabase functions
5. Split large `legal-context.ts` file

### Nice to Have
1. Move inactivity timer to custom hook
2. Extract article detection to shared utility
3. Implement request deduplication
4. Add API response caching

---

## 10. CONCLUSION

The **JakiePrawo.pl** codebase demonstrates solid engineering practices with a clear architecture, proper separation of concerns, and good use of modern React patterns. The application is production-ready and handles complex requirements like streaming responses, PII detection, and PDF parsing.

**Key Strengths**:
- Well-organized file structure
- Type-safe with TypeScript
- Good test coverage for core components
- Proper error handling and retry logic
- Clear separation between frontend, backend, and services

**Key Areas for Improvement**:
- Code duplication (logger, retry, rate limiting)
- Incomplete authentication system (hardcoded password)
- Scattered localStorage usage
- Large monolithic legal context file
- Missing tests for critical hooks and services

**Priority Fix**: Remove hardcoded password and consolidate duplicate implementations. These will improve both security and maintainability.

Overall Rating: **7.5/10**
- Functionality: 8/10
- Code Quality: 7/10
- Test Coverage: 6/10
- Security: 7/10
- Performance: 7.5/10
- Maintainability: 7/10

