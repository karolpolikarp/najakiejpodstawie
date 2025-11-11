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

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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
        await this.processStream(response, callbacks);
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
   * Simulate streaming for non-SSE responses by chunking the content
   */
  private async simulateStreaming(
    content: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const chunkSize = 15; // characters per chunk
    const delayMs = 20; // milliseconds between chunks

    callbacks.onMessageStart();

    let streamedContent = '';
    for (let i = 0; i < content.length; i += chunkSize) {
      streamedContent += content.slice(i, i + chunkSize);
      callbacks.onContentDelta(streamedContent);

      // Add small delay to simulate streaming
      if (i + chunkSize < content.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    callbacks.onMessageComplete(streamedContent);
  }

  /**
   * Process SSE stream
   */
  private async processStream(
    response: Response,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('text/event-stream')) {
      // Fallback: regular JSON response with simulated streaming
      logger.info('Using fallback JSON response with simulated streaming');
      const data = await response.json();

      if (data?.message) {
        await this.simulateStreaming(data.message, callbacks);
      } else {
        throw new Error('Brak odpowiedzi');
      }

      return;
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
  }
}
