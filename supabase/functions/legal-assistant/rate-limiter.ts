import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_WINDOW: 10, // Maximum requests allowed per time window
  WINDOW_DURATION_MINUTES: 1,  // Time window in minutes
  CLEANUP_THRESHOLD_HOURS: 1,  // Clean up records older than this
};

/**
 * Check if the request should be rate limited
 * @param supabaseClient Supabase client with service role
 * @param identifier Session ID or IP address
 * @param endpoint Endpoint name (e.g., 'legal-assistant')
 * @returns { allowed: boolean, remaining: number, resetAt: Date | null, retryAfter?: number }
 */
export async function checkRateLimit(
  supabaseClient: SupabaseClient,
  identifier: string,
  endpoint: string = 'legal-assistant'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date | null;
  retryAfter?: number;
}> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_CONFIG.WINDOW_DURATION_MINUTES * 60 * 1000);

  try {
    // Get current request count within the time window
    const { data: existingRecords, error: fetchError } = await supabaseClient
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine (first request)
      console.error('Error fetching rate limit:', fetchError);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW - 1,
        resetAt: null,
      };
    }

    // Calculate current count
    const currentCount = existingRecords?.request_count || 0;

    // Check if limit exceeded
    if (currentCount >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      const resetAt = new Date(
        new Date(existingRecords.window_start).getTime() +
        RATE_LIMIT_CONFIG.WINDOW_DURATION_MINUTES * 60 * 1000
      );
      const retryAfter = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    // Update or create rate limit record
    if (existingRecords) {
      // Update existing record
      await supabaseClient
        .from('rate_limits')
        .update({
          request_count: currentCount + 1,
          updated_at: now.toISOString(),
        })
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString());
    } else {
      // Create new record
      await supabaseClient
        .from('rate_limits')
        .insert({
          identifier,
          endpoint,
          request_count: 1,
          window_start: now.toISOString(),
        });
    }

    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW - (currentCount + 1),
      resetAt: new Date(now.getTime() + RATE_LIMIT_CONFIG.WINDOW_DURATION_MINUTES * 60 * 1000),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On unexpected error, allow the request (fail open)
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: null,
    };
  }
}

/**
 * Clean up old rate limit records (call periodically)
 */
export async function cleanupOldRateLimits(supabaseClient: SupabaseClient): Promise<void> {
  const threshold = new Date(
    Date.now() - RATE_LIMIT_CONFIG.CLEANUP_THRESHOLD_HOURS * 60 * 60 * 1000
  );

  try {
    await supabaseClient
      .from('rate_limits')
      .delete()
      .lt('window_start', threshold.toISOString());
  } catch (error) {
    console.error('Failed to cleanup old rate limits:', error);
  }
}
