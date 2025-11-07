/**
 * Rate Limiting Middleware for Supabase Edge Functions
 *
 * Implementuje ochronę przed spamem i nadużyciami API poprzez:
 * - Limit 10 zapytań na minutę per IP
 * - In-memory storage z automatycznym czyszczeniem
 * - Zwraca status 429 przy przekroczeniu limitu
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage dla rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Konfiguracja
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX_REQUESTS = 10; // max 10 zapytań na minutę

/**
 * Czyści wygasłe wpisy z pamięci (automatyczne odśmiecanie)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Pobiera IP address z request
 */
function getClientIP(req: Request): string {
  // Próbuj pobrać prawdziwy IP z różnych headerów
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For może zawierać wiele IP (client, proxy1, proxy2...)
    // Bierzemy pierwszy (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - nie powinno się zdarzyć w Supabase Edge Functions
  return 'unknown';
}

/**
 * Sprawdza czy request jest dozwolony (nie przekroczył limitu)
 *
 * @param req - Request object
 * @returns true jeśli request jest dozwolony, false jeśli przekroczono limit
 */
export function checkRateLimit(req: Request): boolean {
  // Okresowe czyszczenie starych wpisów
  if (Math.random() < 0.1) { // 10% szans na cleanup przy każdym request
    cleanupExpiredEntries();
  }

  const clientIP = getClientIP(req);
  const now = Date.now();

  const entry = rateLimitStore.get(clientIP);

  if (!entry || now >= entry.resetTime) {
    // Brak wpisu lub wygasł - utwórz nowy
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return true;
  }

  // Wpis istnieje i jest aktualny
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Przekroczono limit
    return false;
  }

  // Zwiększ licznik
  entry.count++;
  return true;
}

/**
 * Zwraca Response z informacją o przekroczeniu limitu
 *
 * @param corsHeaders - CORS headers do dołączenia do response
 * @returns Response z status 429
 */
export function rateLimitExceededResponse(corsHeaders: Record<string, string> = {}): Response {
  return new Response(
    JSON.stringify({
      error: 'Przekroczono limit zapytań',
      message: `Możesz wysłać maksymalnie ${RATE_LIMIT_MAX_REQUESTS} zapytań na minutę. Spróbuj ponownie za chwilę.`,
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) // w sekundach
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000))
      }
    }
  );
}

/**
 * Middleware function do łatwego dodania rate limiting
 *
 * @example
 * ```typescript
 * serve(async (req) => {
 *   const corsHeaders = { ... };
 *
 *   // Sprawdź rate limit
 *   if (!checkRateLimit(req)) {
 *     return rateLimitExceededResponse(corsHeaders);
 *   }
 *
 *   // Kontynuuj normalną logikę...
 * });
 * ```
 */
