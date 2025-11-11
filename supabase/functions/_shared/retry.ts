/**
 * Retry utility for Deno environment (Supabase Edge Functions)
 * Provides exponential backoff with jitter for resilient API calls
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: () => true,
};

/**
 * Wait for a specified duration
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Calculate delay with exponential backoff and jitter
 */
export const calculateDelay = (
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number = 10000
): number => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);

  // Add jitter (random 0-1000ms) to prevent thundering herd
  const jitter = Math.random() * 1000;

  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelayMs);
};

/**
 * Execute a function with retry logic
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => fetch('/api/data'),
 *   { maxRetries: 3, baseDelayMs: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (!opts.shouldRetry?.(lastError)) {
        throw lastError;
      }

      // Last attempt - throw error
      if (attempt === opts.maxRetries - 1) {
        console.error(`[RETRY] Failed after ${opts.maxRetries} attempts:`, lastError.message);
        throw lastError;
      }

      // Calculate delay and wait
      const delayMs = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
      console.warn(
        `[RETRY] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${Math.round(delayMs)}ms...`,
        lastError.message
      );

      opts.onRetry?.(attempt + 1, lastError);

      await delay(delayMs);
    }
  }

  // TypeScript needs this, but we'll never reach here
  throw lastError!;
}

/**
 * Check if error is retryable (network errors, 5xx, timeouts)
 */
export const isRetryableError = (error: Error): boolean => {
  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  ) {
    return true;
  }

  // HTTP status errors
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true;
  }

  return false;
};
