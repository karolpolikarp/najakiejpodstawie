/**
 * Application-wide constants
 * Centralized configuration for magic numbers and strings
 */

export const CONSTANTS = {
  /**
   * File upload configuration
   */
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    MAX_CONTENT_LENGTH: 50000,
    ALLOWED_TYPES: [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ] as const,
    ALLOWED_EXTENSIONS: ['.txt', '.pdf', '.doc', '.docx'] as const,
  },

  /**
   * API configuration
   */
  API: {
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE_MS: 1000, // Base delay for exponential backoff
    TIMEOUT_MS: 30000,
  },

  /**
   * Local storage keys
   */
  STORAGE: {
    CHAT_KEY: 'chat-storage',
    AUTH_KEY: 'app_authenticated',
  },

  /**
   * Edge Function configuration
   * Note: These should match the Edge Function settings
   */
  EDGE_FUNCTION: {
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
    MODEL: 'claude-3-5-haiku-20241022' as const,
    FILE_CONTEXT_LIMIT: 30000,
  },

  /**
   * UI configuration
   */
  UI: {
    TOAST_DURATION_MS: 3000,
    COPY_FEEDBACK_DURATION_MS: 2000,
    DEBOUNCE_DELAY_MS: 300,
  },
} as const;

/**
 * Type-safe access to constant values
 */
export type Constants = typeof CONSTANTS;
