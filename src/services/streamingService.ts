/**
 * Streaming Service
 * Handles SSE (Server-Sent Events) streaming from legal-assistant API
 * Extracted from Index.tsx for better maintainability
 */

import { streamLogger as logger } from '@/lib/logger';
import { withRetry, isRetryableError, isRateLimitError } from '@/lib/retry';
import { CONSTANTS } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

export interface StreamOptions {
  message: string;
  fileContext?: string | null;
  sessionId: string;
  messageId: string;
  usePremiumModel: boolean;
}

export interface StreamCallbacks {
  onMessageStart: () => void;
  onContentDelta: (content: string) => void;
  onMessageComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
}

export class StreamingService {
  private supabaseUrl: string;
  private anonKey: string;
  private cacheEnabled: boolean;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    // Enable cache by default, can be disabled via env variable
    this.cacheEnabled = import.meta.env.VITE_ENABLE_SEMANTIC_CACHE !== 'false';
  }

  /**
   * Check semantic cache for similar questions
   */
  private async checkSemanticCache(
    question: string,
    hasFileContext: boolean
  ): Promise<{ found: boolean; cached?: any }> {
    if (!this.cacheEnabled) {
      logger.debug('Semantic cache disabled');
      return { found: false };
    }

    // Don't use cache for questions with file context (they're too specific)
    if (hasFileContext) {
      logger.debug('Skipping cache check for question with file context');
      return { found: false };
    }

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/semantic-cache?action=check`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            question,
            similarityThreshold: 0.85, // 85% similarity required
          }),
        }
      );

      if (!response.ok) {
        logger.warn('Cache check failed:', response.status);
        return { found: false };
      }

      const result = await response.json();
      if (result.found) {
        logger.info('Cache hit! Similarity:', result.cached.similarity.toFixed(3));
      } else {
        logger.debug('Cache miss - no similar question found');
      }

      return result;
    } catch (error) {
      logger.warn('Cache check error (continuing without cache):', error);
      return { found: false };
    }
  }

  /**
   * Save response to semantic cache
   */
  private async saveToSemanticCache(
    question: string,
    answer: string,
    modelUsed: string,
    hasFileContext: boolean,
    sessionId: string
  ): Promise<void> {
    if (!this.cacheEnabled || hasFileContext) {
      return;
    }

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/semantic-cache?action=save`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            question,
            answer,
            modelUsed,
            hasFileContext,
            sessionId,
          }),
        }
      );

      if (response.ok) {
        logger.debug('Response saved to cache successfully');
      } else {
        logger.warn('Failed to save to cache:', response.status);
      }
    } catch (error) {
      logger.warn('Cache save error (non-critical):', error);
    }
  }

  /**
   * Send message and stream response
   */
  async streamMessage(
    options: StreamOptions,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const { message, fileContext, sessionId, messageId, usePremiumModel } = options;

    logger.debug('Streaming message:', {
      messageLength: message.length,
      hasFileContext: !!fileContext,
      sessionId,
      messageId,
      usePremiumModel,
    });

    // Check semantic cache first
    const cacheResult = await this.checkSemanticCache(message, !!fileContext);

    if (cacheResult.found) {
      // Use cached response
      const cachedAnswer = cacheResult.cached.answer;
      const cacheNotice = `🔄 *Odpowiedź z cache (podobieństwo: ${(cacheResult.cached.similarity * 100).toFixed(1)}%)*\n\n`;

      callbacks.onMessageStart();
      callbacks.onContentDelta(cacheNotice + cachedAnswer);
      callbacks.onMessageComplete(cacheNotice + cachedAnswer);

      logger.info('Served cached response, skipping API call');
      return;
    }

    // Get auth headers
    const headers = await this.getAuthHeaders();

    // Make request with retry
    await withRetry(
      async () => {
        const response = await fetch(
          `${this.supabaseUrl}/functions/v1/legal-assistant`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              message,
              fileContext: fileContext || null,
              sessionId,
              messageId,
              usePremiumModel,
            }),
          }
        );

        // Handle errors
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          const errorMessage = errorData.error || `HTTP error ${response.status}`;

          logger.error('API Error:', {
            status: response.status,
            message: errorMessage,
            details: errorData.details,
          });

          throw new Error(errorMessage);
        }

        // Process streaming response
        const fullResponse = await this.processStream(response, callbacks);

        // Save response to semantic cache (async, non-blocking)
        const modelUsed = usePremiumModel
          ? 'claude-sonnet-4-20250514'
          : 'claude-haiku-4-5-20251001';
        this.saveToSemanticCache(
          message,
          fullResponse,
          modelUsed,
          !!fileContext,
          sessionId
        ).catch((error) => {
          logger.warn('Failed to save to cache (non-critical):', error);
        });
      },
      {
        maxRetries: CONSTANTS.API.MAX_RETRIES,
        baseDelayMs: CONSTANTS.API.RETRY_DELAY_BASE_MS,
        shouldRetry: (error) => {
          // Don't retry rate limit errors (already handled by API)
          if (isRateLimitError(error)) {
            return false;
          }
          return isRetryableError(error);
        },
      }
    );
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.anonKey,
    };

    // If user is authenticated, use their token
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      // Otherwise use anon key
      headers['Authorization'] = `Bearer ${this.anonKey}`;
    }

    return headers;
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(
    response: Response
  ): Promise<{ error?: string; details?: string }> {
    try {
      return await response.json();
    } catch (e) {
      logger.error('Failed to parse error response:', e);
      return {};
    }
  }

  /**
   * Process SSE stream
   */
  private async processStream(
    response: Response,
    callbacks: StreamCallbacks
  ): Promise<string> {
    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('text/event-stream')) {
      // Fallback: regular JSON response
      logger.info('Using fallback JSON response');
      const data = await response.json();

      if (data?.message) {
        callbacks.onMessageStart();
        callbacks.onContentDelta(data.message);
        callbacks.onMessageComplete(data.message);
        return data.message;
      } else {
        throw new Error('Brak odpowiedzi');
      }
    }

    // SSE streaming
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let streamedContent = '';

    callbacks.onMessageStart();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          logger.debug('Stream ended. Total content length:', streamedContent.length);

          if (!streamedContent) {
            throw new Error('Brak odpowiedzi');
          }

          callbacks.onMessageComplete(streamedContent);
          break;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix

            // Skip [DONE] marker
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Anthropic streaming format
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                streamedContent += parsed.delta.text;
                callbacks.onContentDelta(streamedContent);
              } else if (parsed.type === 'content_block_start') {
                logger.debug('Content block started');
              } else if (parsed.type === 'message_start') {
                logger.debug('Message started');
              }
            } catch (e) {
              // Ignore JSON parse errors for malformed chunks
              logger.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (streamError) {
      logger.error('Stream reading error:', streamError);
      throw streamError;
    }

    return streamedContent;
  }
}
